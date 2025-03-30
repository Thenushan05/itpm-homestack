"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Select,
  Space,
  Typography,
  Layout,
  App,
  DatePicker
} from "antd"
import dayjs from "dayjs"
import { 
  AudioOutlined, 
  QrcodeOutlined, 
  ArrowLeftOutlined,
  ShoppingCartOutlined 
} from "@ant-design/icons"


const { Header, Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

interface GroceryFormValues {
  name: string
  quantity: number | null
  expiry_date: dayjs.Dayjs | null
  category: string
}

export default function AddGroceryPage() {
  const { message } = App.useApp()
  const router = useRouter()
  const [form] = Form.useForm<GroceryFormValues>()
  const [isListening, setIsListening] = useState(false)

  const handleSubmit = async () => {
    
     

      message.success("Grocery item added successfully")
      router.push("/groceries")
    
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
          <Title level={4} style={{ margin: 0 }}>
            <ShoppingCartOutlined style={{ marginRight: 12 }} />
            Add Grocery Item
          </Title>
          <Text type="secondary">Add a new item to your grocery inventory</Text>
        </div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push("/groceries")}
        >
          Back to Groceries
        </Button>
      </Header>
      
      <Content style={{ padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <Card>
          <Form<GroceryFormValues>
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: '',
              quantity: null,
              expiry_date: null,
              category: ''
            }}
          >
            <Form.Item
              label="Item Name"
              name="name"
              rules={[{ required: true, message: 'Please input the item name!' }]}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input placeholder="Enter item name" />
                <Button 
                  icon={<AudioOutlined style={isListening ? { color: '#ff4d4f' } : undefined} />} 
                  onClick={handleVoiceInput}
                />
                <Button 
                  icon={<QrcodeOutlined />} 
                  onClick={handleQRScan}
                />
              </Space.Compact>
            </Form.Item>

            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[{ required: true, message: 'Please input the quantity!' }]}
            >
              <Input type="number" placeholder="Enter quantity" />
            </Form.Item>

            <Form.Item
              label="Expiry Date"
              name="expiry_date"
              rules={[{ required: true, message: 'Please select expiry date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please select category!' }]}
            >
              <Select placeholder="Select category">
                <Option value="dairy">Dairy</Option>
                <Option value="fruits">Fruits</Option>
                <Option value="vegetables">Vegetables</Option>
                <Option value="meat">Meat</Option>
                <Option value="pantry">Pantry</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Add Item
                </Button>
                <Button onClick={() => router.push("/groceries")}>
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