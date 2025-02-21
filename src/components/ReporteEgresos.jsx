import React, { useEffect, useState } from 'react';
import { Table, DatePicker, message, Button } from 'antd';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { RangePicker } = DatePicker;

const ReporteEgresos = () => {
    const [fechaFiltro, setFechaFiltro] = useState([]);
    const [egresos, setEgresos] = useState([]);
    const [totalEgresos, setTotalEgresos] = useState(0);
    const [loading, setLoading] = useState(false);
    const [egresosPorCategoria, setEgresosPorCategoria] = useState([]);
    const [costosPorCategoria, setCostosPorCategoria] = useState([]);
    const [rangoFechasTitulo, setRangoFechasTitulo] = useState('');

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    const fetchEgresos = async () => {
        setLoading(true);
        try {
            let url = `${VITE_APIURL}egresos-con-productos`;
            if (fechaFiltro.length === 2) {
                const fechaInicio = fechaFiltro[0].format('YYYY-MM-DD');
                const fechaFin = fechaFiltro[1].format('YYYY-MM-DD');
                url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
                setRangoFechasTitulo(` ${fechaFiltro[0].format('DD/MM/YYYY')} al ${fechaFiltro[1].format('DD/MM/YYYY')}`);
            } else {
                setRangoFechasTitulo('');
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Error al obtener egresos.');

            const data = await response.json();
            console.log(data);

            setEgresos(data.egresos);
            setTotalEgresos(data.egresos.reduce((acc, egreso) => acc + Math.abs(egreso.cantidad), 0));

            const movimientosPorCategoria = {};
            const costosPorCategoriaData = {};

            data.egresos.forEach((egreso) => {
                const nombreCategoria = egreso.producto?.categoria?.nombre || 'Sin categoría';
                const cantidadEgreso = Math.abs(egreso.cantidad);
                const costoUnitario = parseFloat(egreso.producto?.costo_por_unidad) || 0;
                const costoTotalEgreso = cantidadEgreso * costoUnitario;

                movimientosPorCategoria[nombreCategoria] = (movimientosPorCategoria[nombreCategoria] || 0) + cantidadEgreso;
                costosPorCategoriaData[nombreCategoria] = (costosPorCategoriaData[nombreCategoria] || 0) + costoTotalEgreso;
            });

            const categoriasProcesadas = Object.entries(movimientosPorCategoria).map(([categoria, cantidad]) => ({
                categoria,
                cantidad,
                color: getRandomColor(),
            }));

            const costosProcesados = Object.entries(costosPorCategoriaData).map(([categoria, costoTotal]) => ({
                categoria,
                costoTotal: parseFloat(costoTotal.toFixed(2)),
                color: getRandomColor(),
            }));

            setEgresosPorCategoria(categoriasProcesadas);
            setCostosPorCategoria(costosProcesados);
        } catch (error) {
            console.error('Error:', error);
            message.error('No se pudieron obtener los egresos.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const columns = [
        { title: 'Código', dataIndex: 'codigo_producto', key: 'codigo' },
        { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
        { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
        {
            title: 'Fecha',
            dataIndex: 'created_at',
            key: 'fecha',
            render: (fecha) => new Intl.DateTimeFormat('es-ES', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).format(new Date(fecha))
        },
        { title: 'Producto', dataIndex: ['producto', 'descripcion'], key: 'producto' },
        { title: 'Stock Actual', dataIndex: ['producto', 'en_stock'], key: 'stock' },
        { title: 'Costo por Unidad', dataIndex: ['producto', 'costo_por_unidad'], key: 'costo_por_unidad', render: (value) => `$${value || 0}` },
        {
            title: 'Costo Total del Egreso',
            key: 'costo_total',
            render: (_, record) => `$${(Math.abs(record.cantidad) * (record.producto?.costo_por_unidad || 0)).toFixed(2)}`
        },
        {
            title: 'Categoría',
            dataIndex: ['producto', 'categoria', 'nombre'],
            key: 'categoria',
            render: (_, record) => record?.producto?.categoria?.nombre || 'N/A'
        },
    ];

    return (
        <div className="p-2 bg-gray-100 min-h-screen">
            <div className='flex flex-row justify-between items-center w-full px-4'>
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">📦 Reporte de Egresos</h1>
                <h2 className="text-md font-semibold mb-3 text-center">{rangoFechasTitulo}</h2>
                <div className="flex justify-center mb-3 space-x-2">
                    <RangePicker onChange={setFechaFiltro} className="p-1 rounded border text-sm" />
                    <Button type="primary" onClick={fetchEgresos} loading={loading} size="medium">
                        Buscar
                    </Button>
                    <Button type="primary" onClick={handlePrint} size="medium">
                        Imprimir
                    </Button>
                </div>
                <h2 className="text-lg font-semibold mb-3 text-center text-gray-700">Total egresos: {totalEgresos}</h2>
            </div>

            <Table
                columns={columns}
                dataSource={egresos.map((item, index) => ({ ...item, key: index }))}
                bordered
                loading={loading}
                pagination={{ pageSize: 9 }}
                className="shadow-md rounded-lg bg-white text-sm"
                size="small"
            />

            <div className="mt-4 flex flex-col lg:flex-row justify-center items-center gap-3">
                <div className="w-full bg-white shadow-md rounded-lg lg:w-1/2 p-3">
                    <h2 className="text-lg font-bold mb-3 text-center">📊 Egresos por Categoría</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={egresosPorCategoria} dataKey="cantidad" nameKey="categoria" outerRadius={90} label>
                                {egresosPorCategoria.map((entry) => (
                                    <Cell key={entry.categoria} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full bg-white shadow-md rounded-lg lg:w-1/2 p-3">
                    <h2 className="text-lg font-bold mb-3 text-center">💰 Costos de Egresos por Categoría</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={costosPorCategoria}
                                dataKey="costoTotal"
                                nameKey="categoria"
                                outerRadius={90}
                                label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                            >
                                {costosPorCategoria.map((entry) => (
                                    <Cell key={entry.categoria} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Estilos para la impresión */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .printable-area, .printable-area * {
                            visibility: visible;
                        }
                        .printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .ant-table, .recharts-wrapper {
                            width: 100% !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default ReporteEgresos;