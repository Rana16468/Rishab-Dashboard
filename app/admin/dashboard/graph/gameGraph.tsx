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

// Month names for mapping
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];

export default function GameGraph() {
  const [gameData, setGameData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedGameMode, setSelectedGameMode] = useState("UOT");

  // Fetch game data
  const fetchGameData = async (
    year: string = "2026",
    gameMode: string = "UOT",
  ) => {
    try {
      setChartLoading(true);

      const response = await dashboardApi.gameGraph(year, gameMode);

      if (response.success) {
        setGameData(response.data);
      } else {
      }
    } catch (error) {
      //
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData(selectedYear, selectedGameMode);
  }, [selectedYear, selectedGameMode]);

  // Transform monthly data for charts
  const getMonthlyChartData = () => {
    if (!gameData?.monthlyStats) return [];

    return gameData.monthlyStats.map((stat: any) => ({
      month: monthNames[stat.month - 1] || `Month ${stat.month}`,
      sessions: stat.totalSessions,
      accuracy: stat.accuracyRate,
      users: stat.totalUniqueUsers,
      hints: stat.totalHintsUsed,
    }));
  };

  // Get performance data for pie chart
  const getPerformanceData = () => {
    if (!gameData) return [];

    return [
      { name: "Correct Clicks", value: gameData.totalCorrectClicks },
      { name: "Wrong Clicks", value: gameData.totalWrongClicks },
    ];
  };

  const monthlyChartData = getMonthlyChartData();
  const performanceData = getPerformanceData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Game Statistics</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-3 h-3 rounded-full ${activeTabBG}`}></span>
              <span className="text-sm text-gray-500">
                Game Performance Analytics
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedGameMode}
              onChange={(e) => setSelectedGameMode(e.target.value)}
              className={`${activeTabBG} text-gray-200 px-4 py-2 rounded-lg text-sm border-none outline-none cursor-pointer`}
            >
              <option value="UOT">UOT</option>
              <option value="VF">VF</option>
              <option value="OC">OC</option>
            </select>
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
        </div>

        {/* Stats Cards */}
        {gameData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {gameData.totalSessions}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Accuracy Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {gameData.overallAccuracy}%
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Correct Clicks</p>
              <p className="text-2xl font-bold text-blue-600">
                {gameData.totalCorrectClicks}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Yearly Growth</p>
              <p className="text-2xl font-bold text-orange-600">
                {gameData.yearlyGrowth}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Sessions & Accuracy Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Sessions & Accuracy
          </h3>
          <div className="h-75">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : monthlyChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  No chart data available
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
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
                    dataKey="sessions"
                    name="Sessions"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="users"
                    name="Unique Users"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Performance Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Click Performance
          </h3>
          <div className="h-75">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : performanceData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  No chart data available
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData}
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
                    {performanceData.map((entry, index) => (
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

        {/* Accuracy Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Accuracy Trend
          </h3>
          <div className="h-75">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : monthlyChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  No chart data available
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
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
                    dataKey="accuracy"
                    name="Accuracy Rate (%)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hints"
                    name="Hints Used"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
