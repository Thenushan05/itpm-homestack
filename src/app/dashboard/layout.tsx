"use client";
import React, { useState, useEffect } from "react";
import "../dashboard/dashboard.sass";
import Image from "next/image";
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  VideoCameraOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  Drawer,
  Badge,
  Dropdown,
  Avatar,
  Popover,
  List,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { expandlogo, homelogo } from "@/assets/images";

const { Header, Sider, Content, Footer } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/signin");
  };
  const [notifications] = useState([
    {
      id: 1,
      title: "New Order Received",
      description: "You have a new order from John Doe.",
    },
    {
      id: 2,
      title: "Payment Successful",
      description: "Your recent transaction was successful.",
    },
    {
      id: 3,
      title: "Stock Running Low",
      description: "Item 'Milk' is running low in stock.",
    },
    {
      id: 4,
      title: "New Order Received",
      description: "You have a new order from John Doe.",
    },
  ]);
  const [popoverVisible, setPopoverVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">Home</Link>,
    },
    {
      key: "2",
      icon: <VideoCameraOutlined />,
      label: "Finance",
      children: [
        {
          key: "2-1",
          icon: <DollarOutlined />,
          label: <Link href="/dashboard/finance-overview">Overview</Link>,
        },
        {
          key: "2-2",
          icon: <CreditCardOutlined />,
          label: <Link href="/dashboard/finance">Transactions</Link>,
        },
      ],
    },
    {
      key: "3",
      icon: <ShoppingOutlined />,
      label: "Shopping List",
      children: [
        {
          key: "3-1",
          icon: <ShoppingCartOutlined />,
          label: <Link href="/dashboard/shoppingList">Current List</Link>,
        },
        {
          key: "3-2",
          icon: <ShoppingCartOutlined />,
          label: <Link href="/dashboard/shoppingList">Purchase History</Link>,
        },
      ],
    },
    {
      key: "4",
      icon: <AppstoreOutlined />,
      label: (
        <Link href="/dashboard/devices">Devices</Link>
      ),
   
      
    },
    {
      key: "5",
      icon: <ShoppingCartOutlined />,
      label: (
        <Link href="/dashboard/groceries">Groceries</Link>
      ),
     
      
    },
    
  ];

  const profileMenu = (
    <Menu
      onClick={(info) => {
        if (info.key === "2") {
          handleLogout();
        }
      }}
      items={[
        {
          key: "1",
          icon: <UserOutlined />,
          label: <Link href="./profile">Profile</Link>,
        },
        { type: "divider" },
        { key: "2", icon: <LogoutOutlined />, label: "Logout" },
      ]}
    />
  );

  const notificationContent = (
    <div>
      <List
        dataSource={notifications.slice(0, 3)} // Show only 3 notifications
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
      <Button
        type="link"
        onClick={() => {
          router.push("/dashboard/notifications");
        }}
        style={{ width: "100%", textAlign: "center" }}
      >
        View All Notifications
      </Button>
    </div>
  );

  

  return (
    <Layout className="dashboard-layout">
      {isMobile ? (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setCollapsed(true)}
          open={!collapsed}
          width={250}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={menuItems}
          />
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="dashboard-sider"
        >
          <div className="dashboard-logo">
            {collapsed ? (
              <Image
                src={homelogo}
                alt="Logo"
                className="dashboard-collapsed-logo"
              />
            ) : (
              <Image
                src={expandlogo}
                alt="Logo"
                className="dashboard-expanded-logo"
              />
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["2", "3"]}
            items={menuItems}
          />
        </Sider>
      )}
      <Layout>
        <Header
          className={
            isMobile
              ? "dashboard-header mobile-header no-bg"
              : "dashboard-header"
          }
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="menu-toggle-btn"
          />
          {!isMobile && (
            <div className="header-actions">
              <Popover
                content={notificationContent}
                title="Notifications"
                trigger="click"
                visible={popoverVisible}
                onVisibleChange={setPopoverVisible}
              >
                <Badge
                  count={notifications.length}
                  className="notification-badge"
                >
                  <BellOutlined className="notification-icon" />
                </Badge>
              </Popover>
              <Dropdown overlay={profileMenu} trigger={["click"]}>
                <Avatar className="profile-avatar" icon={<UserOutlined />} />
              </Dropdown>
            </div>
          )}
        </Header>
        <Content className="dashboard-content">{children}</Content>
        {isMobile && (
          <Footer className="dashboard-footer">
            <Popover
              content={notificationContent}
              title="Notifications"
              trigger="click"
              visible={popoverVisible}
              onVisibleChange={setPopoverVisible}
            >
              <Badge
                count={notifications.length}
                className="notification-badge"
              >
                <BellOutlined className="notification-icon" />
              </Badge>
            </Popover>
            <Dropdown overlay={profileMenu} trigger={["click"]}>
              <Avatar className="profile-avatar" icon={<UserOutlined />} />
            </Dropdown>
          </Footer>
        )}
      </Layout>
      
    </Layout>
  );
};

export default DashboardLayout;
