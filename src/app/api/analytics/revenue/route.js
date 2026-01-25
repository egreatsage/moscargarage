// src/app/api/analytics/revenue/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

// GET revenue analytics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admin can access revenue analytics
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all'; // all, year, month, week
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : new Date().getFullYear();
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : new Date().getMonth() + 1;

    // Build date filter based on timeframe
    let dateFilter = {};
    const now = new Date();

    switch (timeframe) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: weekStart } };
        break;

      case 'month':
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
        dateFilter = { 
          createdAt: { 
            $gte: monthStart,
            $lte: monthEnd 
          } 
        };
        break;

      case 'year':
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
        dateFilter = { 
          createdAt: { 
            $gte: yearStart,
            $lte: yearEnd 
          } 
        };
        break;

      case 'all':
      default:
        dateFilter = {}; // No date filter
        break;
    }

    // Base match condition: only paid bookings
    const baseMatch = {
      ...dateFilter,
      paymentStatus: 'paid',
      status: { $ne: 'cancelled' }
    };

    // 1. Total Revenue Summary
    const revenueSummary = await Booking.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // 2. Revenue by Service (Service Popularity)
    const revenueByService = await Booking.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$service',
          totalRevenue: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 },
          averagePrice: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $unwind: '$serviceDetails' },
      {
        $project: {
          _id: 1,
          serviceName: '$serviceDetails.name',
          category: '$serviceDetails.category',
          totalRevenue: 1,
          bookingCount: 1,
          averagePrice: { $round: ['$averagePrice', 2] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // 3. Monthly Revenue Breakdown (for current year or specified year)
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59, 999)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          revenue: 1,
          bookings: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Fill in missing months with zero revenue
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyRevenue.find(m => m.month === i + 1);
      return {
        month: i + 1,
        monthName: new Date(2000, i, 1).toLocaleString('default', { month: 'short' }),
        revenue: monthData?.revenue || 0,
        bookings: monthData?.bookings || 0
      };
    });

    // 4. Weekly Revenue (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const weeklyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: eightWeeksAgo }
        }
      },
      {
        $group: {
          _id: { 
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          weekStart: { $min: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          week: '$_id.week',
          year: '$_id.year',
          revenue: 1,
          bookings: 1,
          weekStart: 1
        }
      },
      { $sort: { year: 1, week: 1 } },
      { $limit: 8 }
    ]);

    // 5. Revenue by Status (to see completion rates)
    const revenueByStatus = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'paid'] },
                '$totalAmount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 6. Top Customers by Revenue
    const topCustomers = await Booking.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          name: '$userDetails.name',
          email: '$userDetails.email',
          totalSpent: 1,
          bookingCount: 1,
          averageBookingValue: { $round: [{ $divide: ['$totalSpent', '$bookingCount'] }, 2] }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // 7. Payment Status Distribution
    const paymentDistribution = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          totalAmount: 1
        }
      }
    ]);

    // 8. Revenue Growth (compare with previous period)
    let revenueGrowth = null;
    if (timeframe === 'month') {
      const prevMonthStart = new Date(year, month - 2, 1);
      const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);
      
      const prevMonthRevenue = await Booking.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            status: { $ne: 'cancelled' },
            createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]);

      const currentRevenue = revenueSummary[0]?.totalRevenue || 0;
      const previousRevenue = prevMonthRevenue[0]?.revenue || 0;
      const growthPercentage = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      revenueGrowth = {
        current: currentRevenue,
        previous: previousRevenue,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
        growthAmount: currentRevenue - previousRevenue
      };
    }

    // Compile response
    const response = {
      success: true,
      data: {
        summary: {
          totalRevenue: revenueSummary[0]?.totalRevenue || 0,
          totalBookings: revenueSummary[0]?.totalBookings || 0,
          averageBookingValue: Math.round((revenueSummary[0]?.averageBookingValue || 0) * 100) / 100
        },
        timeframe,
        period: timeframe === 'month' 
          ? `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
          : timeframe === 'year' 
          ? `${year}`
          : timeframe === 'week'
          ? 'Current Week'
          : 'All Time',
        servicePopularity: revenueByService,
        monthlyRevenue: monthlyData,
        weeklyRevenue,
        revenueByStatus,
        topCustomers,
        paymentDistribution,
        revenueGrowth
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while fetching revenue data' },
      { status: 500 }
    );
  }
}