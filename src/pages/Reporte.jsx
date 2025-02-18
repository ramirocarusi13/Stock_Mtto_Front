import React, { useEffect, useState } from 'react';
import { Table, Button, Select, DatePicker, message } from 'antd';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import MyMenu from '../components/Menu';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Reporte = () => {
    const [reportType, setReportType] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    const fetchReportData = async () => {
        if (!reportType) {
            message.warning('Seleccione un tipo de reporte.');
            return;
        }

        setLoading(true);
        try {
            let url = `${VITE_APIURL}reportes`;

            if (reportType !== 'stock' && selectedDates.length === 2) {
                const [start, end] = selectedDates;
                url = `${VITE_APIURL}reportes/${reportType}?start=${start.format('YYYY-MM-DD')}&end=${end.format('YYYY-MM-DD')}`;
            } else if (reportType === 'stock') {
                url = `${VITE_APIURL}reportes/stock`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!response.ok) throw new Error('Error al obtener el reporte');

            const data = await response.json();


            // 👉 Aquí ves la respuesta en la consola

            const reportArray = Array.isArray(data) ? data :
                Array.isArray(data.reporte_stock) ? data.reporte_stock :
                    Array.isArray(data.productos_mas_movidos) ? data.productos_mas_movidos :
                        Array.isArray(data.motivos_mas_frecuentes) ? data.motivos_mas_frecuentes :
                            [];

            if (reportArray.length === 0) {
                message.warning('No hay datos disponibles para este reporte.');
            }
            console.log("🔍 Datos después de transformar para la tabla:", reportArray);

            setReportData(reportArray);
            message.success('Reporte generado con éxito');
        } catch (error) {
            console.error('❌ Error al generar el reporte:', error);
            message.error('No se pudo generar el reporte');
        } finally {
            setLoading(false);
        }
    };


    const exportToExcel = async () => {
    if (reportData.length === 0) {
        message.warning('No hay datos para exportar.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Consolidado');

    // 🟢 Configurar la hoja para tamaño A3
    worksheet.pageSetup.paperSize = 9; // 9 es el código para A3
    worksheet.pageSetup.fitToPage = true;
    worksheet.pageSetup.fitToWidth = 1;
    worksheet.pageSetup.fitToHeight = 1;

    // 🟢 Agregar encabezados con estilos
    const headers = [
        'Código Producto',
        'Descripción',
        'Categoría',
        'Stock Actual',
        'Stock Mínimo',
        'Stock Máximo',
        'Estado Stock',
        'Total Ingresos',
        'Total Salidas',
        'Motivo más Frecuente'
    ];

    worksheet.addRow(headers).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 🟢 Agregar datos con estilos
    reportData.forEach((item, index) => {
        const rowData = [
            item.codigo || item.codigo_producto,
            item.descripcion,
            item.categoria?.nombre || "Sin categoría",
            item.stock_real || 'N/A',
            item.minimo || 'N/A',
            item.maximo || 'N/A',
            item.estado_stock || 'N/A',
            item.total_ingresos || 'N/A',
            item.total_salidas || 'N/A',
            item.motivo_mas_frecuente || 'N/A'
        ];

        const row = worksheet.addRow(rowData);
        row.eachCell(cell => {
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
            if (index % 2 === 0) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E1EFFF' } };
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
    });

    // 🟢 Ajustar el ancho de las columnas
    worksheet.columns.forEach(column => {
        column.width = 20;
    });

    // 🕒 Obtener fecha actual
    const date = new Date().toISOString().split('T')[0];
    const fileName = `Reporte_Consolidado_${date}.xlsx`;

    // 🔽 Guardar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
    message.success('Excel exportado con éxito');
};

    return (
        <div className="flex min-h-screen">
            {/* Menú lateral */}
            <div className="w-64 bg-gray-800 text-white min-h-screen">
                <MyMenu />
            </div>

            {/* Contenido principal */}
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">📊 Reportes</h1>

                {/* Filtros */}
                <div className="flex gap-4 mb-6">
                    <Select
                        placeholder="Seleccione un tipo de reporte"
                        className="w-60"
                        onChange={setReportType}
                        value={reportType}
                    >
                        <Option value="productos-mas-movidos">Productos más movidos</Option>
                        <Option value="motivos-frecuentes">Motivos más frecuentes</Option>
                        <Option value="stock">Reporte de stock</Option>
                    </Select>

                    {reportType !== 'stock' && (
                        <RangePicker onChange={setSelectedDates} format="YYYY-MM-DD" />
                    )}

                    <Button type="primary" onClick={fetchReportData} loading={loading}>
                        Generar Reporte
                    </Button>

                    <Button onClick={exportToExcel} disabled={reportData.length === 0}>
                        Exportar a Excel
                    </Button>
                </div>

                {/* Tabla de datos */}
                <Table
                    columns={
                        reportType === 'productos-mas-movidos'
                            ? [{ title: 'Código', dataIndex: 'codigo_producto', key: 'codigo_producto' },
                            {
                                title: 'Categoría',
                                dataIndex: 'categoria',
                                key: 'categoria',
                                render: (categoria) => categoria?.nombre || "Sin categoría"
                            }
                                ,
                            { title: 'Total Movido', dataIndex: 'total_movido', key: 'total_movido' }]
                            : reportType === 'motivos-frecuentes'
                                ? [{ title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
                                { title: 'Total', dataIndex: 'total', key: 'total' }]
                                : reportType === 'stock'
                                    ? [{ title: 'Código', dataIndex: 'codigo', key: 'codigo' },
                                    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
                                    {
                                        title: 'Categoría',
                                        dataIndex: 'categoria',
                                        key: 'categoria',
                                        render: (categoria) => categoria?.nombre || "Sin categoría"
                                    }
                                        ,
                                    { title: 'Stock Actual', dataIndex: 'stock_real', key: 'stock_real' },
                                    { title: 'Stock Mínimo', dataIndex: 'minimo', key: 'minimo' },
                                    { title: 'Stock Máximo', dataIndex: 'maximo', key: 'maximo' },
                                    { title: 'Estado', dataIndex: 'estado_stock', key: 'estado_stock' }]
                                    : []
                    }
                    dataSource={reportData.map((item, index) => ({ ...item, key: item.id || index }))}
                    bordered
                    pagination={{ pageSize: 10 }}
                />

            </div>
        </div>
    );
};

export default Reporte;
