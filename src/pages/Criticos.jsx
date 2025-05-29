import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, message } from 'antd';
import MyMenu from '../components/Menu'; // Asegurate de importar el menú

const { Title } = Typography;

const Criticos = () => {
    const [productosCriticos, setProductosCriticos] = useState([]);
    const [loading, setLoading] = useState(false);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        obtenerProductosCriticos();
    }, []);

    const obtenerProductosCriticos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}inventario`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            const aprobados = data.data.filter(p => p.estado === 'aprobado');

            const criticos = aprobados.filter(producto => {
                const stock = producto.stock?.reduce((acc, cur) => acc + parseFloat(cur.cantidad), 0) ?? 0;
                return stock <= (producto.minimo ?? 0);
            });

            setProductosCriticos(criticos);
        } catch (error) {
            console.error('Error al cargar productos críticos:', error);
            message.error('Error al cargar productos críticos');
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
            key: 'stock_real',
            render: (_, record) => {
                const stock = record?.stock?.reduce((acc, cur) => acc + parseFloat(cur.cantidad), 0) ?? 0;
                return <Tag color="red">{stock}</Tag>;
            },
        },
        {
            title: 'Stock Mínimo',
            dataIndex: 'minimo',
            key: 'minimo',
            render: (min) => <Tag color="cyan">{min ?? 0}</Tag>,
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
                <Title level={3} className="text-center text-red-600 mb-6">
                    📉 Productos Críticos (por debajo del mínimo)
                </Title>

                <Table
                    dataSource={productosCriticos}
                    columns={columnas}
                    rowKey="codigo"
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 10 }}
                    className="shadow-lg bg-white rounded-lg"
                    rowClassName="hover:bg-red-50 transition-colors duration-200 text-sm"
                />
            </div>
        </div>
    );
};

export default Criticos;
