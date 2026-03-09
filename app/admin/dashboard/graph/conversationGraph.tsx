"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { activeTabBG } from "@/contexts/theme";
import dashboardApi from "@/redux/Api/dashboardApi";

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

export default function ConversationGraph() {
  const [conversationData, setConversationData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2026");

  // Fetch conversation data
  const fetchConversationData = async (year: string = "2026") => {
    try {
      setChartLoading(true);

      const response = await dashboardApi.conversationGraph(year);

      if (response.success) {
        setConversationData(response.data);
      } else {
        //
      }
    } catch (error) {
      //
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchConversationData(selectedYear);
  }, [selectedYear]);

  // Transform chart data for visualization
  const getChartData = () => {
    if (!conversationData?.chartData) return [];

    return conversationData.chartData.labels.map(
      (label: string, index: number) => ({
        month: label,
        conversations: conversationData.chartData.totalConversations[index],
        uniqueUsers: conversationData.chartData.uniqueUsers[index],
        icopeTriggers: conversationData.chartData.icopeTriggers[index],
        distressCases: conversationData.chartData.distressCases[index],
      }),
    );
  };

  // Get ICope vs Non-ICope data for pie chart
  const getIcopeData = () => {
    if (!conversationData?.summary) return [];

    const icopeTrue = conversationData.summary.totalIcopeTriggers;
    const icopeFalse = conversationData.summary.totalConversations - icopeTrue;

    return [
      { name: "ICope Triggered", value: icopeTrue },
      { name: "Non-ICope", value: icopeFalse },
    ];
  };

  // Get Distress vs Non-Distress data for pie chart
  const getDistressData = () => {
    if (!conversationData?.summary) return [];

    const distressTrue = conversationData.summary.totalDistressCases;
    const distressFalse =
      conversationData.summary.totalConversations - distressTrue;

    return [
      { name: "Distress Cases", value: distressTrue },
      { name: "Non-Distress", value: distressFalse },
    ];
  };

  const chartData = getChartData();
  const icopeData = getIcopeData();
  const distressData = getDistressData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Conversation Analytics
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-3 h-3 rounded-full ${activeTabBG}`}></span>
              <span className="text-sm text-gray-500">
                Conversation Growth & Insights
              </span>
            </div>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={`${activeTabBG} text-gray-200 px-4 py-2 rounded-lg text-sm border-none outline-none cursor-pointer`}
          >
            <option value="2030">Year-2030</option>
            <option value="2029">Year-2029</option>
            <option value="2028">Year-2028</option>
            <option value="2027">Year-2027</option>
            <option value="2026">Year-2026</option>
            <option value="2025">Year-2025</option>
            <option value="2024">Year-2024</option>
            <option value="2023">Year-2023</option>
          </select>
        </div>

        {/* Stats Cards */}
        {conversationData?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversationData.summary.totalConversations}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Unique Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {conversationData.summary.totalUniqueUsers}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">ICope Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {conversationData.summary.overallIcopeRate}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Distress Rate</p>
              <p className="text-2xl font-bold text-red-600">
                {conversationData.summary.overallDistressRate}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Most Active Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {conversationData.summary.mostActiveMonth}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversations & Users Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Conversations & Users
          </h3>
          <div className="h-75">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  No chart data available
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="conversations"
                    name="Conversations"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="uniqueUsers"
                    name="Unique Users"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ICope vs Non-ICope Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ICope Analysis
          </h3>
          <div className="h-75">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : icopeData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  No chart data available
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={icopeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : "0"}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {icopeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ICope & Distress Trends Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ICope & Distress Trends
          </h3>
          <div className="h-75">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  No chart data available
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="icopeTriggers"
                    name="ICope Triggers"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="distressCases"
                    name="Distress Cases"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distress vs Non-Distress Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distress Analysis
          </h3>
          <div className="h-75">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : distressData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  No chart data available
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distressData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : "0"}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distressData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index + (2 % COLORS.length)]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
