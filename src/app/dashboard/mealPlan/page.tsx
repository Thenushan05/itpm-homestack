import NutritionForm from "@/components/NutritionForm";
import NutritionResultsPage from "@/components/NutrititionResult";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import React from "react";

const ProfileSettings: React.FC = () => {
  return (
    <Layout style={{ padding: "50px" }}>
      <Content style={{ margin: "0 auto", maxWidth: "600px" }}>
        <NutritionForm />
        <NutritionResultsPage />
      </Content>
    </Layout>
  );
};

export default ProfileSettings;
