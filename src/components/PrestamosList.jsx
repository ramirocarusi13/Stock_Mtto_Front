import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Input, InputNumber, Modal, Form, Select, Card } from 'antd';
import { UserOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import FiltroProductos from './FiltroProductos'; // Importa el componente de filtro

const { Option } = Select;

const PrestamosList = () => {
    const [productosAprobados, setProductosAprobados] = useState([]);
    const [prestamos, setPrestamos] = useState([]);
    const [modalPrestamoVisible, setModalPrestamoVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formPrestamo] = Form.useForm();

    const [searchText, setSearchText] = useState("");
    const [searchUsuario, setSearchUsuario] = useState("");
    const [searchDate, setSearchDate] = useState(null);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        fetchProductos();
        fetchPrestamos();
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
            if (!data || !data.data) {
                throw new Error('Estructura de respuesta incorrecta');
            }

            // Filtrar productos aprobados
            const productosAprobados = data.data.filter(producto => producto.estado === 'aprobado');

            /* // Obtener stock real desde movimientos
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
            ); */

            setProductosAprobados(productosConStock);
        } catch (error) {
            message.error('Error al obtener los productos');
        } finally {
            setLoading(false);
        }
    };

    const fetchPrestamos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}prestamos`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (!data || !data.data) {
                throw new Error('Estructura de respuesta incorrecta');
            }

            setPrestamos(data.data);
        } catch (error) {
            message.error('Error al obtener los préstamos');
        } finally {
            setLoading(false);
        }
    };



    const abrirModalPrestamo = () => {
        setModalPrestamoVisible(true);
        formPrestamo.resetFields();
    };

    const handlePrestarProducto = async () => {
        try {
            const values = await formPrestamo.validateFields();
            const producto = productosAprobados.find(p => p.id === values.productoId);

            if (!producto) {
                message.error('Seleccione un producto válido');
                return;
            }

            if (values.cantidadPrestada > producto.stock_real) {
                message.error('No se puede prestar más cantidad de la disponible');
                return;
            }

            const cantidad = Math.abs(values.cantidadPrestada) * -1; // Se asegura que sea negativo

            const body = {
                codigo_producto: producto.codigo,
                cantidad: cantidad,
                motivo: "prestamo",
                receptor_prestamo: values.nombreReceptor,
                estado: 'aprobado' // Se agrega receptor
            };

            const response = await fetch(`${VITE_APIURL}movimientos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al registrar el préstamo');
            }

            message.success('Préstamo registrado con éxito');
            setModalPrestamoVisible(false);
            fetchProductos();
            fetchPrestamos();
        } catch (error) {
            console.error("Error al registrar el préstamo:", error);
            message.error('Error al registrar el préstamo: ' + error.message);
        }
    };


    const handleDevolverProducto = async (prestamo) => {
        try {
            const response = await fetch(`${VITE_APIURL}prestamo/${prestamo.id}/devolver`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estado: 'devolucion'
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al registrar la devolución');
            }
    
            message.success('Devolución registrada y stock restaurado');
            
            // Esperar la actualización antes de recargar los datos
            await fetchProductos(); 
            await fetchPrestamos();
        } catch (error) {
            console.error("Error al registrar la devolución:", error);
            message.error('Error al registrar la devolución: ' + error.message);
        }
    };
    
    

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📑 Lista de Préstamos</h1>

            <div className="flex justify-between items-center mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={abrirModalPrestamo}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition"
                >
                    Prestar Producto
                </Button>
            </div>

            <Table
                columns={[
                    {
                        title: 'Código',
                        dataIndex: ['inventario', 'codigo'], // Acceder a la relación inventario
                        key: 'codigo',
                        render: (codigo) => <Tag color="blue">{codigo || 'N/A'}</Tag>,
                    },
                    {
                        title: 'Descripción',
                        dataIndex: ['inventario', 'descripcion'], // Acceder a la relación inventario
                        key: 'descripcion',
                        render: (descripcion) => <Tag color="purple">{descripcion || 'N/A'}</Tag>,
                    },
                    {
                        title: 'Cantidad Prestada',
                        dataIndex: 'cantidad',
                        key: 'cantidad',
                        render: (cantidad) => (
                            <Tag color="red" className="font-semibold text-lg">{cantidad}</Tag>
                        ),
                    },
                    {
                        title: 'Receptor',
                        dataIndex: 'receptor_prestamo',
                        key: 'receptor_prestamo',
                    },
                    {
                        title: 'Usuario',
                        dataIndex: ['usuario', 'name'], // Acceder a la relación usuario
                        key: 'usuario',
                        render: (usuario) => (
                            <Tag icon={<UserOutlined />} color="geekblue">
                                {usuario || 'N/A'}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Fecha de Préstamo',
                        dataIndex: 'created_at',
                        key: 'fecha_prestado',
                        render: (fecha) => (
                            <Tag icon={<CalendarOutlined />} color="green">
                                {new Date(fecha).toLocaleDateString()}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Fecha de Devolución',
                        dataIndex: 'fecha_devolucion',
                        key: 'fecha_devolucion',
                        render: (text) => (
                            text
                                ? <Tag color="cyan">{new Date(text).toLocaleDateString()}</Tag>
                                : <Tag color="red">No devuelto</Tag>
                        ),
                    },
                    {
                        title: 'Acciones',
                        key: 'acciones',
                        render: (_, record) => (
                            record.fecha_devolucion ? (
                                <Tag color="blue">Devuelto</Tag> // Muestra un tag azul cuando está devuelto
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={() => handleDevolverProducto(record)}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    Devolver
                                </Button>
                            )
                        ),
                    },
                    
                ]}
                dataSource={prestamos}
                rowKey={(record) => `${record.inventario?.codigo}-${record.created_at}-${record.receptor_prestamo}`}
                bordered
                className="shadow-md bg-white rounded-lg"
                pagination={{ pageSize: 8 }}
            />
            <Modal
                title="Prestar Producto"
                open={modalPrestamoVisible}
                onOk={() => formPrestamo.submit()}
                onCancel={() => setModalPrestamoVisible(false)}
                okText="Confirmar Prestamo"
                cancelText="Cancelar"
                className="p-6 rounded-lg shadow-lg"
            >
                <Form form={formPrestamo} layout="vertical" onFinish={handlePrestarProducto}>
                    <Form.Item
                        label="Seleccionar Producto"
                        name="productoId"
                        rules={[{ required: true, message: 'Seleccione un producto' }]}
                    >
                        <Select showSearch className="border rounded-lg">
                            {productosAprobados.map((producto) => (
                                <Option key={producto.id} value={producto.id}>
                                    {producto.descripcion} - Stock: {producto.stock_real}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Nombre del Receptor"
                        name="nombreReceptor"
                        rules={[{ required: true, message: 'Ingrese el nombre del receptor' }]}
                    >
                        <Input className="border rounded-lg p-2" />
                    </Form.Item>

                    <Form.Item
                        label="Cantidad a Prestar"
                        name="cantidadPrestada"
                        rules={[{ required: true, message: 'Ingrese la cantidad a prestar' }]}
                    >
                        <InputNumber min={1} className="w-full border rounded-lg p-2" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PrestamosList;