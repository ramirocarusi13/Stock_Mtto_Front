import React, { useEffect, useState } from 'react';
import { Table, Button, Card, message } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import MyMenu from '../components/Menu';
import ModalModificarProducto from '../components/ModalModificarProducto';

const VITE_APIURL = import.meta.env.VITE_APIURL;

const Costos = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [totalCostoInventario, setTotalCostoInventario] = useState(0);

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

            // Calcular el total del costo del inventario
            let totalCosto = 0;
            data.data.forEach(producto => {
                totalCosto += (parseFloat(producto.costo_por_unidad) || 0) * (parseInt(producto.en_stock) || 0);
            });

            setTotalCostoInventario(totalCosto);
        } catch (error) {
            
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
            title: 'Costo por Unidad (USD)',
            dataIndex: 'costo_por_unidad',
            key: 'costo_por_unidad',
            render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-',
        },
        {
            title: 'Costo Total (USD)',
            key: 'costo_total',
            render: (_, record) => {
                const costoTotal = (record.costo_por_unidad * record.en_stock).toFixed(2);
                return `$${costoTotal}`;
            },
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

                {/* Tarjeta con el Costo Total del Inventario */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <Card
                        style={{ width: 350, backgroundColor: '#1890ff', color: 'white' }}
                        bordered={false}
                    >
                        <h3 style={{ color: 'white' }}>Costo Total del Inventario (USD)</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                            <DollarCircleOutlined style={{ marginRight: '10px' }} />
                            ${totalCostoInventario.toFixed(2)}
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
