import React, { useEffect, useState } from 'react';
import { Table, Button, Card, message } from 'antd';
import { DollarCircleOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import MyMenu from '../components/Menu';
import ModalModificarProducto from '../components/ModalModificarProducto';

const VITE_APIURL = import.meta.env.VITE_APIURL;

const Costos = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [totalCostoProveedor, setTotalCostoProveedor] = useState(0);
    const [totalGastosImportacion, setTotalGastosImportacion] = useState(0);

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}inventario`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setProductos(data.data);

            // Calcular los totales con base en el stock
            let totalCosto = 0;
            let totalGastos = 0;
            data.data.forEach(producto => {
                totalCosto += (parseFloat(producto.costo_proveedor_usd) || 0) * (parseInt(producto.en_stock) || 0);
                totalGastos += (parseFloat(producto.gastos_importacion_ars) || 0) * (parseInt(producto.en_stock) || 0);
            });

            setTotalCostoProveedor(totalCosto);
            setTotalGastosImportacion(totalGastos);
        } catch (error) {
            message.error('Error al obtener los productos');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product) => {
        setCurrentProduct(product);
        setModalEditarVisible(true);
    };

    const handleUpdateProduct = async (updatedProduct) => {
        try {
            const response = await fetch(`${VITE_APIURL}inventario/${currentProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el producto');
            }

            message.success('Producto actualizado con éxito');
            fetchProductos(); // Refrescar la lista
            setModalEditarVisible(false);
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            message.error('Error al actualizar el producto');
        }
    };

    const columns = [
        {
            title: 'Código',
            dataIndex: 'codigo',
            key: 'codigo',
        },
        {
            title: 'Descripción',
            dataIndex: 'descripcion',
            key: 'descripcion',
        },
        {
            title: 'Stock Disponible',
            dataIndex: 'en_stock',
            key: 'en_stock',
        },
        {
            title: 'Costo Proveedor (USD)',
            dataIndex: 'costo_proveedor_usd',
            key: 'costo_proveedor_usd',
            render: (value) => `$${value}`,
        },
        {
            title: 'Gastos Importación (USD)',
            dataIndex: 'gastos_importacion_ars',
            key: 'gastos_importacion_ars',
            render: (value) => `$${value}`,
        },
        {
            title: 'Costo Total (USD)',
            key: 'costo_total_usd',
            render: (_, record) => `$${(record.costo_proveedor_usd * record.en_stock).toFixed(2)}`,
        },
        {
            title: 'Gasto Total Importación (USD)',
            key: 'gasto_total_ars',
            render: (_, record) => `$${(record.gastos_importacion_ars * record.en_stock).toFixed(2)}`,
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Button type="primary" onClick={() => handleEditClick(record)}>Editar</Button>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <MyMenu /> {/* Menú lateral */}
            <div style={{ flex: 1, padding: '20px' }}>
                <h1>Gestión de Costos</h1>

                {/* Tarjetas con Totales */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <Card
                        style={{ width: 300, backgroundColor: '#1890ff', color: 'white' }}
                        bordered={false}
                    >
                        <h3 style={{ color: 'white' }}>Costo Total Proveedor (USD)</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                            <DollarCircleOutlined style={{ marginRight: '10px' }} />
                            ${totalCostoProveedor.toFixed(2)}
                        </p>
                    </Card>

                    <Card
                        style={{ width: 300, backgroundColor: '#faad14', color: 'white' }}
                        bordered={false}
                    >
                        <h3 style={{ color: 'white' }}>Total Gastos Importación (USD)</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                            <MoneyCollectOutlined style={{ marginRight: '10px' }} />
                            ${totalGastosImportacion.toFixed(2)}
                        </p>
                    </Card>
                </div>

                {/* Tabla de Productos */}
                <Table
                    columns={columns}
                    dataSource={productos}
                    rowKey="id"
                    loading={loading}
                    bordered
                />
            </div>

            {/* Modal para modificar los costos */}
            <ModalModificarProducto
                visible={modalEditarVisible}
                onClose={() => setModalEditarVisible(false)}
                onSubmit={handleUpdateProduct}
                initialValues={currentProduct}
                VITE_APIURL={VITE_APIURL}
            />
        </div>
    );
};

export default Costos;
