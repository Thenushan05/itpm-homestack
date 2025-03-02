"use client";
import React, { useState, useEffect } from "react";
import "../dashboard/dashboard.sass";
import "../finance/page";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  theme,
  Drawer,
  Card,
  Col,
  Row,
  Statistic,
} from "antd";
import Link from "next/link";
import "../shoppingList/page";

const { Header, Sider, Content } = Layout;

const ShoppingList: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Detect screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setCollapsed(false); // Expand sidebar on larger screens
      } else {
        setCollapsed(true); // Hide sidebar on mobile
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout>
      {isMobile ? (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setCollapsed(true)}
          open={!collapsed}
          width={200}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={[
              { key: "1", icon: <UserOutlined />, label: <Link href="/dashboard">Home</Link> },
              {
                key: "2",
                icon: <VideoCameraOutlined />,
                label: <Link href="/finance">Finance</Link>,
              },
              {   key: "3",
                icon: <ShoppingOutlined  />,
                label: <Link href="/shoppingList">ShoppingList</Link>, },
            ]}
          />
        </Drawer>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={[
              { key: "1", icon: <UserOutlined />, label: "Home" },
              {
                key: "2",
                icon: <VideoCameraOutlined />,
                label: <Link href="/finance">Finance</Link>,
              },
              {
                key: "3",
                icon: <ShoppingOutlined />,
                label: <Link href="/shoppingList">ShoppingList</Link>,
              },
            ]}
          />
        </Sider>
      )}
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div>
            <Row gutter={24}>
              <Col span={8}>
                <Card>
                  <Statistic title="Quantity to be Packed" value={228} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="Quantity to be Shipped" value={6} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="Quantity to be Invoiced" value={474} />
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ShoppingList;
