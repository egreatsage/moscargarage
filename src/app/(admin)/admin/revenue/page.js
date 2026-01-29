'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  Package, 
  CreditCard,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Filter,
  Award,
  Printer
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import PrintableRevenueReport from './printablerevenureport/page';


const RevenueDashboard = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const componentRef = useRef(null);

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe, selectedYear, selectedMonth]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      let url = `/api/analytics/revenue?timeframe=${timeframe}`;
      
      if (timeframe === 'month') {
        url += `&year=${selectedYear}&month=${selectedMonth}`;
      } else if (timeframe === 'year') {
        url += `&year=${selectedYear}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setRevenueData(data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Revenue_Report_${revenueData?.period}_${new Date().toISOString().split('T')[0]}`,
    onBeforePrint: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500"
    };

    return (
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const { summary, servicePopularity, monthlyRevenue, weeklyRevenue, topCustomers, paymentDistribution, revenueGrowth, period } = revenueData;

  // Prepare data for charts
  const serviceChartData = servicePopularity.slice(0, 6).map(service => ({
    name: service.serviceName.length > 15 ? service.serviceName.substring(0, 15) + '...' : service.serviceName,
    revenue: service.totalRevenue,
    bookings: service.bookingCount
  }));

  const paymentPieData = paymentDistribution.map(payment => ({
    name: payment.status.replace('_', ' ').charAt(0).toUpperCase() + payment.status.slice(1).replace('_', ' '),
    value: payment.count,
    amount: payment.totalAmount
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Print Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-gray-600 mt-1">Track your business performance and insights</p>
          </div>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isPrinting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <Printer className="w-5 h-5" />
                <span>Print Report</span>
              </>
            )}
          </button>
        </div>

        {/* Hidden Printable Component */}
        <div style={{ display: 'none' }}>
          <PrintableRevenueReport 
            ref={componentRef}
            revenueData={revenueData}
            timeframe={timeframe}
            period={period}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Timeframe:</span>
            </div>
            
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option className='text-gray-800' value="week">This Week</option>
              <option className='text-gray-800' value="month">Monthly</option>
              <option className='text-gray-800' value="year">Yearly</option>
              <option className='text-gray-800' value="all">All Time</option>
            </select>

            {timeframe === 'month' && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </>
            )}

            {timeframe === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            )}

            <button
              onClick={fetchRevenueData}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            icon={DollarSign}
            color="blue"
            trend={revenueGrowth?.growthPercentage >= 0 ? 'up' : 'down'}
            trendValue={revenueGrowth ? `${Math.abs(revenueGrowth.growthPercentage).toFixed(1)}%` : null}
          />
          <StatCard
            title="Total Bookings"
            value={summary.totalBookings}
            icon={Calendar}
            color="green"
          />
          <StatCard
            title="Average Booking Value"
            value={formatCurrency(summary.averageBookingValue)}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Top Service Revenue"
            value={servicePopularity.length > 0 ? formatCurrency(servicePopularity[0].totalRevenue) : formatCurrency(0)}
            icon={Award}
            color="orange"
          />
        </div>

        {/* Revenue Growth Card */}
        {revenueGrowth && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Period-over-Period Growth</h3>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm opacity-90">Current Period</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueGrowth.current)}</p>
                  </div>
                  <div className="text-3xl opacity-75">→</div>
                  <div>
                    <p className="text-sm opacity-90">Previous Period</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueGrowth.previous)}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Growth</p>
                <p className="text-3xl font-bold">
                  {revenueGrowth.growthPercentage >= 0 ? '+' : ''}{revenueGrowth.growthPercentage.toFixed(1)}%
                </p>
                <p className="text-sm opacity-90">
                  {formatCurrency(Math.abs(revenueGrowth.growthAmount))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Revenue Area Chart */}
        {timeframe !== 'week' && monthlyRevenue && monthlyRevenue.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="monthName" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly Revenue Line Chart */}
        {timeframe === 'week' && weeklyRevenue && weeklyRevenue.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="week" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Week Number', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Service Popularity Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Service Revenue Performance</h2>
              <Package className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number"
                  stroke="#6B7280"
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  stroke="#6B7280"
                  style={{ fontSize: '11px' }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 8, 8, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Status Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment Status Distribution</h2>
              <CreditCard className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-semibold text-gray-900">{payload[0].name}</p>
                          <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
                          <p className="text-sm text-gray-600">Amount: {formatCurrency(payload[0].payload.amount)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Details Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Performance Details</h2>
            <Award className="w-5 h-5 text-gray-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bookings</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {servicePopularity.map((service, index) => (
                  <tr key={service._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{service.serviceName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {service.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">{service.bookingCount}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">{formatCurrency(service.averagePrice)}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(service.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topCustomers.slice(0, 6).map((customer, index) => (
              <div key={customer._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.bookingCount} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-xs text-gray-500">Avg: {formatCurrency(customer.averageBookingValue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;