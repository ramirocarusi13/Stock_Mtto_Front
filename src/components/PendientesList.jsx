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

    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const role = userData.rol || 'Sin rol';

    const fetchMovimientosPendientes = async () => {
        setLoading(true);
        try {
            const movimientosResponse = await fetch(`${VITE_APIURL}movimientos?estado=pendiente&motivo=ingreso`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!movimientosResponse.ok) {
                throw new Error('Error al obtener los movimientos pendientes');
            }

            const movimientosData = await movimientosResponse.json();

            const productosConDatos = await Promise.all(
                movimientosData.movimientos.map(async (movimiento) => {
                    try {
                        const inventarioResponse = await fetch(`${VITE_APIURL}inventario/${movimiento.codigo_producto}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!inventarioResponse.ok) {
                            throw new Error('Producto no encontrado');
                        }

                        const inventarioData = await inventarioResponse.json();

                        // Verificar claramente si el producto existe y está aprobado
                        const esExistente = inventarioData?.producto && inventarioData.producto.estado === 'aprobado';

                        return {
                            ...movimiento,
                            producto: inventarioData.producto,
                            existente: esExistente
                        };
                    } catch (error) {
                        // Si el producto no existe, se maneja aquí claramente
                        return {
                            ...movimiento,
                            producto: { descripcion: "Nuevo Producto" },
                            existente: false
                        };
                    }
                })
            );

            setProductosPendientes(productosConDatos);
        } catch (error) {
            console.error('Error al obtener los productos pendientes:', error);
            
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMovimientosPendientes();
    }, []);

    const handleApproveClick = (product) => {
        setCurrentProduct(product);
        setModalAprobarVisible(true);
    };

    const handleStatusChange = (codigoProducto, newStatus) => {
        // setProductosPendientes(prev => prev.filter(p => p.codigo !== codigoProducto));
        fetchMovimientosPendientes()
    };

    // Definir las columnas de la tabla
    const columns = [
        {
            title: 'Código',
            dataIndex: 'codigo_producto',
            key: 'codigo',
        },
        {
            title: 'Producto',
            dataIndex: 'descripcion',
            key: 'descripcion',
            render: (_, r) => r?.producto?.descripcion
        },
        {
            title: 'Cantidad',
            dataIndex: 'cantidad',
            key: 'cantidad',
            // render: (cantidad) => cantidad ?? 0,
        },
        {
            title: 'Tipo de Movimiento',
            dataIndex: 'motivo',
            key: 'motivo',
            render: (tipo) => (
                <Tag color={tipo === 'ingreso' ? 'green' : tipo === 'egreso' ? 'red' : 'blue'}>
                    {tipo?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Estado del Producto',
            dataIndex: 'existente',
            key: 'estado',
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
            title: 'Usuario creador',
            dataIndex: 'usuario_nombre',
            key: 'usuario_nombre',
            render: (_, r) => <Tag color="purple">{r.usuario?.name}</Tag>,
        },
    ];

    // Agregar la columna de "Acciones" solo si el rol es "gerente"
    if (role === 'gerente' || role === 'group_leader') {
        columns.push({
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
        });
    }


    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <MyMenu />

            <div style={{ flex: 1, padding: '20px' }}>
                <Title level={2} style={{ textAlign: 'center' }}>Pendientes</Title>
                <Table
                    columns={columns} // Usar las columnas definidas
                    dataSource={productosPendientes}
                    rowKey={(record) => `${record.codigo}-${record.tipo_movimiento}-${record.cantidad_movimiento}-${Math.random()}`} // Clave única
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