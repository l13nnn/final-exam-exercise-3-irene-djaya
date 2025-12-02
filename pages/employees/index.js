import { Space, Table, Card, Layout as AntdLayout, Input, Select, message } from 'antd';
import { useAppContext } from '../../context/AppContext';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export async function getServerSideProps(context) {
  try {
    const usersRes = await fetch('https://dummyjson.com/users?limit=100');

    if (!usersRes.ok) {
      throw new Error('Failed to fetch users data');
    }

    const usersData = await usersRes.json();
    const employees = usersData.users || [];

    const departments = [...new Set(employees.map(employee => employee.company?.department).filter(Boolean))];

    return {
      props: {
        employees,
        departments,
      },
    };
  } catch (error) {
    message.error('Server failed to load data: ' + error.message);
    return {
      props: {
        employees: [],
        departments: [],
      },
    };
  }
}

export default function EmployeesList({ employees, departments }) {
  const { theme, selectedDepartment } = useAppContext();
  const [searchText, setSearchText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState(selectedDepartment);

  const departmentOptions = departments.map(dep => ({
    value: dep,
    label: dep.charAt(0).toUpperCase() + dep.slice(1).replace('-', ' '),
  }));

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const departmentMatch = !filterDepartment || employee.company.department === filterDepartment;

      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const searchMatch = fullName.includes(searchText.toLowerCase());

      return departmentMatch && searchMatch;
    });
  }, [employees, filterDepartment, searchText]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Company',
      dataIndex: ['company', 'name'],
      key: 'company',
    },
    {
      title: 'Department',
      dataIndex: ['company', 'department'],
      key: 'department',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/employees/${record.id}`}>
            View Details
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <AntdLayout style={{ minHeight: '100vh', background: theme === 'dark' ? '#333' : '#f0f2f5' }}>
      <AntdLayout.Content style={{ padding: '20px' }}>
        <Card title="Employee Directory" extra={<span>Total: {employees.length}</span>} style={{ background: theme === 'dark' ? '#444' : 'white', color: theme === 'dark' ? 'white' : 'black' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space wrap>
              <Input.Search
                placeholder="Search by Name"
                allowClear
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
              <Select
                placeholder="Filter by Department"
                allowClear
                value={filterDepartment}
                onChange={setFilterDepartment}
                style={{ width: 200 }}
                options={[{ value: null, label: 'All Departments' }, ...departmentOptions]}
              />
            </Space>

            <Table
              columns={columns}
              dataSource={filteredEmployees}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </Space>
        </Card>
      </AntdLayout.Content>
    </AntdLayout>
  );
}