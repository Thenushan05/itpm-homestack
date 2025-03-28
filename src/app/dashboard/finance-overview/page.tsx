"use client";

import { Progress } from "antd";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../finance-overview/finance-overview.sass";
import "../../../sass/custom/index.sass";

const data = [
  { month: "Jan", expense: 400 },
  { month: "Feb", expense: 300 },
  { month: "Mar", expense: 500 },
  { month: "Apr", expense: 700 },
  { month: "May", expense: 600 },
  { month: "Jun", expense: 800 },
];

const databar = [
  { category: "Food", expense: 70, color: "#6A5ACD" }, // Purple
  { category: "Grocery", expense: 50, color: "#32CD32" }, // Green
  { category: "Inventory", expense: 60, color: "#FFD700" }, // Yellow
  { category: "Utilities", expense: 80, color: "#FF69B4" }, // Pink
  { category: "Others", expense: 30, color: "#DC143C" }, // Red
];

function FinanceOverview() {
  return (
    <div className="finance-overview-main primary-bg">
      <div className="cart-container ">
        <div className="budject-cart  primary-bg primary-border">
          <div className="cart-head primary-txt">
            <span>Monthly Budget</span>
          </div>
          <div className="progress-bar">
            <Progress
              type="dashboard"
              steps={8}
              percent={50}
              trailColor="rgba(222, 209, 209, 0.92)"
              strokeWidth={20}
            />
          </div>
        </div>

        <div className="budject-cart  primary-bg primary-border">
          <div className="cart-head primary-txt">
            <span>Monthly Expenses</span>
          </div>
          <div className="progress-bar">
            <Progress
              type="dashboard"
              steps={8}
              percent={65}
              trailColor="rgba(222, 209, 209, 0.92)"
              strokeWidth={20}
            />
          </div>
        </div>

        <div className="budject-cart  primary-bg primary-border">
          <div className="cart-head primary-txt">
            <span>Remaining Budget</span>
          </div>
          <div className="progress-bar">
            <Progress
              type="dashboard"
              steps={8}
              percent={30}
              trailColor="rgba(222, 209, 209, 0.92)"
              strokeWidth={20}
            />
          </div>
        </div>

        <div className="budject-cart  primary-bg primary-border">
          <div className="cart-head primary-txt">
            <span>Savings</span>
          </div>
          <div className="progress-bar">
            <Progress
              type="dashboard"
              steps={8}
              percent={80}
              trailColor="rgba(222, 209, 209, 0.92)"
              strokeWidth={20}
            />
          </div>
        </div>
      </div>
      <div className="graphs-container">
        <div className="bar-chart-container  primary-bg primary-border primary-txt">
          <h3>Monthly Expense Overview</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="expense" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="horizontal-progress-container  primary-bg primary-border">
          {databar.map((item) => (
            <div key={item.category} className="horizontal-progress">
              <div className="catogory">
                <span className="category-label primary-txt">
                  {item.category}
                </span>
                <span className="percent-label primary-txt">
                  {item.expense}%
                </span>
              </div>

              <Progress
                percent={item.expense}
                showInfo={false}
                strokeWidth={6}
                strokeColor={item.color}
                trailColor="rgba(0, 0, 0, 0.06)"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FinanceOverview;
