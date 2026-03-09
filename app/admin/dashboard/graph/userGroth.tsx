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

export default function UserGrowth() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2026");

  // Fetch chart data
  const fetchChartData = async (year: string = "2026") => {
    try {
      setChartLoading(true);
      console.log(`Fetching chart data for year ${year}...`);

      const response = await dashboardApi.userGraph();
      console.log("Chart API response:", response);

      if (response.success) {
        console.log("Chart API successful, data:", response.data);
        const monthlyStats = response.data.monthlyStats;

        // Filter by selected year and transform data for chart
        const filteredStats = monthlyStats.filter(
          (stat: any) => stat.year.toString() === year,
        );
        const transformedData = filteredStats.map((stat: any) => ({
          month: monthNames[stat.month - 1] || `Month ${stat.month}`,
          users: stat.count || 0,
        }));

        console.log("Filtered and transformed chart data:", transformedData);
        setChartData(transformedData);
      } else {
        console.log("Chart API failed:", response.message);
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(selectedYear);
  }, [selectedYear]);

  return (
    /* Chart Section */
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Growth</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-3 h-3 rounded-full ${activeTabBG}`}></span>
            <span className="text-sm text-gray-500">New Users Per Month</span>
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

      {/* Recharts Bar Chart */}
      <div className="w-full h-[350px]">
        {chartLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center">
              No chart data available
              <br />
              <span className="text-sm">Try selecting a different year</span>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
                labelStyle={{ color: "#111827", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
              <Bar
                dataKey="users"
                name="New Users"
                fill={activeTabBG.replace("bg-", "#").replace("500", "600")}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
