import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';

const ReporteCategorias = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${VITE_APIURL}inventario`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error('Error al obtener productos');
                const data = await response.json();
                setProductos(data.data);
            } catch (error) {
                console.error('Error:', error);
                message.error('No se pudo cargar la información');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = [
        { title: 'Código', dataIndex: 'codigo', key: 'codigo' },
        { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
        {
            title: 'Categoría',
            dataIndex: 'categoria',
            key: 'categoria',
            render: (categoria) => categoria?.nombre || "Sin categoría"
        },
        { title: 'Proveedor', dataIndex: 'proveedor', key: 'proveedor' },
        { title: 'Precio', dataIndex: 'precio', key: 'precio' },
        { title: 'Costo', dataIndex: 'costo', key: 'costo' },
        { title: 'Gastos de Importación', dataIndex: 'gastos_importacion', key: 'gastos_importacion' },
        { title: 'Stock Real', dataIndex: 'stock_real', key: 'stock_real' },
        { title: 'Mínimo', dataIndex: 'minimo', key: 'minimo' },
        { title: 'Máximo', dataIndex: 'maximo', key: 'maximo' },
        { title: 'Estado', dataIndex: 'estado', key: 'estado' },
        {
            title: 'Salidas por Fecha',
            dataIndex: 'salidas_por_fecha',
            key: 'salidas_por_fecha',
            render: (salidas) => (
                <ul>
                    {salidas?.map((salida, index) => (
                        <li key={index}>
                            📅 {salida.fecha}: <strong>{salida.cantidad}</strong> unidades
                        </li>
                    )) || "Sin registros"}
                </ul>
            )
        }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">📊 Reporte de Productos</h1>
            <Table
                columns={columns}
                dataSource={productos.map((item, index) => ({ ...item, key: item.id || index }))}
                bordered
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default ReporteCategorias;
