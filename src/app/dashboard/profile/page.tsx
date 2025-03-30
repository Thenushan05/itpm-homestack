"use client";

import React, { useState, useEffect } from "react";
import { Layout, Typography, message, Input, Button } from "antd";
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "../profile/profile.sass";

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [editingFields, setEditingFields] = useState<{
    [key: string]: boolean;
  }>({
    firstName: false,
    lastName: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("No authentication token found. Please log in.");
          return;
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        const response = await axios.get(
          `http://localhost:5000/api/auth/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data) {
          const { firstName, lastName, role, _id } = response.data.user;
          setFirstName(firstName);
          setLastName(lastName);
          setRole(role);
          setOwnerId(_id);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        message.error("Failed to fetch profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (field: string) => {
    try {
      const token = localStorage.getItem("to ken");
      if (!token) {
        message.error("No authentication token found.");
        return;
      }

      await axios.put(
        "http://localhost:5000/api/auth/update-user",
        { firstName, lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Profile updated successfully!");
      setEditingFields({ ...editingFields, [field]: false });
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile.");
    }
  };

  const handleCancel = (field: string) => {
    setEditingFields({ ...editingFields, [field]: false });
  };

  const handleEdit = (field: string) => {
    setEditingFields({ ...editingFields, [field]: true });
  };

  const handleShare = () => {
    const mailtoLink = `mailto:?subject=Join my HomeStock Account&body=Use this ID to join my account: ${ownerId}`;
    window.location.href = mailtoLink;
  };

  return (
    <Layout className="profile-container">
      <Content className="profile-content">
        <Title level={2} className="profile-title">
          Profile
        </Title>

        {/* First Name Field */}
        <div className="profile-field">
          <Title level={4} className="field-title">
            First Name
          </Title>
          {editingFields.firstName ? (
            <>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="profile-input"
              />
              <Button
                icon={<CheckOutlined />}
                className="done-button"
                onClick={() => handleSave("firstName")}
              />
              <Button
                icon={<CloseOutlined />}
                className="cancel-button"
                onClick={() => handleCancel("firstName")}
              />
            </>
          ) : (
            <>
              <Text className="profile-text">{firstName || "Loading..."}</Text>
              <EditOutlined
                className="edit-icon"
                onClick={() => handleEdit("firstName")}
              />
            </>
          )}
        </div>

        {/* Last Name Field */}
        <div className="profile-field">
          <Title level={4} className="field-title">
            Last Name
          </Title>
          {editingFields.lastName ? (
            <>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="profile-input"
              />
              <Button
                icon={<CheckOutlined />}
                className="done-button"
                onClick={() => handleSave("lastName")}
              />
              <Button
                icon={<CloseOutlined />}
                className="cancel-button"
                onClick={() => handleCancel("lastName")}
              />
            </>
          ) : (
            <>
              <Text className="profile-text">{lastName || "Loading..."}</Text>
              <EditOutlined
                className="edit-icon"
                onClick={() => handleEdit("lastName")}
              />
            </>
          )}
        </div>

        {/* Role */}
        <div className="profile-field">
          <Title level={4} className="field-title">
            Role
          </Title>
          <Text className="profile-text">{loading ? "Loading..." : role}</Text>
        </div>

        {/* ID with Copy and Share Button */}
        <div className="profile-field">
          <Title level={4} className="field-title">
            ID
          </Title>
          <Text copyable className="profile-text">
            {loading ? "Loading..." : ownerId}
          </Text>
          <Button
            className="share-button"
            onClick={handleShare}
            icon={<ShareAltOutlined />}
          />
        </div>

        {/* Full Name Display */}
        <div className="profile-fullname">
          <Title level={4} className="field-title">
            Full Name
          </Title>
          <Text className="profile-text">{`${firstName} ${lastName}`}</Text>
        </div>
      </Content>
    </Layout>
  );
};

export default Profile;
