"use client"

import { useState } from "react"
import { 
  Card, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Layout,
  Badge,
  Divider,
  App
} from "antd"
import { 
  BellOutlined, 
  CheckOutlined, 
  CloseOutlined 
} from "@ant-design/icons"

const { Header, Content } = Layout
const { Title, Text } = Typography

interface Notification {
  id: number
  title: string
  description: string
  type: 'warranty' | 'service' | 'alert'
  date: string
}

export default function NotificationsPage() {
  const { message } = App.useApp()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "TV Warranty Expiring",
      description: "Samsung TV warranty expires in 15 days",
      type: "warranty",
      date: "2024-04-01"
    },
    {
      id: 2,
      title: "AC Service Due",
      description: "Schedule AC maintenance service",
      type: "service",
      date: "2024-03-20"
    }
  ])

  const handleAccept = (id: number) => {
    message.success(`Notification ${id} accepted`)
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleDismiss = (id: number) => {
    message.info(`Notification ${id} dismissed`)
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'warranty': return 'blue'
      case 'service': return 'orange'
      case 'alert': return 'red'
      default: return 'gray'
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 12 }} />
            Notifications
          </Title>
          <Text type="secondary">Manage your device and inventory notifications</Text>
        </Space>
      </Header>
      
      <Divider style={{ margin: 0 }} />
      
      <Content style={{ padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              style={{ width: '100%' }}
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <Badge 
                  count={<BellOutlined style={{ color: '#1890ff' }} />} 
                  style={{ backgroundColor: '#e6f7ff' }}
                />
                
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ marginBottom: 4 }}>
                    {notification.title}
                  </Title>
                  <Text type="secondary">{notification.description}</Text>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginTop: 12,
                    alignItems: 'center'
                  }}>
                    <Space>
                      <Tag color={getTypeColor(notification.type)}>
                        {notification.type}
                      </Tag>
                      <Text type="secondary">Due: {notification.date}</Text>
                    </Space>
                    
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<CheckOutlined />}
                        onClick={() => handleAccept(notification.id)}
                      >
                        Accept
                      </Button>
                      <Button 
                        icon={<CloseOutlined />}
                        onClick={() => handleDismiss(notification.id)}
                      >
                        Dismiss
                      </Button>
                    </Space>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </Space>
      </Content>
    </Layout>
  )
}