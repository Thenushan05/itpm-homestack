"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Layout,
  Badge,
  Divider,
  message as notification,
} from "antd";
import { BellOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface Notification {
  _id: string;
  message: string;
  type: "approval" | "join_request";
  userId: string;
  memberId: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          notification.error("No authentication token found. Please log in.");
          return;
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        const response = await axios.get(
          `http://localhost:5000/api/notifications/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Fetched Notifications:", response.data.notifications);

        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        notification.error("Failed to fetch notifications.");
      }
    };

    fetchNotifications();
  }, []);

  const handleAccept = async (memberId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notification.error("No authentication token found.");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/auth/approve-member/${memberId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notification.success("Member approved successfully");

      // Update UI: Change button to "Approved" and disable it
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.memberId === memberId ? { ...n, type: "approval" } : n
        )
      );
    } catch (error) {
      console.error("Error approving member:", error);
      notification.error("Failed to approve member.");
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notification.error("No authentication token found.");
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/dismiss-notification/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notification.info("Notification dismissed");

      // Update UI: Remove the notification from state
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n._id !== notificationId)
      );
    } catch (error) {
      console.error("Error dismissing notification:", error);
      notification.error("Failed to dismiss notification.");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 12 }} />
            Notifications
          </Title>
          <Text type="secondary">Manage your family home notifications</Text>
        </Space>
      </Header>

      <Divider style={{ margin: 0 }} />

      <Content
        style={{
          padding: "24px",
          maxWidth: 800,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {notifications.length === 0 ? (
            <Text>No notifications available</Text>
          ) : (
            notifications.map((notification) => (
              <Card key={notification._id} style={{ width: "100%" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <Badge
                    count={<BellOutlined style={{ color: "#1890ff" }} />}
                    style={{ backgroundColor: "#e6f7ff" }}
                  />

                  <div style={{ flex: 1 }}>
                    {/* Display the message in the UI */}
                    <Title level={5} style={{ marginBottom: 4 }}>
                      {notification.message}
                    </Title>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 12,
                        alignItems: "center",
                      }}
                    >
                      {notification.type === "join_request" ? (
                        <Space>
                          <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => handleAccept(notification.memberId)}
                            disabled={notification.type === "approval"}
                          >
                            {notification.type === "approval"
                              ? "Approved"
                              : "Accept"}
                          </Button>
                          <Button
                            icon={<CloseOutlined />}
                            onClick={() => handleDismiss(notification._id)}
                          >
                            Dismiss
                          </Button>
                        </Space>
                      ) : (
                        <Text type="success">Approved</Text>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </Space>
      </Content>
    </Layout>
  );
}
