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
            // Obtener todos los movimientos con estado "pendiente"
            const movimientosResponse = await fetch(`${VITE_APIURL}movimientos?estado=pendiente&motivo=ingreso`, {
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

            // console.log(movimientosData)

            /*     // Obtener información del producto desde inventario para cada movimiento
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
                                existente: esExistente,
                                usuario: movimiento.usuario // Solo si el estado es aprobado
                            };
                        } catch (error) {
                            console.warn(`Producto ${movimiento.codigo_producto} no está en inventario, marcándolo como nuevo`);
                            return {
                                codigo: movimiento.codigo_producto,
                                descripcion: "Nuevo Producto",
                                cantidad_movimiento: movimiento.cantidad,
                                tipo_movimiento: movimiento.motivo,
                                existente: false,
                                usuario: movimiento.usuario // Producto no encontrado en inventario
                            };
                        }
                    })
                ); */

            setProductosPendientes(movimientosData?.movimientos);
        } catch (error) {
            console.error('Error al obtener los productos pendientes:', error);
            message.error('Error al obtener los productos pendientes');
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
            dataIndex: 'estado',
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