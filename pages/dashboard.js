import { Card, List, Avatar, Space, Typography, Skeleton, Button, message, Select } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const { Title, Text } = Typography;

export async function getStaticProps() {
  const usersRes = await fetch('https://dummyjson.com/users');

  const usersData = await usersRes.json();
  const totalEmployees = usersData.total || 0;

  const departmentSet = new Set();
  usersData.users.forEach(user => {
    if (user.company && user.company.department) {
      departmentSet.add(user.company.department);
    }
  });
  const departments = Array.from(departmentSet);

  return {
    props: {
      totalEmployees,
      departments,
    },
    revalidate: 3600,
  };
}



export default function Dashboard({ totalEmployees, departments }) {
  const { theme, toggleTheme } = useAppContext();
  const [randomEmployee, setRandomEmployee] = useState(null);
  const [loadingRandom, setLoadingRandom] = useState(true);
  const [employeeList, setEmployeeList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const employeesLimit = 10;

  const fetchRandomEmployee = useCallback(async () => {
    setLoadingRandom(true);
    const randomId = Math.floor(Math.random() * 100) + 1;
    try {
      const res = await fetch(`https://dummyjson.com/users/${randomId}`);
      const data = await res.json();
      setRandomEmployee(data);
    } catch (error) {
      message.error('Failed to fetch random employee.');
    } finally {
      setLoadingRandom(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomEmployee();
  }, [fetchRandomEmployee]);

  const loadMoreEmployees = useCallback(async () => {
    if (listLoading) return;
    setListLoading(true);
    const skip = (page - 1) * employeesLimit;
    try {
      const res = await fetch(`https://dummyjson.com/users?limit=${employeesLimit}&skip=${skip}`);
      const data = await res.json();
      setEmployeeList(prevList => [...prevList, ...data.users]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      message.error('Failed to load more employees.');
    } finally {
      setListLoading(false);
    }
  }, [listLoading, page]);

  useEffect(() => {
    loadMoreEmployees();
  }, []);

  // Get unique departments from loaded employees
  const uniqueDepartments = Array.from(new Set(employeeList.map(employee => employee.company?.department).filter(Boolean)));





  return (
    <div style={{ padding: '20px', background: theme === 'dark' ? '#222' : '#f0f2f5', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ color: theme === 'dark' ? 'white' : 'black' }}>
          Dashboard
        </Title>
        
        <Button 
          onClick={toggleTheme} 
          style={{ width: '150px', background: theme === 'dark' ? '#666' : '#ccc', color: theme === 'dark' ? 'white' : 'black' }}
        >
          Toggle Theme ({theme === 'light' ? 'Dark' : 'Light'})
        </Button>
        
        <Space wrap size="large">
          <Card
            title="Total Employees"
            bordered={false}
            style={{ width: 300, background: theme === 'dark' ? '#444' : 'white', color: theme === 'dark' ? 'white' : 'black' }}
          >
            <Title level={1} style={{ color: theme === 'dark' ? '#1890ff' : '#001529' }}>
              {totalEmployees}
            </Title>
            <Text type="secondary" style={{ color: theme === 'dark' ? '#bbb' : '#888' }}>
              Fetched on static generation
            </Text>
          </Card>
          
          <Card
            title="Employee of the Day"
            bordered={false}
            extra={<Button icon={<ReloadOutlined />} onClick={fetchRandomEmployee} loading={loadingRandom} size="small" />}
            style={{ width: 300, background: theme === 'dark' ? '#444' : 'white', color: theme === 'dark' ? 'white' : 'black' }}
          >
            {loadingRandom || !randomEmployee ? (
              <Skeleton loading active avatar />
            ) : (
              <Space>
                <Avatar size={64} src={randomEmployee.image} />
                <Space direction="vertical" size={0}>
                  <Text strong style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                    {randomEmployee.firstName} {randomEmployee.lastName}
                  </Text>
                  <Text type="secondary" style={{ color: theme === 'dark' ? '#bbb' : '#888' }}>
                    {randomEmployee.company.name}
                  </Text>
                </Space>
              </Space>
            )}
          </Card>
          

        </Space>

        <Card
          title="Departments List"
          bordered={false}
          style={{ width: '100%', background: theme === 'dark' ? '#444' : 'white', color: theme === 'dark' ? 'white' : 'black' }}
        >
          <List
            size="small"
            bordered
            dataSource={departments}
            renderItem={(item) => (
              <List.Item>
                {String(item).charAt(0).toUpperCase() + String(item).slice(1).replace('-', ' ')}
              </List.Item>
            )}
            style={{ background: theme === 'dark' ? '#555' : '#fafafa' }}
          />
        </Card>

        <Card
          title={`Infinite Scroll Employee List (${employeeList.length} loaded)`}
          bordered={false}
          style={{ width: '100%', background: theme === 'dark' ? '#444' : 'white', color: theme === 'dark' ? 'white' : 'black' }}
        >
          <List
            itemLayout="horizontal"
            dataSource={employeeList}
            renderItem={(employee) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={employee.image} />}
                  title={<Link href={`/employees/${employee.id}`} style={{ color: theme === 'dark' ? 'white' : 'black' }}>{`${employee.firstName} ${employee.lastName}`}</Link>}
                  description={employee.company.title}
                />
              </List.Item>
            )}
          >
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              {listLoading ? (
                <Skeleton paragraph={{ rows: 1 }} active />
              ) : (
                <Button onClick={loadMoreEmployees} disabled={employeeList.length >= totalEmployees}>
                  {employeeList.length < totalEmployees ? 'Load More' : 'No More Employees'}
                </Button>
              )}
            </div>
          </List>
        </Card>

      </Space>
    </div>
  );
}