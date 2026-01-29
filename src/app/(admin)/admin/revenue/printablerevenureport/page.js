'use client';
import React, { forwardRef } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PrintableRevenueReport = forwardRef(({ revenueData, timeframe, period }, ref) => {
  if (!revenueData) return null;

  const { 
    summary, 
    servicePopularity, 
    monthlyRevenue, 
    weeklyRevenue, 
    topCustomers, 
    paymentDistribution, 
    revenueGrowth 
  } = revenueData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div ref={ref} className="print-container">
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          .print-container {
            width: 100%;
            color: black;
            background: white;
          }

          .page-break {
            page-break-before: always;
          }

          .no-break {
            page-break-inside: avoid;
          }

          .print-hide {
            display: none !important;
          }
        }

        .print-container {
          font-family: 'Arial', sans-serif;
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          padding: 20px;
        }

        .report-header {
          text-align: center;
          border-bottom: 3px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .report-title {
          font-size: 28px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 8px;
        }

        .report-subtitle {
          font-size: 16px;
          color: #6B7280;
          margin-bottom: 4px;
        }

        .report-date {
          font-size: 12px;
          color: #9CA3AF;
        }

        .section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #E5E7EB;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 16px;
          background: #F9FAFB;
        }

        .stat-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1F2937;
        }

        .stat-trend {
          font-size: 13px;
          margin-top: 4px;
        }

        .trend-positive {
          color: #10B981;
        }

        .trend-negative {
          color: #EF4444;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }

        .table th {
          background: #F3F4F6;
          padding: 10px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #E5E7EB;
        }

        .table td {
          padding: 10px;
          font-size: 13px;
          color: #1F2937;
          border-bottom: 1px solid #E5E7EB;
        }

        .table tr:hover {
          background: #F9FAFB;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-rank {
          background: #DBEAFE;
          color: #1E40AF;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .badge-category {
          background: #E5E7EB;
          color: #374151;
        }

        .customer-card {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to right, #EFF6FF, #F5F3FF);
        }

        .customer-rank {
          width: 36px;
          height: 36px;
          background: linear-gradient(to bottom right, #3B82F6, #8B5CF6);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .customer-info {
          flex: 1;
          margin-left: 12px;
        }

        .customer-name {
          font-weight: 600;
          font-size: 14px;
          color: #1F2937;
        }

        .customer-bookings {
          font-size: 12px;
          color: #6B7280;
        }

        .customer-revenue {
          text-align: right;
        }

        .customer-total {
          font-weight: bold;
          font-size: 14px;
          color: #1F2937;
        }

        .customer-avg {
          font-size: 11px;
          color: #6B7280;
        }

        .chart-container {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: white;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          text-align: center;
          font-size: 11px;
          color: #9CA3AF;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
      `}</style>

      {/* Report Header */}
      <div className="report-header no-break">
        <div className="report-title">Revenue Analytics Report</div>
        <div className="report-subtitle">Period: {period}</div>
        <div className="report-date">Generated on {formatDate()}</div>
      </div>

      {/* Executive Summary */}
      <div className="section no-break">
        <h2 className="section-title">Executive Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(summary.totalRevenue)}</div>
            {revenueGrowth && (
              <div className={`stat-trend ${revenueGrowth.growthPercentage >= 0 ? 'trend-positive' : 'trend-negative'}`}>
                {revenueGrowth.growthPercentage >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth.growthPercentage).toFixed(1)}% vs previous period
              </div>
            )}
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{summary.totalBookings}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Booking Value</div>
            <div className="stat-value">{formatCurrency(summary.averageBookingValue)}</div>
          </div>
        </div>
      </div>

      {/* Revenue Growth Details */}
      {revenueGrowth && (
        <div className="section no-break">
          <h2 className="section-title">Period-over-Period Performance</h2>
          <div className="grid-2">
            <div className="stat-card">
              <div className="stat-label">Current Period Revenue</div>
              <div className="stat-value">{formatCurrency(revenueGrowth.current)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Previous Period Revenue</div>
              <div className="stat-value">{formatCurrency(revenueGrowth.previous)}</div>
            </div>
          </div>
          <div className="stat-card" style={{ marginTop: '15px' }}>
            <div className="stat-label">Revenue Change</div>
            <div className={`stat-value ${revenueGrowth.growthAmount >= 0 ? 'trend-positive' : 'trend-negative'}`}>
              {formatCurrency(Math.abs(revenueGrowth.growthAmount))} ({revenueGrowth.growthPercentage >= 0 ? '+' : ''}{revenueGrowth.growthPercentage.toFixed(2)}%)
            </div>
          </div>
        </div>
      )}

      {/* Monthly Revenue Chart */}
      {monthlyRevenue && monthlyRevenue.length > 0 && (
        <div className="section page-break">
          <h2 className="section-title">Monthly Revenue Trend</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" style={{ fontSize: '11px' }} />
                <YAxis 
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Monthly Revenue Table */}
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Bookings</th>
                <th className="text-right">Avg per Booking</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRevenue.map((month) => (
                <tr key={month.month}>
                  <td>{month.monthName}</td>
                  <td className="text-right">{formatCurrency(month.revenue)}</td>
                  <td className="text-right">{month.bookings}</td>
                  <td className="text-right">
                    {month.bookings > 0 ? formatCurrency(month.revenue / month.bookings) : formatCurrency(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Service Performance */}
      <div className="section page-break">
        <h2 className="section-title">Service Performance Analysis</h2>
        
        {/* Service Revenue Bar Chart */}
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={servicePopularity.slice(0, 8)}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number"
                style={{ fontSize: '11px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                type="category"
                dataKey="serviceName"
                style={{ fontSize: '10px' }}
                width={100}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="totalRevenue" fill="#3B82F6" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Service Table */}
        <table className="table">
          <thead>
            <tr>
              <th className="text-center">Rank</th>
              <th>Service Name</th>
              <th>Category</th>
              <th className="text-right">Bookings</th>
              <th className="text-right">Avg Price</th>
              <th className="text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {servicePopularity.map((service, index) => (
              <tr key={service._id}>
                <td className="text-center">
                  <span className="badge-rank">{index + 1}</span>
                </td>
                <td style={{ fontWeight: '600' }}>{service.serviceName}</td>
                <td>
                  <span className="badge badge-category">{service.category}</span>
                </td>
                <td className="text-right">{service.bookingCount}</td>
                <td className="text-right">{formatCurrency(service.averagePrice)}</td>
                <td className="text-right" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(service.totalRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Customers */}
      <div className="section page-break">
        <h2 className="section-title">Top Customers by Revenue</h2>
        <div>
          {topCustomers.slice(0, 10).map((customer, index) => (
            <div key={customer._id} className="customer-card no-break">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="customer-rank">{index + 1}</div>
                <div className="customer-info">
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-bookings">{customer.bookingCount} bookings</div>
                </div>
              </div>
              <div className="customer-revenue">
                <div className="customer-total">{formatCurrency(customer.totalSpent)}</div>
                <div className="customer-avg">Avg: {formatCurrency(customer.averageBookingValue)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Distribution */}
      <div className="section no-break">
        <h2 className="section-title">Payment Status Distribution</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Payment Status</th>
              <th className="text-right">Count</th>
              <th className="text-right">Total Amount</th>
              <th className="text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {paymentDistribution.map((payment) => {
              const totalCount = paymentDistribution.reduce((sum, p) => sum + p.count, 0);
              const percentage = (payment.count / totalCount) * 100;
              return (
                <tr key={payment.status}>
                  <td style={{ textTransform: 'capitalize' }}>
                    {payment.status.replace('_', ' ')}
                  </td>
                  <td className="text-right">{payment.count}</td>
                  <td className="text-right">{formatCurrency(payment.totalAmount)}</td>
                  <td className="text-right">{percentage.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Report Footer */}
      <div className="footer">
        <p>This report is confidential and intended for internal use only.</p>
        <p>© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </div>
    </div>
  );
});

PrintableRevenueReport.displayName = 'PrintableRevenueReport';

export default PrintableRevenueReport;