import React from 'react';
import { Layout } from 'antd';
import MyMenu from '../components/Menu';
import PrestamosList from '../components/PrestamosList';

const { Sider, Content } = Layout;

const Prestamos = ({ VITE_APIURL }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Menú a la izquierda */}
            <Sider width={250} style={{ background: '#001529',  }}>
                <MyMenu />
            </Sider>
            
            {/* Contenido a la derecha */}
            <Layout style={{ padding: '20px', flex: 1 }}>
                <Content>
                    <PrestamosList VITE_APIURL={VITE_APIURL} />
                </Content>
            </Layout>
        </Layout>
    );
};

export default Prestamos;
