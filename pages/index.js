import React, { useState, useMemo } from 'react';
import { Layout, Menu, Button, Space, Typography, theme, Avatar } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, TeamOutlined, BulbOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const CustomLink = ({ href, children }) => <a href={href} style={{ textDecoration: 'none' }}>{children}</a>;

const AppLayout = ({ children, activeKey }) => {
    const {
        theme: contextTheme,
        toggleTheme,
        isLoggedIn,
        userName
    } = useAppContext();
    const [collapsed, setCollapsed] = useState(false);

    const { token } = theme.useToken();

    const siderBg = contextTheme === 'dark' ? token.colorBgContainer : '#000000';

    const items = useMemo(() => [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: <CustomLink href="/dashboard">Dashboard</CustomLink>,
        },
        {
            key: '/employees',
            icon: <TeamOutlined />,
            label: <CustomLink href="/employees">Employees List</CustomLink>,
        },
    ], []);

    return (
        <Layout style={{ minHeight: '100vh' }}>

            <Sider
                theme={contextTheme}
                breakpoint="lg"
                collapsedWidth="0"
            >
            <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                <Title level={4} style={{ color: contextTheme === 'dark' ? '#fff' : '#000000', lineHeight: '32px' }}>
                    Employee App
                </Title>
            </div>
            <Menu
                theme={contextTheme}
                mode="inline"
                defaultSelectedKeys={[activeKey]}
                items={items}
            />
            <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: '0 16px', color: contextTheme === 'dark' ? '#aaa' : '#555' }}>
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <span>{isLoggedIn ? userName : 'Guest'}</span>
                </Space>
            </div>
            </Sider>

            <Layout>
                <Header 
                    style={{ 
                        background: contextTheme === 'dark' ? '#000000' : '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 24px' 
                    }}
                >
                    <Space>
                         <Title level={4} style={{ margin: 0, color: contextTheme === 'dark' ? 'white' : 'black' }}>
                            Hello, {userName}
                        </Title>
                    </Space>
                    
                    <Button 
                        icon={<BulbOutlined />}
                        onClick={toggleTheme}
                        style={{ background: contextTheme === 'dark' ? '#555' : '#eee', color: contextTheme === 'dark' ? 'white' : 'black' }}
                    >
                        {contextTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </Button>
                </Header>

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: contextTheme === 'dark' ? '#000000' : '#fff',
                        color: contextTheme === 'dark' ? 'white' : 'black',
                        borderRadius: token.borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;