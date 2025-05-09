"use client";
import React, { useState, useEffect } from "react";
import "../dashboard/dashboard.sass";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
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
  SunOutlined,
  MoonOutlined,
  AppstoreOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  Drawer,
  Badge,
  Avatar,
  Popover,
  List,
} from "antd";
import Link from "next/link";
import { expandlogo, homelogo } from "@/assets/images";

const { Header, Sider, Content, Footer } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const pathname = usePathname();
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

  // Fetch user profile data including profile photo
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        const response = await axios.get(
          `http://localhost:5000/api/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.profilePhoto) {
          setProfilePhoto(`http://localhost:5000${response.data.profilePhoto}`);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
      label: (
        <Link href="/dashboard" prefetch={true}>
          Home
        </Link>
      ),
    },
    {
      key: "finance",
      icon: <VideoCameraOutlined />,
      label: "Finance",
      children: [
        {
          key: "/dashboard/finance-overview",
          icon: <DollarOutlined />,
          label: (
            <Link href="/dashboard/finance-overview" prefetch={true}>
              Overview
            </Link>
          ),
        },
        {
          key: "/dashboard/finance",
          icon: <CreditCardOutlined />,
          label: (
            <Link href="/dashboard/finance" prefetch={true}>
              Transactions
            </Link>
          ),
        },
      ],
    },
    {
      key: "3d-viewer",
      icon: <AppstoreOutlined />,
      label: (
        <Link href="/dashboard/3d-viewer" prefetch={true}>
          3D Home Viewer
        </Link>
      ),
    },
    {
      key: "/dashboard/shoppingList",
      icon: <ShoppingOutlined />,
      label: (
        <Link href="/dashboard/shoppingList" prefetch={true}>
          Shopping List
        </Link>
      ),
    },
    {
      key: "4",
      icon: <AppstoreOutlined />,
      label: (
        <Link href="/dashboard/devices" prefetch={true}>
          Devices
        </Link>
      ),
    },
    {
      key: "5",
      icon: <ShoppingCartOutlined />,
      label: (
        <Link href="/dashboard/groceries" prefetch={true}>
          Groceries
        </Link>
      ),
    },
    {
      key: "6",
      icon: <ShoppingCartOutlined />,
      label: (
        <Link href="/dashboard/wastage" prefetch={true}>
          Wastage
        </Link>
      ),
    },
    {
      key: "7",
      icon: <ShoppingCartOutlined />,
      label: <Link href="/dashboard/mealPlan">Meal Plan</Link>,
    },
    {
      key: "8",
      icon: <MessageOutlined />,
      label: <Link href="/dashboard/chat">Family Chat</Link>,
    },
  ];

  const profileMenu = (
    <Menu
      items={[
        {
          key: "1",
          icon: <UserOutlined />,
          label: (
            <Link href="/dashboard/profile" prefetch={true}>
              Profile
            </Link>
          ),
        },
        {
          key: "divider-1",
          type: "divider",
        },
        {
          key: "2",
          icon: <LogoutOutlined />,
          label: "Logout",
          onClick: handleLogout,
        },
      ]}
    />
  );

  const notificationContent = (
    <div>
      <List
        dataSource={notifications.slice(0, 3)}
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      const element = document.querySelector("html");
      element?.classList.add("my-app-dark");

      setIsDarkMode(true);
    }
  }, []);

  const switchToDarkLightMode = () => {
    const element = document.querySelector("html") as HTMLHtmlElement;
    const newTheme = !isDarkMode;
    element.classList.toggle("my-app-dark", newTheme);
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <Layout className="dashboard-layout primary-bg">
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
            selectedKeys={[pathname]}
            defaultOpenKeys={["finance", "shopping"]}
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
              src={collapsed ? homelogo : expandlogo}
              alt="Logo"
              className={
                collapsed
                  ? "dashboard-collapsed-logo"
                  : "dashboard-expanded-logo"
              }
            />
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            defaultOpenKeys={["finance", "shopping"]}
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
              <Button type="link" onClick={switchToDarkLightMode}>
                {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              </Button>
              <Popover
                content={notificationContent}
                title="Notifications"
                trigger="click"
                open={popoverVisible}
                onOpenChange={setPopoverVisible}
              >
                <Badge
                  count={notifications.length}
                  className="notification-badge"
                >
                  <BellOutlined className="notification-icon" />
                </Badge>
              </Popover>
              <Popover content={profileMenu} trigger="click">
                {profilePhoto ? (
                  <Avatar
                    className="profile-avatar"
                    src={profilePhoto}
                    onError={() => {
                      // Fallback to icon if image fails to load
                      setProfilePhoto(null);
                      return true;
                    }}
                  />
                ) : (
                  <Avatar className="profile-avatar" icon={<UserOutlined />} />
                )}
              </Popover>
            </div>
          )}
        </Header>

        <Content className="dashboard-content primary-bg">{children}</Content>
        {isMobile && (
          <Footer className="dashboard-footer">
            <Popover
              content={notificationContent}
              title="Notifications"
              trigger="click"
              open={popoverVisible}
              onOpenChange={setPopoverVisible}
            >
              <Badge
                count={notifications.length}
                className="notification-badge"
              >
                <BellOutlined className="notification-icon" />
              </Badge>
            </Popover>
            <Popover content={profileMenu} trigger="click">
              {profilePhoto ? (
                <Avatar
                  className="profile-avatar"
                  src={profilePhoto}
                  onError={() => {
                    // Fallback to icon if image fails to load
                    setProfilePhoto(null);
                    return true;
                  }}
                />
              ) : (
                <Avatar className="profile-avatar" icon={<UserOutlined />} />
              )}
            </Popover>
          </Footer>
        )}
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
