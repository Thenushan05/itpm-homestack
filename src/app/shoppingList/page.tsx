"use client";
import React, { useState, useEffect } from "react";
import "../dashboard/dashboard.sass";
import "../finance/page";
import "../dashboard/page";
import "regenerator-runtime/runtime";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Drawer } from "antd";
import Link from "next/link";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [items, setItems] = useState<string[]>([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [canAdd, setCanAdd] = useState(false);
  const [isStart, setIsStart] = useState(false);

  const startListening = () => {
    setIsStart(true);
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    setCanAdd(false);
  };

  const stopListening = () => {
    setIsStart(false);
    SpeechRecognition.stopListening();
    setCanAdd(true);
  };

  const addToList = () => {
    if (transcript) {
      setItems((prevItems) => [...prevItems, transcript]);
      resetTranscript();
      setCanAdd(false);
    }
  };

  const resetSpeech = () => {
    resetTranscript();
    setCanAdd(false);
  };

  const deleteItem = (index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

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
            defaultSelectedKeys={["3"]}
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
            defaultSelectedKeys={["3"]}
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
          <div className="container">
            <h1 className="title">🛒 Shopping List (Voice to Text)</h1>

            <div className="buttons">
              <button
                onClick={startListening}
                disabled={listening}
                className="start"
              >
                🎙 Start Listening
              </button>
              <button
                onClick={stopListening}
                disabled={!listening}
                className="stop"
              >
                ⏹ Stop
              </button>
              <button onClick={addToList} disabled={!canAdd} className="add">
                ➕ Add to List
              </button>
              <button onClick={resetSpeech} className="reset">
                🔄 Reset Speech
              </button>
            </div>

            <h2 className="transcript">
              {isStart && (
                <>
                  🗣 Current Speech:{" "}
                  <span>{transcript || "Say something..."}</span>
                </>
              )}
            </h2>

            <h2 className="list-title">📝 Shopping List:</h2>
            <ul className="shopping-list">
              {items.length === 0 ? (
                <p className="empty">Your list is empty. Start adding items!</p>
              ) : (
                items.map((item, index) => (
                  <li key={index} className="list-item">
                    {item}
                    <button
                      className="delete"
                      onClick={() => deleteItem(index)}
                    >
                      ❌
                    </button>
                  </li>
                ))
              )}
            </ul>

            <style jsx>{`
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              .container {
                width: 100vw;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                text-align: center;
                padding: 20px;
              }
              .title {
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 20px;
                color: #343a40;
              }
              .buttons {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
              }
              button {
                padding: 12px 18px;
                font-size: 18px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: 0.3s ease;
              }
              .start {
                background: #28a745;
                color: white;
              }
              .stop {
                background: #dc3545;
                color: white;
              }
              .add {
                background: #007bff;
                color: white;
              }
              .reset {
                background: #ffc107;
                color: black;
              }
              button:disabled {
                background: #ccc;
                cursor: not-allowed;
              }
              .transcript {
                font-size: 20px;
                margin-bottom: 20px;
                color: #495057;
              }
              .list-title {
                font-size: 24px;
                font-weight: bold;
                color: #343a40;
                margin-top: 15px;
              }
              .shopping-list {
                width: 100%;
                max-width: 500px;
                list-style: none;
                padding: 0;
              }
              .empty {
                font-size: 18px;
                color: #6c757d;
              }
              .list-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: white;
                padding: 12px;
                margin: 8px 0;
                border-radius: 6px;
                box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
                font-size: 18px;
              }
              .delete {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
              }
            `}</style>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
