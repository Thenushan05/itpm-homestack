"use client";
import React, { useState, useEffect } from "react";
import "../dashboard/dashboard.sass";
import { logo } from "@/assets/images";
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
  Modal,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

const { Header, Sider, Content, Footer } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true);
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
  const [showAllNotifications, setShowAllNotifications] = useState(false);
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
          label: <Link href="/dashboard/finance/overview">Overview</Link>,
        },
        {
          key: "2-2",
          icon: <CreditCardOutlined />,
          label: (
            <Link href="/dashboard/finance/transactions">Transactions</Link>
          ),
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
          label: (
            <Link href="/dashboard/shoppingList/history">Purchase History</Link>
          ),
        },
      ],
    },
  ];

  const profileMenu = (
    <Menu
      onClick={handleLogout}
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
          setPopoverVisible(false); // Hide the popover when clicking to view all notifications
          setShowAllNotifications(true);
        }}
        style={{ width: "100%", textAlign: "center" }}
      >
        View All Notifications
      </Button>
    </div>
  );

  const viewAllNotificationsModal = (
    <Modal
      visible={showAllNotifications}
      title="All Notifications"
      onCancel={() => setShowAllNotifications(false)}
      footer={null}
      width="100%"
      bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </Modal>
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
          <div className="dashboard-logo">
            <Image src={logo} alt="Logo" width={120} height={50} />
          </div>
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
            <Image
              src={logo}
              alt="Logo"
              width={collapsed ? 1 : 120}
              height={collapsed ? 1 : 10}
            />
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
      {viewAllNotificationsModal}
    </Layout>
  );
};

export default DashboardLayout;
