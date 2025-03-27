"use client"

import { useState } from "react"
import { 
  FileExcelOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons"
import { 
  Button, 
  Card, 
  Badge, 
  Space,
  Typography,
  Row,
  Col,
  Layout
} from "antd"
import { useRouter } from "next/navigation"

const { Title, Text } = Typography
const { Header, Content } = Layout

export default function DevicesPage() {
  const router = useRouter()
  const [devices] = useState([
    {
      id: 1,
      name: "Smart TV",
      model: "Samsung QN55Q60B",
      purchaseDate: "2023-01-15",
      warrantyEnd: "2025-01-15",
      nextService: "2024-01-15",
      status: "Active"
    },
    {
      id: 2,
      name: "Air Conditioner",
      model: "LG Dual Inverter",
      purchaseDate: "2022-06-20",
      warrantyEnd: "2024-06-20",
      nextService: "2024-01-20",
      status: "Service Due"
    }
  ])

  const handleDelete = (id: number) => {
    console.log("Delete device:", id)
  }

  const handleGenerateReport = () => {
    console.log("Generating monthly report")
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Devices Management</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<FileExcelOutlined />}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => router.push("./devices/add")}
            >
              Add Device
            </Button>
          </Space>
        </div>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Space 
          direction="vertical" 
          size="middle" 
          style={{ width: '100%' }}
        >
          {devices.map((device) => (
            <Card 
              key={device.id}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0 }}>{device.name}</Title>
                  <Space>
                    <Button 
                      icon={<EditOutlined />} 
                      href={`/devices/edit/${device.id}`}
                    />
                    <Button 
                      icon={<DeleteOutlined />} 
                      danger
                      onClick={() => handleDelete(device.id)}
                    />
                  </Space>
                </div>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Model:</Text>
                  <Text style={{ float: 'right' }}>{device.model}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Purchase Date:</Text>
                  <Text style={{ float: 'right' }}>{device.purchaseDate}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Warranty Until:</Text>
                  <Text style={{ float: 'right' }}>{device.warrantyEnd}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Next Service:</Text>
                  <Text style={{ float: 'right' }}>{device.nextService}</Text>
                </Col>
                <Col span={24}>
                  <Text strong>Status:</Text>
                  <Badge 
                    status={device.status === "Service Due" ? "error" : "success"}
                    text={device.status}
                    style={{ float: 'right' }}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      </Content>
    </Layout>
  )
}