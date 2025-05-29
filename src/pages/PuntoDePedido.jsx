import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, message } from 'antd';
import MyMenu from '../components/Menu';

const { Title } = Typography;

const PuntoDePedido = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}inventario/punto-de-pedido`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error desconocido');
            }

            const data = await response.json();
            setProductos(data.data || []);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            message.error(`Error al cargar productos: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const columnas = [
        {
            title: 'Código',
            dataIndex: 'codigo',
            key: 'codigo',
            render: (codigo) => <Tag color="volcano">{codigo}</Tag>,
        },
        {
            title: 'Producto',
            dataIndex: 'descripcion',
            key: 'descripcion',
            render: (desc) => <Tag color="purple">{desc}</Tag>,
        },
        {
            title: 'Proveedor',
            dataIndex: ['proveedor', 'nombre'],
            key: 'proveedor',
            render: (prov) => <Tag color="geekblue">{prov || 'N/A'}</Tag>,
        },
        {
            title: 'Stock Actual',
            dataIndex: 'stock_real',
            key: 'stock_real',
            render: (valor) => (
                <Tag color={valor === 0 ? 'red' : 'orange'}>
                    {valor ?? 0}
                </Tag>
            ),
        },
        {
            title: 'Punto de Pedido',
            dataIndex: 'punto_de_pedido',
            key: 'punto_de_pedido',
            render: (valor) => <Tag color="gold">{valor ?? 0}</Tag>,
        },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Menú lateral */}
            <div className="w-64 bg-gray-800 text-white min-h-screen">
                <MyMenu />
            </div>

            {/* Contenido principal */}
            <div className="flex-1 p-6 bg-gray-100">
                <Title level={3} className="text-center text-yellow-600 mb-6">
                    ⚠️ Productos que llegaron al Punto de Pedido
                </Title>

                <Table
                    dataSource={productos}
                    columns={columnas}
                    rowKey="codigo"
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 10 }}
                    className="shadow-lg bg-white rounded-lg"
                    rowClassName="hover:bg-yellow-50 transition-colors duration-200 text-sm"
                />
            </div>
        </div>
    );
};

export default PuntoDePedido;
