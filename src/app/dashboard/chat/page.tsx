"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Avatar,
  Input,
  Button,
  Badge,
  Dropdown,
  Menu,
  Typography,
  theme,
} from "antd";
import {
  SendOutlined,
  SmileOutlined,
  PaperClipOutlined,
  PictureOutlined,
  PushpinOutlined,
  UserOutlined,
  EllipsisOutlined,
  SearchOutlined,
} from "@ant-design/icons";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
  };
  timestamp: Date;
  type: "text" | "image" | "task" | "reminder";
  status: "sent" | "delivered" | "seen";
  isPinned?: boolean;
  mentions?: string[];
  reactions?: { emoji: string; users: string[] }[];
}

interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: Date;
  unreadCount?: number;
}

const FamilyChat = () => {
  const { token } = theme.useToken();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    dad: [
      {
        id: "3",
        content: "Can you pick up groceries on your way home? 🛒",
        sender: {
          id: "mom",
          name: "Mom",
          avatar: "https://i.pravatar.cc/150?img=5",
        },
        receiver: {
          id: "dad",
          name: "Dad",
        },
        timestamp: new Date(Date.now() - 7200000),
        type: "text",
        status: "seen",
      },
    ],
    kid1: [
      {
        id: "1",
        content: "Don't forget to take out the recycling today! 🗑️",
        sender: {
          id: "mom",
          name: "Mom",
          avatar: "https://i.pravatar.cc/150?img=5",
        },
        receiver: {
          id: "kid1",
          name: "Alex",
        },
        timestamp: new Date(Date.now() - 3600000),
        type: "reminder",
        status: "seen",
        isPinned: true,
      },
      {
        id: "2",
        content: "I'll handle it after school! 👍",
        sender: {
          id: "kid1",
          name: "Alex",
          avatar: "https://i.pravatar.cc/150?img=8",
        },
        receiver: {
          id: "mom",
          name: "Mom",
        },
        timestamp: new Date(Date.now() - 1800000),
        type: "text",
        status: "seen",
      },
    ],
    kid2: [
      {
        id: "4",
        content: "How was your math test today? 📚",
        sender: {
          id: "mom",
          name: "Mom",
          avatar: "https://i.pravatar.cc/150?img=5",
        },
        receiver: {
          id: "kid2",
          name: "Sarah",
        },
        timestamp: new Date(Date.now() - 5400000),
        type: "text",
        status: "delivered",
      },
    ],
  });

  const [familyMembers] = useState<FamilyMember[]>([
    {
      id: "dad",
      name: "Dad",
      avatar: "https://i.pravatar.cc/150?img=3",
      status: "away",
      lastSeen: new Date(Date.now() - 900000),
      unreadCount: 1,
    },
    {
      id: "kid1",
      name: "Alex",
      avatar: "https://i.pravatar.cc/150?img=8",
      status: "online",
      unreadCount: 0,
    },
    {
      id: "kid2",
      name: "Sarah",
      avatar: "https://i.pravatar.cc/150?img=9",
      status: "offline",
      lastSeen: new Date(Date.now() - 7200000),
      unreadCount: 2,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: "mom",
        name: "Mom",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
      receiver: {
        id: selectedChat,
        name: familyMembers.find((m) => m.id === selectedChat)?.name || "",
      },
      timestamp: new Date(),
      type: "text",
      status: "sent",
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), message],
    }));
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const messageActions = (
    <Menu>
      <Menu.Item key="pin" icon={<PushpinOutlined />}>
        Pin Message
      </Menu.Item>
      <Menu.Item key="copy">Copy Text</Menu.Item>
      <Menu.Item key="delete" danger>
        Delete
      </Menu.Item>
    </Menu>
  );

  const getLastMessage = (memberId: string) => {
    const memberMessages = messages[memberId] || [];
    return memberMessages[memberMessages.length - 1];
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50/30">
      {/* Sidebar - Family Members */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <Typography.Title level={4} className="m-0 !text-gray-800">
              Family Chat
            </Typography.Title>
            <Badge
              count={familyMembers.filter((m) => m.status === "online").length}
              style={{ backgroundColor: token.colorSuccess }}
            />
          </div>
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search messages..."
            className="rounded-lg bg-gray-50/50 border-0 hover:bg-gray-50/80 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {familyMembers.map((member) => {
            const lastMessage = getLastMessage(member.id);
            return (
              <div
                key={member.id}
                className={`flex items-center p-4 hover:bg-gray-50/80 cursor-pointer transition-all duration-200 ${
                  selectedChat === member.id
                    ? "bg-blue-50/50 hover:bg-blue-50/80"
                    : ""
                }`}
                onClick={() => setSelectedChat(member.id)}
              >
                <Badge
                  dot
                  status={
                    member.status === "online"
                      ? "success"
                      : member.status === "away"
                      ? "warning"
                      : "default"
                  }
                  offset={[-4, 38]}
                >
                  <Avatar
                    src={member.avatar}
                    icon={!member.avatar && <UserOutlined />}
                    size={44}
                    className="border-2 border-white shadow-sm"
                  />
                </Badge>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {member.name}
                    </span>
                    {(member.unreadCount ?? 0) > 0 && (
                      <Badge
                        count={member.unreadCount}
                        style={{
                          backgroundColor: token.colorPrimary,
                          boxShadow: "none",
                        }}
                      />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {lastMessage ? (
                      <>
                        <span className="mr-1 font-medium">
                          {lastMessage.sender.id === "mom" ? "You: " : ""}
                        </span>
                        {lastMessage.content}
                      </>
                    ) : (
                      <span className="text-gray-400">
                        {member.status === "online"
                          ? "Active now"
                          : member.status === "away"
                          ? "Away"
                          : `Last seen ${formatTime(
                              member.lastSeen || new Date()
                            )}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Badge
                    dot
                    status={
                      familyMembers.find((m) => m.id === selectedChat)
                        ?.status === "online"
                        ? "success"
                        : familyMembers.find((m) => m.id === selectedChat)
                            ?.status === "away"
                        ? "warning"
                        : "default"
                    }
                    offset={[-4, 38]}
                  >
                    <Avatar
                      src={
                        familyMembers.find((m) => m.id === selectedChat)?.avatar
                      }
                      icon={
                        !familyMembers.find((m) => m.id === selectedChat)
                          ?.avatar && <UserOutlined />
                      }
                      size={44}
                    />
                  </Badge>
                  <div className="ml-3">
                    <Typography.Title level={4} className="m-0 !text-gray-800">
                      {familyMembers.find((m) => m.id === selectedChat)?.name}
                    </Typography.Title>
                    <Typography.Text className="text-sm text-gray-500">
                      {familyMembers.find((m) => m.id === selectedChat)
                        ?.status === "online"
                        ? "Active now"
                        : familyMembers.find((m) => m.id === selectedChat)
                            ?.status === "away"
                        ? "Away"
                        : `Last seen ${formatTime(
                            familyMembers.find((m) => m.id === selectedChat)
                              ?.lastSeen || new Date()
                          )}`}
                    </Typography.Text>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  icon={<SearchOutlined />}
                  type="text"
                  className="flex items-center hover:bg-gray-50/80"
                />
                <Dropdown overlay={messageActions} trigger={["click"]}>
                  <Button
                    icon={<EllipsisOutlined />}
                    type="text"
                    className="flex items-center hover:bg-gray-50/80"
                  />
                </Dropdown>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              <AnimatePresence>
                {(messages[selectedChat] || []).map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${
                      message.sender.id === "mom"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[70%] group ${
                        message.sender.id === "mom"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <Avatar
                        src={message.sender.avatar}
                        className="mt-1"
                        size={36}
                      />
                      <div
                        className={`rounded-2xl p-3 relative shadow-sm ${
                          message.sender.id === "mom"
                            ? "bg-primary text-white mr-2"
                            : "bg-white text-gray-900 ml-2"
                        } ${
                          message.isPinned ? "border-2 border-yellow-400" : ""
                        }`}
                        style={{
                          backgroundColor:
                            message.sender.id === "mom"
                              ? token.colorPrimary
                              : "#fff",
                        }}
                      >
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-1 flex items-center ${
                            message.sender.id === "mom"
                              ? "text-white/80"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                          <span className="ml-2">
                            {message.status === "seen" && "✓✓"}
                            {message.status === "delivered" && "✓"}
                          </span>
                        </div>
                        {message.isPinned && (
                          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                            <PushpinOutlined className="text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 p-4 bg-white">
              <div className="flex items-center space-x-2 bg-gray-50/50 p-2 rounded-2xl">
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="image" icon={<PictureOutlined />}>
                        Send Image
                      </Menu.Item>
                      <Menu.Item key="file" icon={<PaperClipOutlined />}>
                        Send File
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button
                    icon={<PaperClipOutlined />}
                    type="text"
                    className="flex items-center hover:bg-gray-100/80"
                  />
                </Dropdown>
                <Button
                  icon={<SmileOutlined />}
                  type="text"
                  className="flex items-center hover:bg-gray-100/80"
                />
                <Input.TextArea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="flex-1 !bg-transparent border-0 focus:shadow-none resize-none"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  className="flex items-center shadow-none"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          // No chat selected state
          <div className="flex-1 flex items-center justify-center bg-gray-50/30">
            <div className="text-center text-gray-500 bg-white p-8 rounded-2xl shadow-sm">
              <UserOutlined
                style={{ fontSize: "48px" }}
                className="text-gray-400 mb-4"
              />
              <Typography.Title level={4} className="!text-gray-800 mb-2">
                Select a chat to start messaging
              </Typography.Title>
              <Typography.Text className="text-gray-500">
                Choose a family member from the list to begin a conversation
              </Typography.Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyChat;
