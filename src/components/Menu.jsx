import React, { useState } from 'react';
import { MailOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Menu as AntMenu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const MyMenu = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    // Obtener los datos del usuario desde localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const username = userData.name || 'Usuario';
    const role = userData.rol || 'Sin rol';

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('user'); // Eliminar usuario del almacenamiento
        localStorage.removeItem('token'); // Eliminar token de autenticación
        navigate('/login'); // Redirigir a la página de inicio de sesión
    };

    return (
        <div
            style={{
                width: collapsed ? 80 : 256,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#001529',
            }}
        >
            {/* 🔹 Logo en la parte superior */}
            <div
                style={{
                    width: '100%',
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#001529',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease-in-out',
                }}
            >
                <img
                    src="/LOGO.png"
                    alt="Logo"
                    style={{
                        width: collapsed ? 60 : 220,
                        height: 'auto',
                        transition: 'width 0.3s',
                    }}
                />
            </div>

            {/* Menú Principal */}
            <AntMenu
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="dark"
                inlineCollapsed={collapsed}
                items={[
                    {
                        key: 'sub1',
                        label: 'Pañol',
                        icon: <MailOutlined />,
                        children: [
                            { key: '5', label: <Link to="/pañol/inventario">Inventario</Link> },
                            { key: '6', label: <Link to="/pañol/prestamos">Préstamos</Link> },
                            { key: '7', label: <Link to="/pañol/salidas">Salidas</Link> },
                            { key: '8', label: <Link to="/pañol/pendientes">Pendientes</Link> },
                            { key: '11', label: <Link to="/pañol/criticos">Críticos</Link> },
                            { key: '12', label: <Link to="/pañol/punto-de-pedido">Punto de Pedido</Link> },

                            role === 'gerente' && { key: '9', label: <Link to="/pañol/costos">Costos</Link> },
                            role === 'gerente' && { key: '10', label: <Link to="/pañol/reporte">Reporte</Link> },
                        ].filter(Boolean)
                        // Filtra elementos nulos (si el usuario no es gerente, no se añade "Pendientes")
                    },
                ]}
                style={{ flex: 1 }}
            />

            {/* Sección del usuario y botón de cerrar sesión */}
            <div
                style={{
                    textAlign: 'center',
                    padding: '16px 0',
                    background: '#001529',
                    color: 'white',
                }}
            >
                <UserOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>{username}</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{role}</div>

                {/* Botón de Cerrar Sesión */}
                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{
                        marginTop: '12px',
                        width: '80%',
                        background: '#ff4d4f',
                        borderColor: '#ff4d4f',
                    }}
                >
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
};

export default MyMenu;
