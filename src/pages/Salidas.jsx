import React from 'react';
import { Layout } from 'antd';
import MyMenu from '../components/Menu';
import SalidasList from '../components/SalidasList';

const { Sider, Content } = Layout;

const Salidas = () => {
    return (
        <Layout style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Menú lateral */}
            <Sider width={250} style={{ background: '#001529' }}>
                <MyMenu />
            </Sider>

            {/* Contenido principal */}
            <Layout style={{ padding: '20px', flex: 1, background: '#f5f5f5' }}>
                <Content>
                    
                    <SalidasList />
                </Content>
            </Layout>
        </Layout>
    );
};

export default Salidas;
