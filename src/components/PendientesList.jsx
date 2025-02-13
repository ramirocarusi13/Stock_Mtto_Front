import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, message, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import ModalAprobarProducto from '../components/ModalAprobarProducto';
import MyMenu from '../components/Menu';

const { Title } = Typography;

const PendientesList = () => {
    const [productosPendientes, setProductosPendientes] = useState([]);
    const [modalAprobarVisible, setModalAprobarVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        const fetchMovimientosPendientes = async () => {
            setLoading(true);
            try {
                // Obtener todos los movimientos con estado "pendiente"
                const movimientosResponse = await fetch(`${VITE_APIURL}movimientos?estado=pendiente`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!movimientosResponse.ok) {
                    throw new Error('Error al obtener los movimientos pendientes');
                }

                const movimientosData = await movimientosResponse.json();

                // Obtener información del producto desde inventario para cada movimiento
                const productosConDatos = await Promise.all(
                    movimientosData.movimientos.map(async (movimiento) => {
                        try {
                            const inventarioResponse = await fetch(`${VITE_APIURL}inventario/${movimiento.codigo_producto}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (!inventarioResponse.ok) {
                                throw new Error(`Producto ${movimiento.codigo_producto} no encontrado en inventario`);
                            }

                            const inventarioData = await inventarioResponse.json();
                            const productoEnInventario = inventarioData.producto;
                            
                            // Definir si el producto ya existe en inventarios y si está aprobado
                            const esExistente = productoEnInventario && productoEnInventario.estado === 'aprobado';

                            return {
                                ...productoEnInventario,
                                cantidad_movimiento: movimiento.cantidad, // Cantidad del movimiento
                                tipo_movimiento: movimiento.motivo, // Tipo de movimiento
                                existente: esExistente, // Solo si el estado es aprobado
                            };
                        } catch (error) {
                            console.warn(`Producto ${movimiento.codigo_producto} no está en inventario, marcándolo como nuevo`);
                            return {
                                codigo: movimiento.codigo_producto,
                                descripcion: "Nuevo Producto",
                                cantidad_movimiento: movimiento.cantidad,
                                tipo_movimiento: movimiento.motivo,
                                existente: false, // Producto no encontrado en inventario
                            };
                        }
                    })
                );

                setProductosPendientes(productosConDatos);
            } catch (error) {
                console.error('Error al obtener los productos pendientes:', error);
                message.error('Error al obtener los productos pendientes');
            } finally {
                setLoading(false);
            }
        };

        fetchMovimientosPendientes();
    }, []);

    const handleApproveClick = (product) => {
        setCurrentProduct(product);
        setModalAprobarVisible(true);
    };

    const handleStatusChange = (codigoProducto, newStatus) => {
        setProductosPendientes(prev => prev.filter(p => p.codigo !== codigoProducto));
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <MyMenu />

            <div style={{ flex: 1, padding: '20px' }}>
                <Title level={2} style={{ textAlign: 'center' }}>Movimientos Pendientes</Title>
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
                            title: 'Cantidad',
                            dataIndex: 'cantidad_movimiento',
                            key: 'cantidad_movimiento',
                            render: (cantidad) => cantidad ?? 0,
                        },
                        {
                            title: 'Tipo de Movimiento',
                            dataIndex: 'tipo_movimiento',
                            key: 'tipo_movimiento',
                            render: (tipo) => (
                                <Tag color={tipo === 'ingreso' ? 'green' : tipo === 'egreso' ? 'red' : 'blue'}>
                                    {tipo.toUpperCase()}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Estado del Producto',
                            dataIndex: 'existente',
                            key: 'existente',
                            render: (esExistente) => (
                                <div>
                                    <Tag color={esExistente ? 'cyan' : 'gold'}>
                                        {esExistente ? 'Stock Existente' : 'Nuevo Producto'}
                                    </Tag>
                                    {esExistente && (
                                        <Tag color="blue" style={{ marginLeft: '5px' }}>
                                            Suma de Cantidad
                                        </Tag>
                                    )}
                                </div>
                            ),
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
                    rowKey="codigo"
                    bordered
                    loading={loading}
                />
            </div>

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
