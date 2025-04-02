import React from "react";
import { Button } from "../../components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/card";
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
const percentageChange = 3.2;

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 primary-bg">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Button>New Report</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-bold mt-1">$45,231.89</h3>
                  <p className="text-sm text-green-500 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +20.1% from last month
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    New Customers
                  </p>
                  <h3 className="text-2xl font-bold mt-1">2,420</h3>
                  <p className="text-sm text-green-500 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12.5% from last week
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full ">
                  <Users className="h-6 w-6 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Active Users
                  </p>
                  <h3 className="text-2xl font-bold mt-1">16,325</h3>

                  <p
                    className={`text-sm flex items-center mt-1 ${
                      percentageChange > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {percentageChange}% from yesterday
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${
                    percentageChange > 0 ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Activity
                    className={`h-6 w-6 ${
                      percentageChange > 0 ? "bg-green-100" : "bg-red-100"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Conversion Rate
                  </p>
                  <h3 className="text-2xl font-bold mt-1">4.6%</h3>
                  <p className="text-sm text-green-500 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2.3% from last week
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <PieChart className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <LineChart className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Revenue Chart</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <BarChart className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Sales Chart</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-md"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">New user signed up</p>
                    <p className="text-sm text-gray-500">
                      User #{item}23 completed registration
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    {item} hour{item !== 1 ? "s" : ""} ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
