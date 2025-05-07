"use client";

import React, { useState, useEffect } from "react";
import {
  message,
  Input,
  Button,
  Upload,
  notification,
  Tabs,
  Divider,
  Card,
  Row,
  Col,
  Modal,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  HomeOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "../profile/profile.sass";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

const { TabPane } = Tabs;

// Custom Toast Notification Component
const Toast = ({
  message,
  type,
  visible,
  onClose,
  duration = 4000,
}: {
  message: string;
  type: "success" | "error";
  visible: boolean;
  onClose: () => void;
  duration?: number;
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, duration]);

  if (!visible) return null;

  return (
    <div className="custom-toast-container">
      <div className={`custom-toast ${type}`}>
        {type === "success" ? (
          <CheckCircleOutlined className="toast-icon" />
        ) : (
          <CloseCircleOutlined className="toast-icon" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

interface UserData {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  homeName: string;
  role: string;
  profilePhoto?: string; // URL to the profile photo
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [homeUsers, setHomeUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [changePassword, setChangePassword] = useState<boolean>(false);

  // Custom toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
    duration?: number;
  }>({
    visible: false,
    message: "",
    type: "success",
    duration: 5000,
  });

  // Show custom toast with longer duration for important messages
  const showToast = (
    message: string,
    type: "success" | "error",
    duration = 5000
  ) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  };

  // Hide custom toast
  const hideToast = () => {
    setToast({
      ...toast,
      visible: false,
    });
  };

  // Form fields
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [homeName, setHomeName] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Theme colors
  const THEME_COLORS = {
    primary: "#4361ee",
    secondary: "#3f37c9",
    success: "#4cc9f0",
    warning: "#f72585",
    danger: "#ef233c",
    info: "#4895ef",
    light: "#f8f9fa",
    dark: "#212529",
    background: "#f5f7ff",
    cardBg: "#ffffff",
    border: "#e9ecef",
    text: "#495057",
    textLight: "#6c757d",
    shadow: "rgba(0, 0, 0, 0.05)",
  };

  // Helper function to get user ID consistently
  const getUserId = (user: UserData | null | undefined): string | undefined => {
    if (!user) return undefined;
    // Prefer _id if available
    if (user._id) return user._id;
    // Fall back to id if _id is not available
    if (user.id) return user.id;
    return undefined;
  };

  // State for custom confirmation dialog
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Function to handle confirmation and removal
  const handleConfirm = async (memberId?: string, memberName?: string) => {
    console.log("Confirm button clicked");

    // Use either passed parameters or stored state
    const idToRemove = memberId || memberToRemove?.id;
    const nameToRemove = memberName || memberToRemove?.name;

    console.log("Member to remove:", idToRemove, nameToRemove);

    if (!idToRemove || !nameToRemove) {
      console.error("No member ID or name available for removal");
      return;
    }

    try {
      setUpdating(true);

      const token = localStorage.getItem("token");
      if (!token) {
        showToast("You are not authenticated. Please login again.", "error");
        return;
      }

      console.log("Sending delete request for member ID:", idToRemove);

      await axios.delete(
        `http://localhost:5000/api/user/remove-member/${idToRemove}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Show success toast message
      showToast(`${nameToRemove} has been removed from your home.`, "success");

      // Force refresh the component to update the UI
      fetchUserData();
    } catch (error: unknown) {
      console.error("Error removing family member:", error);

      // Determine error message for toast
      let errorMessage = "Failed to remove family member.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      // Show error toast message
      showToast(errorMessage, "error");
    } finally {
      setUpdating(false);
      setConfirmVisible(false);
      setMemberToRemove(null);
    }
  };

  // Handle family member removal with proper confirmation and toast messages
  // This is the original method using our custom modal, keeping for reference
  /* Unused for now, using direct window.confirm instead
  const handleRemoveFamilyMember = (memberId: string, memberName: string) => {
    console.log("Starting family member removal process...");
    console.log("Member ID to remove:", memberId);
    console.log("Member ID type:", typeof memberId);
    console.log("Member name:", memberName);
    
    // Show our custom confirmation dialog
    showConfirmDialog(memberId, memberName);
  };
  */

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        message.error("You are not authenticated. Please login again.");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.id;

      const response = await axios.get(
        `http://localhost:5000/api/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("User data response:", response.data); // Debug log
      setUserData(response.data);

      // Set form values
      setFirstName(response.data.firstName || "");
      setLastName(response.data.lastName || "");
      setEmail(response.data.email || "");
      setHomeName(response.data.homeName || "");

      // If there's a profile photo, add it to fileList
      if (response.data.profilePhoto) {
        console.log(
          "Profile photo URL:",
          `http://localhost:5000${response.data.profilePhoto}`
        ); // Debug log
        setFileList([
          {
            uid: "-1",
            name: "profile-photo.jpg",
            status: "done",
            url: `http://localhost:5000${response.data.profilePhoto}`,
          },
        ]);
      } else {
        setFileList([]);
      }

      // Fetch all users with same home name
      if (response.data.homeName) {
        fetchHomeUsers(response.data.homeName, token);
      }
    } catch (error: unknown) {
      console.error("Error fetching user data:", error);
      message.error("Failed to load user profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeUsers = async (homeName: string, token: string) => {
    try {
      // First try the dedicated endpoint
      try {
        const homeUsersResponse = await axios.get(
          `http://localhost:5000/api/user/home/${homeName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (homeUsersResponse.data && homeUsersResponse.data.length > 0) {
          console.log("Home users from API:", homeUsersResponse.data);

          // Debug: log all user IDs
          homeUsersResponse.data.forEach((user: UserData) => {
            console.log(`User: ${user.firstName} ${user.lastName}`);
            console.log(`  _id: ${user._id}`);
            console.log(`  id: ${user.id}`);
          });

          setHomeUsers(homeUsersResponse.data);
          return;
        }
      } catch (error) {
        console.error("Error fetching from dedicated endpoint:", error);
        // Continue to fallback approach
      }

      // Fallback: Get all users and filter by homeName
      // This is less efficient but works as a fallback
      console.log("Using fallback approach to get home users");
      const allUsersResponse = await axios.get(
        `http://localhost:5000/api/user/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (allUsersResponse.data && Array.isArray(allUsersResponse.data)) {
        // Filter users by homeName
        const filteredUsers = allUsersResponse.data.filter(
          (user: UserData) => user.homeName === homeName
        );
        setHomeUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching home users:", error);
      message.error("Failed to load family members");
    }
  };

  const handleUpdateProfile = async () => {
    if (changePassword && newPassword !== confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }

    try {
      console.log("Starting profile update...");
      setUpdating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        showToast("You are not authenticated. Please login again.", "error");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.id;

      // Prepare update data - only include firstName and lastName
      const updateData: {
        firstName: string;
        lastName: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        firstName,
        lastName,
      };

      console.log("Update data:", updateData);

      // Add password update if changing password
      if (changePassword && currentPassword && newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      // Send profile update request
      const response = await axios.put(
        `http://localhost:5000/api/user/${userId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Profile update response:", response.data);

      let successMessage = "Profile information updated successfully";
      let photoUploaded = false;

      // Handle profile photo upload if there's a new file
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append("profilePhoto", fileList[0].originFileObj);

        const photoResponse = await axios.post(
          `http://localhost:5000/api/user/${userId}/upload-photo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Photo upload response:", photoResponse.data);
        photoUploaded = true;
        successMessage = photoUploaded
          ? "Profile information and photo updated successfully"
          : successMessage;
      }

      // Show different messages based on what was updated
      if (changePassword) {
        successMessage = photoUploaded
          ? "Profile information, password, and photo updated successfully"
          : "Profile information and password updated successfully";
      }

      console.log("Showing success message:", successMessage);

      // Display the custom toast notification
      showToast(successMessage, "success");

      // Also try the Ant Design notifications as fallback
      message.success(successMessage);
      notification.success({
        message: "Profile Updated",
        description: successMessage,
        placement: "topRight",
        duration: 4,
      });

      fetchUserData(); // Refresh user data

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangePassword(false);
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errorMsg =
        error && typeof error === "object" && "response" in error
          ? error.response &&
            typeof error.response === "object" &&
            "data" in error.response
            ? error.response.data &&
              typeof error.response.data === "object" &&
              "message" in error.response.data
              ? (error.response.data.message as string)
              : "Failed to update profile"
            : "Failed to update profile"
          : "Failed to update profile";

      console.log("Showing error message:", errorMsg);

      // Display the custom toast notification for error
      showToast(errorMsg, "error");

      // Also try Ant Design notifications as fallback
      message.error(errorMsg);
      notification.error({
        message: "Profile Update Failed",
        description: errorMsg,
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setUpdating(false);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }

      const isLessThan2MB = file.size / 1024 / 1024 < 2;
      if (!isLessThan2MB) {
        message.error("Image must be smaller than 2MB!");
        return Upload.LIST_IGNORE;
      }

      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onload = (e) => {
        // Update fileList with the new preview
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: "done",
            url: e.target?.result as string,
            originFileObj: file,
          },
        ]);
      };
      reader.readAsDataURL(file);

      return false; // Prevent auto upload
    },
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    maxCount: 1,
    listType: "picture",
    showUploadList: false, // Don't show default upload list
  };

  const handleRemovePhoto = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        message.error("You are not authenticated. Please login again.");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.id;

      // Update user to remove profile photo reference
      await axios.put(
        `http://localhost:5000/api/user/${userId}/remove-photo`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear file list and update UI
      setFileList([]);
      if (userData) {
        setUserData({ ...userData, profilePhoto: undefined });
      }

      message.success({
        content: "Profile photo removed successfully",
        duration: 4,
        style: {
          marginTop: "20px",
        },
      });
    } catch (error: unknown) {
      console.error("Error removing profile photo:", error);
      const errorMsg =
        error && typeof error === "object" && "response" in error
          ? error.response &&
            typeof error.response === "object" &&
            "data" in error.response
            ? error.response.data &&
              typeof error.response.data === "object" &&
              "message" in error.response.data
              ? (error.response.data.message as string)
              : "Failed to remove photo"
            : "Failed to remove photo"
          : "Failed to remove photo";
      message.error({
        content: errorMsg,
        duration: 4,
        style: {
          marginTop: "20px",
        },
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading profile data...
      </div>
    );
  }

  return (
    <div
      style={{
        background: THEME_COLORS.background,
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Custom Toast Component */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
        duration={toast.duration}
      />

      {/* Custom Confirmation Dialog */}
      <Modal
        title="Remove Family Member"
        open={confirmVisible}
        onOk={() => handleConfirm()}
        onCancel={() => {
          console.log("Cancel clicked");
          setConfirmVisible(false);
        }}
        okText="Yes, Remove"
        cancelText="No, Cancel"
        okButtonProps={{ danger: true }}
      >
        {memberToRemove ? (
          <p>
            Are you sure you want to remove {memberToRemove.name} from your
            home? This action cannot be undone.
          </p>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>

      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: THEME_COLORS.dark,
            marginBottom: "8px",
          }}
        >
          Profile Settings
        </h1>
        <p style={{ color: THEME_COLORS.textLight, fontSize: "16px" }}>
          Update your personal information and settings
        </p>
      </div>

      <div
        style={{
          background: THEME_COLORS.cardBg,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: `0 8px 16px ${THEME_COLORS.shadow}`,
        }}
      >
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{
            borderBottom: `1px solid ${THEME_COLORS.border}`,
            padding: "0 24px",
          }}
        >
          <TabPane
            tab={
              <span>
                <UserOutlined /> Personal Information
              </span>
            }
            key="1"
          >
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: "32px",
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "60px",
                    overflow: "hidden",
                    marginRight: "24px",
                    border: `1px solid ${THEME_COLORS.border}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f0f2f5",
                    position: "relative",
                  }}
                >
                  {fileList.length > 0 && fileList[0].url ? (
                    // Display preview from fileList if available
                    <img
                      src={fileList[0].url}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        console.error("Image load error:", e);
                        e.currentTarget.style.display = "none";
                        setFileList([]);
                      }}
                    />
                  ) : userData?.profilePhoto ? (
                    // Otherwise display the saved profile photo
                    <img
                      src={`http://localhost:5000${userData.profilePhoto}`}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        console.error("Image load error:", e);
                        e.currentTarget.style.display = "none";
                        if (userData) {
                          setUserData({ ...userData, profilePhoto: undefined });
                        }
                      }}
                    />
                  ) : (
                    // Default avatar icon
                    <UserOutlined
                      style={{
                        fontSize: "48px",
                        color: THEME_COLORS.textLight,
                      }}
                    />
                  )}
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: THEME_COLORS.dark,
                    }}
                  >
                    {userData?.firstName} {userData?.lastName}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        background:
                          userData?.role === "owner" ? "#e6f7ff" : "#f6ffed",
                        color:
                          userData?.role === "owner" ? "#1890ff" : "#52c41a",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginRight: "12px",
                      }}
                    >
                      {userData?.role === "owner"
                        ? "Home Owner"
                        : "Family Member"}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: THEME_COLORS.textLight,
                      }}
                    >
                      <HomeOutlined style={{ marginRight: "4px" }} />{" "}
                      {userData?.homeName}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: THEME_COLORS.textLight,
                      marginBottom: "16px",
                    }}
                  >
                    <MailOutlined style={{ marginRight: "4px" }} />{" "}
                    {userData?.email}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Upload {...uploadProps}>
                      <Button
                        icon={<UploadOutlined />}
                        style={{
                          borderColor: THEME_COLORS.primary,
                          color: THEME_COLORS.primary,
                        }}
                      >
                        {fileList.length > 0 || userData?.profilePhoto
                          ? "Change Photo"
                          : "Upload Photo"}
                      </Button>
                    </Upload>
                    {(fileList.length > 0 || userData?.profilePhoto) && (
                      <Button
                        danger
                        onClick={handleRemovePhoto}
                        style={{
                          borderColor: THEME_COLORS.warning,
                          color: THEME_COLORS.warning,
                        }}
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Divider style={{ margin: "0 0 24px 0" }} />

              <div className="profile-form">
                <h3
                  style={{
                    fontSize: "18px",
                    marginBottom: "16px",
                    fontWeight: "600",
                  }}
                >
                  Personal Details
                </h3>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          color: THEME_COLORS.text,
                          fontWeight: "500",
                        }}
                      >
                        First Name
                      </label>
                      <Input
                        prefix={
                          <UserOutlined
                            style={{ color: THEME_COLORS.textLight }}
                          />
                        }
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={{ padding: "10px 12px" }}
                      />
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          color: THEME_COLORS.text,
                          fontWeight: "500",
                        }}
                      >
                        Last Name
                      </label>
                      <Input
                        prefix={
                          <UserOutlined
                            style={{ color: THEME_COLORS.textLight }}
                          />
                        }
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{ padding: "10px 12px" }}
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          color: THEME_COLORS.text,
                          fontWeight: "500",
                        }}
                      >
                        Email Address
                      </label>
                      <Input
                        prefix={
                          <MailOutlined
                            style={{ color: THEME_COLORS.textLight }}
                          />
                        }
                        placeholder="Email"
                        type="email"
                        value={email}
                        style={{ padding: "10px 12px" }}
                        disabled={true}
                      />
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          color: THEME_COLORS.text,
                          fontWeight: "500",
                        }}
                      >
                        Home Name
                      </label>
                      <Input
                        prefix={
                          <HomeOutlined
                            style={{ color: THEME_COLORS.textLight }}
                          />
                        }
                        placeholder="Home Name"
                        value={homeName}
                        style={{ padding: "10px 12px" }}
                        disabled={true}
                      />
                    </div>
                  </Col>
                </Row>

                <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        marginBottom: "0",
                        fontWeight: "600",
                        marginRight: "16px",
                      }}
                    >
                      Password Settings
                    </h3>
                    <Button
                      type="link"
                      onClick={() => setChangePassword(!changePassword)}
                      style={{ color: THEME_COLORS.primary, padding: "0" }}
                    >
                      {changePassword ? "Cancel" : "Change Password"}
                    </Button>
                  </div>

                  {changePassword && (
                    <div>
                      <Row gutter={16}>
                        <Col span={24}>
                          <div style={{ marginBottom: "16px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                color: THEME_COLORS.text,
                                fontWeight: "500",
                              }}
                            >
                              Current Password
                            </label>
                            <Input.Password
                              prefix={
                                <LockOutlined
                                  style={{ color: THEME_COLORS.textLight }}
                                />
                              }
                              placeholder="Current Password"
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                              style={{ padding: "10px 12px" }}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: "16px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                color: THEME_COLORS.text,
                                fontWeight: "500",
                              }}
                            >
                              New Password
                            </label>
                            <Input.Password
                              prefix={
                                <LockOutlined
                                  style={{ color: THEME_COLORS.textLight }}
                                />
                              }
                              placeholder="New Password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              style={{ padding: "10px 12px" }}
                            />
                          </div>
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: "16px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                color: THEME_COLORS.text,
                                fontWeight: "500",
                              }}
                            >
                              Confirm Password
                            </label>
                            <Input.Password
                              prefix={
                                <LockOutlined
                                  style={{ color: THEME_COLORS.textLight }}
                                />
                              }
                              placeholder="Confirm Password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              style={{ padding: "10px 12px" }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>

                <Button
                  type="primary"
                  onClick={handleUpdateProfile}
                  loading={updating}
                  style={{
                    background: THEME_COLORS.primary,
                    borderColor: THEME_COLORS.primary,
                    height: "40px",
                    padding: "0 24px",
                    fontSize: "16px",
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <TeamOutlined /> Family Members
              </span>
            }
            key="2"
          >
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                  {homeName} Family Members
                </h3>
                {userData?.role === "owner" && (
                  <Button
                    type="primary"
                    icon={<UserSwitchOutlined />}
                    style={{
                      background: THEME_COLORS.primary,
                      borderColor: THEME_COLORS.primary,
                    }}
                    onClick={() => {
                      /* Add functionality to invite new members */
                    }}
                  >
                    Invite Member
                  </Button>
                )}
              </div>

              <Row gutter={[16, 16]}>
                {homeUsers.map((user) => {
                  const currentUserId = getUserId(userData);
                  const familyMemberId = getUserId(user);

                  console.log("Family member card:", user);
                  console.log("Current user ID:", currentUserId);
                  console.log("Family member ID:", familyMemberId);
                  console.log("Current user role:", userData?.role);
                  console.log(
                    "Show delete?",
                    userData?.role === "owner" &&
                      familyMemberId !== currentUserId
                  );

                  return (
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      lg={6}
                      xl={6}
                      key={user._id || user.id}
                    >
                      <Card
                        hoverable
                        className="family-member-card"
                        actions={
                          userData?.role === "owner" &&
                          familyMemberId !== currentUserId
                            ? [
                                <div
                                  style={{ padding: "8px 16px" }}
                                  key="remove"
                                >
                                  <Button
                                    danger
                                    type="primary"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                      // Stop event propagation if that's an issue
                                      e.stopPropagation();

                                      // Add more explicit logging
                                      console.log("Remove button clicked!");
                                      console.log(
                                        `For member: ${user.firstName} ${user.lastName}`
                                      );
                                      console.log(`With ID: ${familyMemberId}`);

                                      // Add a direct toast for debugging
                                      showToast(
                                        `Remove button clicked for ${user.firstName}`,
                                        "success"
                                      );

                                      // Try a simpler approach with direct window.confirm
                                      const isConfirmed = window.confirm(
                                        `Are you sure you want to remove ${user.firstName} ${user.lastName} from your home?`
                                      );

                                      if (isConfirmed) {
                                        // Call handleConfirm directly with the parameters
                                        handleConfirm(
                                          familyMemberId!,
                                          `${user.firstName} ${user.lastName}`
                                        );
                                      }
                                    }}
                                    style={{
                                      width: "100%",
                                      transition: "all 0.3s ease",
                                      fontWeight: "500",
                                    }}
                                    className="remove-member-btn"
                                  >
                                    Remove Member
                                  </Button>
                                </div>,
                              ]
                            : undefined
                        }
                      >
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "40px",
                              overflow: "hidden",
                              margin: "0 auto 16px",
                              border: `1px solid ${THEME_COLORS.border}`,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "#f0f2f5",
                            }}
                          >
                            {user.profilePhoto ? (
                              <img
                                src={`http://localhost:5000${user.profilePhoto}`}
                                alt={`${user.firstName}'s profile`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  console.error("Failed to load profile image");
                                }}
                              />
                            ) : (
                              <UserOutlined
                                style={{
                                  fontSize: "36px",
                                  color: THEME_COLORS.textLight,
                                }}
                              />
                            )}
                          </div>
                          <h4
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "16px",
                              fontWeight: "600",
                            }}
                          >
                            {user.firstName} {user.lastName}
                            {user._id === userData?._id && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: "12px",
                                  color: THEME_COLORS.primary,
                                }}
                              >
                                (You)
                              </span>
                            )}
                          </h4>
                          <p
                            style={{
                              color: THEME_COLORS.textLight,
                              margin: "0 0 8px 0",
                              fontSize: "14px",
                            }}
                          >
                            {user.role === "owner"
                              ? "Home Owner"
                              : "Family Member"}
                          </p>
                          <p
                            style={{
                              color: THEME_COLORS.textLight,
                              margin: 0,
                              fontSize: "14px",
                            }}
                          >
                            {user.email}
                          </p>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
