import { useRouter } from 'next/router';
import { Card, Descriptions, Avatar, Button, Space, Skeleton, Modal, Form, Input, message, notification } from 'antd';
import { EditOutlined, DeleteOutlined, RollbackOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { useState } from 'react';

export async function getStaticPaths() {
  const res = await fetch('https://dummyjson.com/users?limit=30');
  const data = await res.json();

  const paths = data.users.map((user) => ({
    params: { id: String(user.id) },
  }));

  return { paths, fallback: true }; 
}

export async function getStaticProps({ params }) {
  const [employeeRes, categoriesRes] = await Promise.all([
    fetch(`https://dummyjson.com/users/${params.id}`),
    fetch('https://dummyjson.com/products/categories')
  ]);
  
  const employee = await employeeRes.json();
  const categories = await categoriesRes.json();

  if (employee.message === 'User not found') {
    return { notFound: true };
  }

  const departmentIndex = employee.id % categories.length;
  const assignedDepartment = categories[departmentIndex];

  return {
    props: {
      employee,
      assignedDepartment,
    },
    revalidate: 60, 
  };
}

const EmployeeForm = ({ open, onCancel, employee, onFinish }) => {
  const [form] = Form.useForm();

  if (employee) {
    form.setFieldsValue({
      firstName: employee.firstName,
      email: employee.email,
      phone: employee.phone,
    });
  }

  return (
    <Modal
      title="Edit Employee Details"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={employee}
      >
        <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function EmployeeDetail({ employee, assignedDepartment }) {
  const router = useRouter();
  const { theme } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [employeeState, setEmployeeState] = useState(employee); 

  if (router.isFallback || !employeeState) {
    return (
      <Card style={{ padding: '20px' }}>
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  const handleEdit = (values) => {
    setEmployeeState(prev => ({ ...prev, ...values }));
    setIsModalVisible(false);
    message.success('Employee details updated!');
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: `Are you sure you want to delete ${employeeState.firstName} ${employeeState.lastName}?`,
      onOk() {
        setEmployeeState(null); 
        notification.open({
          message: 'Employee Deleted',
          description: `${employeeState.firstName} has been removed from the local list.`,
          placement: 'topRight',
        });
        router.push('/employees'); 
      },
    });
  };

  return (
    <Card 
      title={`👤 ${employeeState.firstName} ${employeeState.lastName}`} 
      style={{ background: theme === 'dark' ? '#444' : 'white', color: theme === 'dark' ? 'white' : 'black', margin: '20px' }}
      extra={
        <Button icon={<RollbackOutlined />} onClick={() => router.push('/employees')}>
          Back to List
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Avatar size={100} src={employeeState.image} />
          <Descriptions column={2} bordered size="small" style={{ flexGrow: 1 }}>
            <Descriptions.Item label="Full Name">{`${employeeState.firstName} ${employeeState.lastName}`}</Descriptions.Item>
            <Descriptions.Item label="Age">{employeeState.age}</Descriptions.Item>
            <Descriptions.Item label="Email">{employeeState.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{employeeState.phone}</Descriptions.Item>
            <Descriptions.Item label="Department" span={2}>
              **{assignedDepartment.name}**
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {`${employeeState.address.address}, ${employeeState.address.city}`}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <h3>Company Details</h3>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Company Name">{employeeState.company.name}</Descriptions.Item>
          <Descriptions.Item label="Title">{employeeState.company.title}</Descriptions.Item>
        </Descriptions>

        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => setIsModalVisible(true)}>
            Edit Employee
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Delete Employee
          </Button>

        </Space>
      </Space>

      <EmployeeForm
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        employee={employeeState}
        onFinish={handleEdit}
      />
    </Card>
  );
}