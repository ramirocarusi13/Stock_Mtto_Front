import React, { useEffect, useState } from 'react';
import { Table, Button, Select, DatePicker, message } from 'antd';
import * as XLSX from 'xlsx';
import MyMenu from '../components/Menu';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Reporte = () => {
    const [categorias, setCategorias] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDates, setSelectedDates] = useState([]);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        fetchCategorias();
    }, []);

    // Obtener categorías de productos
    const fetchCategorias = async () => {
        try {
            const response = await fetch(`${VITE_APIURL}categorias`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!response.ok) throw new Error('Error al obtener las categorías');

            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            message.error('No se pudieron cargar las categorías');
        }
    };

    // Obtener datos del reporte basado en filtros
    const fetchReportData = async () => {
        if (!selectedCategory || selectedDates.length !== 2) {
            message.warning('Seleccione una categoría y un rango de fechas.');
            return;
        }

        setLoading(true);
        try {
            const [startDate, endDate] = selectedDates;
            const response = await fetch(`${VITE_APIURL}reportes?categoria=${selectedCategory}&start=${startDate.format('YYYY-MM-DD')}&end=${endDate.format('YYYY-MM-DD')}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!response.ok) throw new Error('Error al obtener el reporte');

            const data = await response.json();
            setReportData(data);
            message.success('Reporte generado con éxito');
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            message.error('No se pudo generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    // Exportar datos a Excel
    const exportToExcel = () => {
        if (reportData.length === 0) {
            message.warning('No hay datos para exportar.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
        XLSX.writeFile(workbook, `Reporte_${selectedCategory}_${selectedDates[0].format('YYYYMMDD')}_${selectedDates[1].format('YYYYMMDD')}.xlsx`);
    };

    return (
        <div className="flex min-h-screen">
            {/* Menú lateral fijo */}
            <div className="w-64 bg-gray-800 text-white  min-h-screen">
                <MyMenu />
            </div>

            {/* Contenido principal */}
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">📊 Reportes</h1>

                {/* Filtros */}
                <div className="flex gap-4 mb-6">
                    <Select
                        placeholder="Seleccione una categoría"
                        className="w-60"
                        onChange={setSelectedCategory}
                        value={selectedCategory}
                    >
                        {categorias.map((categoria) => (
                            <Option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </Option>
                        ))}
                    </Select>

                    <RangePicker onChange={setSelectedDates} format="YYYY-MM-DD" />

                    <Button type="primary" onClick={fetchReportData} loading={loading}>
                        Generar Reporte
                    </Button>

                    <Button onClick={exportToExcel} disabled={reportData.length === 0}>
                        Exportar a Excel
                    </Button>
                </div>

                {/* Tabla de datos */}
                <Table
                    columns={[
                        { title: 'Código Producto', dataIndex: 'codigo_producto', key: 'codigo_producto' },
                        { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
                        { title: 'Cantidad Vendida', dataIndex: 'cantidad_vendida', key: 'cantidad_vendida' },
                        { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' }
                    ]}
                    dataSource={reportData}
                    rowKey="codigo_producto"
                    bordered
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
};

export default Reporte;
