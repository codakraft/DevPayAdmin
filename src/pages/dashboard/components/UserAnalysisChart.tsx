import React from "react";
import "./UserAnalysisChart.css";

interface UserAnalysisChartProps {
  timeFilter: "month" | "year";
  data: any;
}

const UserAnalysisChart: React.FC<UserAnalysisChartProps> = ({
  timeFilter,
  data,
}) => {
  // Different gender distribution data based on time filter
  const userData = {
    month: {
      malePercentage: data?.malePercentage,
      femalePercentage: data?.femalePercentage,
    },
    year: {
      malePercentage: data?.malePercentage,
      femalePercentage: data?.femalePercentage,
    },
  };

  const { malePercentage, femalePercentage } = userData[timeFilter];

  // Calculate the dominant percentage for the donut center display
  const dominantPercentage = Math.max(malePercentage, femalePercentage);
  const dominantGender = malePercentage > femalePercentage ? "male" : "female";

  return (
    <div className="user-analysis-chart">
      <div className="donut-chart">
        <div className="donut-hole">
          <span>{Math.round(dominantPercentage)}%</span>
          <small>{dominantGender === "male" ? "Male" : "Female"}</small>
        </div>
      </div>

      <div className="gender-legend">
        <div className="gender-item">
          <div className="gender-marker male"></div>
          <span className="gender-label">Male</span>
          <span className="gender-value">{malePercentage?.toFixed(1)}%</span>
        </div>
        <div className="gender-item">
          <div className="gender-marker female"></div>
          <span className="gender-label">Female</span>
          <span className="gender-value">{femalePercentage?.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default UserAnalysisChart;
