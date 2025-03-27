"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Button, 
  Card, 
  Table, 
  Input, 
  Space,
  Tag,
  Typography,
  Layout,
  App,
  Popconfirm,
  Badge,
  Divider,
  TableColumnType
} from "antd"
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ShoppingCartOutlined 
} from "@ant-design/icons"

const { Header, Content } = Layout
const { Title, Text } = Typography

type GroceryStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

interface GroceryItem {
  key: string
  name: string
  category: string
  quantity: number
  price: number
  status: GroceryStatus
  lastPurchased: string
}

type GroceryColumnType = TableColumnType<GroceryItem> & {
  render?: (text: never, record: GroceryItem) => React.ReactNode
}

export default function GroceriesPage() {
  const { message } = App.useApp()
  const router = useRouter()
  const [searchText, setSearchText] = useState<string>('')

  const [groceries, setGroceries] = useState<GroceryItem[]>([
    {
      key: '1',
      name: 'Organic Apples',
      category: 'Fruits',
      quantity: 10,
      price: 2.99,
      status: 'in-stock',
      lastPurchased: '2023-05-15'
    },
    {
      key: '2',
      name: 'Whole Milk',
      category: 'Dairy',
      quantity: 2,
      price: 3.49,
      status: 'low-stock',
      lastPurchased: '2023-05-18'
    },
    {
      key: '3',
      name: 'Whole Wheat Bread',
      category: 'Bakery',
      quantity: 0,
      price: 4.29,
      status: 'out-of-stock',
      lastPurchased: '2023-05-10'
    }
  ])

  const handleAddItem = (): void => {
    router.push('./groceries/add')
  }

  const handleEdit = (key: string): void => {
    router.push(`./groceries/edit/${key}`)
  }

  const handleDelete = (key: string): void => {
    setGroceries(groceries.filter(item => item.key !== key))
    message.success('Item deleted successfully')
  }

  const filteredData = groceries.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns: GroceryColumnType[] = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <ShoppingCartOutlined />
          <Text strong>{record.name}</Text>
          {record.status === 'out-of-stock' && (
            <Tag color="red">Out of Stock</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => (
        <Badge 
          count={record.quantity} 
          color={
            record.status === 'in-stock' ? 'green' : 
            record.status === 'low-stock' ? 'orange' : 'red'
          }
        />
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => `$${record.price.toFixed(2)}`
    },
    {
      title: 'Last Purchased',
      dataIndex: 'lastPurchased',
      key: 'lastPurchased'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record.key)}
          />
          <Popconfirm
            title="Delete this item?"
            description="Are you sure you want to delete this grocery item?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={4} style={{ margin: 0 }}>
          <ShoppingCartOutlined style={{ marginRight: 12 }} />
          Grocery List
        </Title>
        <Space>
          <Input
            placeholder="Search groceries..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddItem}
          >
            Add Item
          </Button>
        </Space>
      </Header>
      
      <Divider style={{ margin: 0 }} />
      
      <Content style={{ padding: '24px' }}>
        <Card
          styles={{
            body: { padding: 0 }
          }}
        >
          <Table 
            columns={columns} 
            dataSource={filteredData}
            pagination={{ pageSize: 6 }}
            rowClassName={(record) => 
              record.status === 'out-of-stock' ? 'ant-table-row-out-of-stock' : ''
            }
          />
        </Card>
      </Content>
    </Layout>
  )
}