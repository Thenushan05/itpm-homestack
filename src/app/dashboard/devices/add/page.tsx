"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  DatePicker,
  Space,
  message,
  Typography,
  Layout
} from "antd"
import { AudioOutlined, QrcodeOutlined, ArrowLeftOutlined } from "@ant-design/icons"
import dayjs, { Dayjs } from "dayjs"

const { Header, Content } = Layout
const { Title, Text } = Typography

interface DeviceFormValues {
  name: string
  model: string
  purchaseDate: Dayjs
  warrantyEnd: Dayjs
  nextService: Dayjs
}

interface FormattedDeviceData {
  name: string
  model: string
  purchaseDate: string
  warrantyEnd: string
  nextService: string
}

export default function AddDevicePage() {
  const router = useRouter()
  const [form] = Form.useForm<DeviceFormValues>()
  const [isListening, setIsListening] = useState(false)


  const handleSubmit = (values: DeviceFormValues) => {
    const formattedValues: FormattedDeviceData = {
      name: values.name,
      model: values.model,
      purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
      warrantyEnd: values.warrantyEnd.format('YYYY-MM-DD'),
      nextService: values.nextService.format('YYYY-MM-DD')
    }
    
    console.log("Form values:", formattedValues)
    message.success("Device added successfully!")
    router.push("/devices")
  }

  const handleVoiceInput = () => {
    setIsListening(!isListening)
    message.info(isListening ? "Voice input stopped" : "Listening... Speak now")
  }

  const handleQRScan = () => {
    message.info("QR scanning initiated")
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
        <div>
          <Title level={4} style={{ margin: 0 }}>Add New Device</Title>
          <Text type="secondary">
            Add a new device to your inventory
          </Text>
        </div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push("/devices")}
        >
          Back to Devices
        </Button>
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <Card 
          title="Device Information" 
          styles={{ body: { padding: 24 } }}
        >
          <Form<DeviceFormValues>
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: '',
              model: '',
              purchaseDate: dayjs(),
              warrantyEnd: dayjs().add(1, 'year'),
              nextService: dayjs().add(6, 'month')
            }}
          >
            <Form.Item
              label="Device Name"
              name="name"
              rules={[{ required: true, message: 'Please input the device name!' }]}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input placeholder="e.g., Smart TV, Air Conditioner" />
                <Button 
                  icon={<AudioOutlined style={isListening ? { color: '#ff4d4f' } : {}} />} 
                  onClick={handleVoiceInput}
                />
                <Button 
                  icon={<QrcodeOutlined />} 
                  onClick={handleQRScan}
                />
              </Space.Compact>
            </Form.Item>

            <Form.Item
              label="Model Number"
              name="model"
              rules={[{ required: true, message: 'Please input the model number!' }]}
            >
              <Input placeholder="e.g., QN55Q60B, Dual Inverter" />
            </Form.Item>

            <Form.Item
              label="Purchase Date"
              name="purchaseDate"
              rules={[{ required: true, message: 'Please select purchase date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Warranty End Date"
              name="warrantyEnd"
              rules={[{ required: true, message: 'Please select warranty end date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Next Service Date"
              name="nextService"
              rules={[{ required: true, message: 'Please select next service date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" size="large">
                  Add Device
                </Button>
                <Button 
                  onClick={() => router.push("/devices")} 
                  size="large"
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  )
}