import React, { useRef, useEffect, useMemo } from "react";
import "./AnalyticsChart.css";

interface DataPoint {
  month: string;
  disbursed: number;
  requested: number;
}

interface AnalyticsChartProps {
  timeFilter: "month" | "year";
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ timeFilter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Data for monthly view wrapped in useMemo to prevent re-creation on each render
  const monthlyData = useMemo<DataPoint[]>(
    () => [
      { month: "JAN", disbursed: 12000000, requested: 18000000 },
      { month: "FEB", disbursed: 15000000, requested: 22000000 },
      { month: "MAR", disbursed: 18500000, requested: 25000000 },
      { month: "APR", disbursed: 22000000, requested: 29000000 },
      { month: "MAY", disbursed: 24500000, requested: 28000000 },
      { month: "JUN", disbursed: 28000000, requested: 31000000 },
      { month: "JUL", disbursed: 26000000, requested: 30000000 },
      { month: "AUG", disbursed: 32000000, requested: 38000000 },
      { month: "SEP", disbursed: 30000000, requested: 36000000 },
      { month: "OCT", disbursed: 35000000, requested: 42000000 },
      { month: "NOV", disbursed: 38000000, requested: 45000000 },
      { month: "DEC", disbursed: 40000000, requested: 48000000 },
    ],
    []
  );

  // Data for yearly view wrapped in useMemo
  const yearlyData = useMemo<DataPoint[]>(
    () => [
      { month: "2020", disbursed: 80000000, requested: 120000000 },
      { month: "2021", disbursed: 150000000, requested: 200000000 },
      { month: "2022", disbursed: 220000000, requested: 280000000 },
      { month: "2023", disbursed: 290000000, requested: 350000000 },
      { month: "2024", disbursed: 350000000, requested: 420000000 },
      { month: "2025", disbursed: 400000000, requested: 480000000 },
    ],
    []
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Select appropriate data based on timeFilter
    const data = timeFilter === "month" ? monthlyData : yearlyData;
    const labels = data.map((item) => item.month);
    const divisions = data.length;

    // Grid lines (light)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(229, 231, 235, 0.5)";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let y = 0; y < height; y += height / 6) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    // Vertical grid lines
    for (let i = 0; i <= divisions; i++) {
      const x = (width / divisions) * i;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();

    // Get max value for scaling
    const maxValue = Math.max(
      ...data.map((item) => Math.max(item.disbursed, item.requested))
    );

    // Function to normalize data point to canvas height (inverted Y-axis)
    const normalizeY = (value: number) => {
      return height - (value / maxValue) * (height * 0.8);
    };

    // Draw disbursed loans line (green)
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = (width / divisions) * index + width / divisions / 2;
      const y = normalizeY(point.disbursed);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw loan requests line (red)
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = (width / divisions) * index + width / divisions / 2;
      const y = normalizeY(point.requested);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = "#FF5252";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data point highlights
    const highlightIndex = Math.floor(data.length / 2);
    const highlightX =
      (width / divisions) * highlightIndex + width / divisions / 2;
    const highlightY = normalizeY(data[highlightIndex].disbursed);

    // Draw point marker
    ctx.beginPath();
    ctx.arc(highlightX, highlightY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();

    // Draw data label
    ctx.fillStyle = "#fff";
    ctx.fillRect(highlightX - 40, highlightY - 30, 80, 20);

    ctx.font = "12px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText(
      "₦" + (data[highlightIndex].disbursed / 1000000).toFixed(1) + "M",
      highlightX,
      highlightY - 16
    );

    // Draw x-axis labels
    ctx.fillStyle = "#6B7280";
    ctx.font = "10px Arial";

    labels.forEach((label, i) => {
      const x = (width / divisions) * i + width / divisions / 2;
      ctx.fillText(label, x, height - 5);
    });

    // Draw Y-axis labels
    const getValueLabel = (value: number) => {
      if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + "B";
      } else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "M";
      } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + "k";
      }
      return value.toString();
    };

    const ySteps = 6;
    for (let i = 0; i <= ySteps; i++) {
      const value = (maxValue / ySteps) * i;
      const y = height - height * 0.8 * (i / ySteps) - height * 0.1;
      ctx.textAlign = "right";
      ctx.fillText(getValueLabel(value), 30, y);
    }
  }, [timeFilter, monthlyData, yearlyData]); // Rerun when timeFilter or data changes

  return (
    <div className="analytics-chart">
      <canvas ref={canvasRef} width="700" height="250"></canvas>
    </div>
  );
};

export default AnalyticsChart;
