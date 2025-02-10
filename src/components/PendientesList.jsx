import React, { useEffect, useState } from 'react';
import { Table, Typography, Card, Button, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import ModalAprobarProducto from '../components/ModalAprobarProducto';
import MyMenu from '../components/Menu'; // Importa el menú

const { Title } = Typography;

const PendientesList = () => {
    const [productosPendientes, setProductosPendientes] = useState([]);
    const [modalAprobarVisible, setModalAprobarVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        const fetchPendientes = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${VITE_APIURL}inventario`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los productos pendientes');
                }

                const data = await response.json();
                const productosFiltrados = data.data.filter(producto => producto.estado === 'pendiente');

                setProductosPendientes(productosFiltrados);
            } catch (error) {
                console.error('Error al obtener los productos pendientes:', error);
                message.error('Error al obtener los productos pendientes');
            } finally {
                setLoading(false);
            }
        };

        fetchPendientes();
    }, []);

    const handleApproveClick = (product) => {
        setCurrentProduct(product);
        setModalAprobarVisible(true);
    };

    const handleStatusChange = (productId, newStatus) => {
        setProductosPendientes(prev => prev.filter(p => p.id !== productId));
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Barra lateral del menú */}
            <MyMenu />

            {/* Contenedor de la tabla de productos pendientes */}
            <div style={{ flex: 1, padding: '20px' }}>
            
                    <Title level={2} style={{ textAlign: 'center' }}>Productos Pendientes</Title>
                    <Table
                        columns={[
                            {
                                title: 'Código',
                                dataIndex: 'codigo',
                                key: 'codigo',
                            },
                            {
                                title: 'Producto',
                                dataIndex: 'descripcion',
                                key: 'descripcion',
                            },
                            {
                                title: 'Proveedor',
                                dataIndex: 'proveedor',
                                key: 'proveedor',
                                render: (_, record) => record?.proveedor?.nombre
                            },
                            {
                                title: 'En Stock',
                                dataIndex: 'en_stock',
                                key: 'en_stock',
                            },
                            {
                                title: 'Stock Mínimo',
                                dataIndex: 'minimo',
                                key: 'minimo',
                            },
                            {
                                title: 'Acciones',
                                key: 'acciones',
                                render: (_, record) => (
                                    <Button
                                        icon={<CheckOutlined />}
                                        onClick={() => handleApproveClick(record)}
                                        type="primary"
                                    >
                                        Aprobar
                                    </Button>
                                ),
                            },
                        ]}
                        dataSource={productosPendientes}
                        rowKey="id"
                        bordered
                        loading={loading}
                    />
                
            </div>

            {/* Modal para aprobar productos */}
            <ModalAprobarProducto
                visible={modalAprobarVisible}
                onClose={() => setModalAprobarVisible(false)}
                product={currentProduct}
                onStatusChange={handleStatusChange}
                VITE_APIURL={VITE_APIURL}
            />
        </div>
    );
};

export default PendientesList;
