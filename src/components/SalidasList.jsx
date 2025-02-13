import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Input, DatePicker, Space, Modal, Form, Select, InputNumber } from 'antd';
import { UserOutlined, CalendarOutlined, BarcodeOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SalidasList = () => {
    const [salidas, setSalidas] = useState([]);
    const [filteredSalidas, setFilteredSalidas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedDates, setSelectedDates] = useState(null);
    const [modalSalidaVisible, setModalSalidaVisible] = useState(false);
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [formSalida] = Form.useForm();

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        fetchSalidas();
        fetchProductos();
    }, []);

    // Obtener solo los movimientos con motivo "egreso"
    const fetchSalidas = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}movimientos?motivo=egreso`, { 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (!data || !data.movimientos) {
                throw new Error('Estructura de respuesta incorrecta');
            }

            // Filtrar solo los movimientos con motivo "egreso"
            const salidasFiltradas = data.movimientos.filter(mov => mov.motivo === 'egreso');

            setSalidas(salidasFiltradas);
            setFilteredSalidas(salidasFiltradas); // Inicializar con todas las salidas
        } catch (error) {
            console.error("Error al obtener las salidas:", error);
            message.error('Error al obtener las salidas');
        } finally {
            setLoading(false);
        }
    };

    // Obtener productos aprobados y calcular el stock desde movimientos
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
            if (!data || !data.data) {
                throw new Error('Estructura de respuesta incorrecta');
            }

            // Filtrar productos aprobados
            const productosAprobados = data.data.filter(producto => producto.estado === 'aprobado');

            // Obtener stock real desde movimientos
            const productosConStock = await Promise.all(
                productosAprobados.map(async (producto) => {
                    const stockResponse = await fetch(`${VITE_APIURL}movimientos/${producto.codigo}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const stockData = await stockResponse.json();
                    return {
                        ...producto,
                        stock_real: stockData.cantidad_total || 0, // Stock basado en movimientos
                    };
                })
            );

            setProductosDisponibles(productosConStock);
            setFilteredProductos(productosConStock);
        } catch (error) {
            console.error("Error al obtener los productos:", error);
            message.error('Error al obtener los productos');
        } finally {
            setLoading(false);
        }
    };

    // Filtro por nombre del producto
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        applyFilters(value, selectedDates);
    };

    // Filtro por rango de fechas
    const handleDateChange = (dates) => {
        setSelectedDates(dates);
        applyFilters(searchText, dates);
    };

    // Aplicar filtros combinados
    const applyFilters = (searchValue, dateRange) => {
        let filtered = salidas;

        // Filtrar por nombre de producto
        if (searchValue) {
            filtered = filtered.filter(salida =>
                salida.producto?.descripcion.toLowerCase().includes(searchValue)
            );
        }

        // Filtrar por rango de fechas
        if (dateRange && dateRange.length === 2) {
            const [start, end] = dateRange;
            filtered = filtered.filter(salida => {
                const salidaFecha = dayjs(salida.created_at);
                return salidaFecha.isAfter(start) && salidaFecha.isBefore(end);
            });
        }

        setFilteredSalidas(filtered);
    };

    const abrirModalSalida = () => {
        setModalSalidaVisible(true);
        formSalida.resetFields();
    };

    const handleRegistrarSalida = async () => {
        try {
            const values = await formSalida.validateFields();
            const producto = productosDisponibles.find(p => p.id === values.productoId);

            if (!producto) {
                message.error('Seleccione un producto válido');
                return;
            }

            if (values.cantidadSalida > producto.stock_real) {
                message.error('No se puede registrar más cantidad de la disponible');
                return;
            }
            const cantidad = Math.abs(values.cantidadSalida)*-1
            const response = await fetch(`${VITE_APIURL}movimientos`, {
                
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo_producto: producto.codigo,
                    cantidad: cantidad, // Se asegura que la cantidad sea negativa
                    motivo: 'egreso',
                }),
            });
            

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al registrar la salida');
            }

            message.success('Salida registrada con éxito');
            setModalSalidaVisible(false);
            fetchProductos();
            fetchSalidas();
        } catch (error) {
            console.error("Error al registrar la salida:", error);
            message.error('Error al registrar la salida: ' + error.message);
        }
    };

    // Manejo del filtro en tiempo real
    const handleSearchProductoChange = (value) => {
        setSearchText(value.toLowerCase());

        const filtered = productosDisponibles.filter(producto =>
            producto.codigo.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredProductos(filtered);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📦 Registro de Salidas</h1>

            {/* Filtros y botón alineados a la derecha */}
            <div className="flex justify-between items-center mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={abrirModalSalida}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition"
                >
                    Registrar Salida
                </Button>

                <Space>
                    <Input
                        placeholder="Buscar por nombre de producto..."
                        onChange={handleSearchChange}
                        value={searchText}
                        className="w-60"
                    />

                    <RangePicker
                        onChange={handleDateChange}
                        className="w-72"
                        format="YYYY-MM-DD"
                    />
                </Space>
            </div>

            <Table
                columns={[
                    {
                        title: 'Usuario',
                        dataIndex: ['usuario', 'name'],
                        key: 'usuario',
                        render: (usuario) => (
                            <Tag icon={<UserOutlined />} color="blue">
                                {usuario || 'Desconocido'}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Código de Producto',
                        dataIndex: 'codigo_producto',
                        key: 'codigo_producto',
                        render: (codigo) => (
                            <Tag color="volcano">
                                {codigo}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Descripción',
                        dataIndex: ['producto', 'descripcion'],
                        key: 'descripcion',
                        render: (descripcion) => (
                            <Tag color="purple">
                                {descripcion || 'Sin descripción'}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Cantidad',
                        dataIndex: 'cantidad',
                        key: 'cantidad',
                        render: (cantidad) => (
                            <Tag color="red">
                                {cantidad}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Fecha',
                        dataIndex: 'created_at',
                        key: 'fecha',
                        render: (fecha) => (
                            <Tag icon={<CalendarOutlined />} color="green">
                                {new Date(fecha).toLocaleDateString()}
                            </Tag>
                        ),
                    }
                ]}
                dataSource={filteredSalidas}
                rowKey="id"
                loading={loading}
                bordered
                className="shadow-lg bg-white rounded-lg"
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title="Registrar Salida"
                open={modalSalidaVisible}
                onOk={handleRegistrarSalida}
                onCancel={() => setModalSalidaVisible(false)}
                okText="Registrar"
                cancelText="Cancelar"
                className="p-4"
            >
                <Form form={formSalida} layout="vertical">
                    <Form.Item
                        label="Seleccionar Producto"
                        name="productoId"
                        rules={[{ required: true, message: 'Seleccione un producto' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Buscar producto por código..."
                            optionFilterProp="children"
                            filterOption={false}
                            onSearch={handleSearchProductoChange}
                        >
                            {filteredProductos.map((producto) => (
                                <Option key={producto.id} value={producto.id}>
                                    {producto.codigo} - {producto.descripcion} (Stock: {producto.stock_real})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Cantidad a Registrar"
                        name="cantidadSalida"
                        rules={[{ required: true, message: 'Ingrese la cantidad a registrar' }]}
                    >
                        <InputNumber min={1} className="w-full border border-gray-300 rounded-md p-2" />
                    </Form.Item>

                    <Form.Item
                        label="Motivo de la Salida"
                        name="motivoSalida"
                        initialValue="egreso"
                    >
                        <Input disabled className="border border-gray-300 rounded-md p-2" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SalidasList;