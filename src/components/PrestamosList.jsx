import React, { useEffect, useState } from 'react';
import { Table, Button, Input, InputNumber, message, Modal, Form, Select, Card } from 'antd';

const { Option } = Select;

const PrestamosList = () => {
    const [productosAprobados, setProductosAprobados] = useState([]);
    const [prestamos, setPrestamos] = useState([]);
    const [modalPrestamoVisible, setModalPrestamoVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formPrestamo] = Form.useForm();
    const [estadisticas, setEstadisticas] = useState({
        totalPrestamosMes: 0,
        usuarioMasPrestamos: null,
    });

    const VITE_APIURL = import.meta.env.VITE_APIURL;
    const userData = JSON.parse(localStorage.getItem('user')) || {};

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

            setProductosAprobados(data.data.filter(producto => producto.estado === 'aprobado'));
        } catch (error) {
            
            message.error('Error al obtener los productos');
        } finally {
            setLoading(false);
        }
    };
    const handleDevolver = async (id) => {
        try {
            const response = await fetch(`${VITE_APIURL}prestamo/${id}/devolver`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });
    
            const responseData = await response.json();
            console.log("📢 Respuesta de la API al devolver:", responseData);
    
            if (!response.ok) {
                throw new Error(responseData.error || 'Error al devolver el producto');
            }
    
            message.success('Producto devuelto con éxito');
            fetchPrestamos();
        } catch (error) {
            console.error("Error al devolver el producto:", error);
            message.error('Error al devolver el producto: ' + error.message);
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
            
            calcularEstadisticas(data.data);
        } catch (error) {
           
            message.error('Error al obtener los préstamos');
        } finally {
            setLoading(false);
        }
    };

    const calcularEstadisticas = (prestamos) => {
        const mesActual = new Date().getMonth() + 1;
        const prestamosDelMes = prestamos.filter(p => new Date(p.fecha_prestado).getMonth() + 1 === mesActual);
        const totalPrestamosMes = prestamosDelMes.length;
    
        // Conteo de préstamos por usuario
        const prestamosPorUsuario = prestamos.reduce((acc, p) => {
            const usuarioNombre = p.usuario?.name || 'Desconocido';
            acc[usuarioNombre] = (acc[usuarioNombre] || 0) + 1;
            return acc;
        }, {});
    
        
    
        setEstadisticas({
            totalPrestamosMes,
             // 🔹 Ahora muestra el nombre correcto
        });
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
    
            if (values.cantidadPrestada > producto.en_stock) {
                message.error('No se puede prestar más de lo que hay en stock');
                return;
            }
    
            
    
            const response = await fetch(`${VITE_APIURL}inventario/${producto.id}/prestar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receptor_prestamo: values.nombreReceptor,
                    cantidad_prestada: values.cantidadPrestada,
                    usuario_id: userData.id, // 🔹 Agregando el usuario que hace el préstamo
                }),
            });
    
            const responseData = await response.json();
            
    
            if (!response.ok) {
                throw new Error(responseData.error || 'Error al prestar el producto');
            }
    
            message.success('Producto prestado con éxito');
            setModalPrestamoVisible(false);
            fetchProductos();
            fetchPrestamos();
        } catch (error) {
            
            message.error('Error al realizar el préstamo: ' + error.message);
        }
    };
    
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-4 text-center">Lista de Préstamos</h1>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-blue-500 text-white text-center p-4 shadow-lg rounded-lg">
                    <h2 className="text-lg font-bold">📊 Préstamos este mes</h2>
                    <p className="text-2xl">{estadisticas.totalPrestamosMes}</p>
                </Card>
                
            </div>

            <Button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition mb-4"
                onClick={abrirModalPrestamo}
            >
                Prestar Producto
            </Button>

            <Table
                columns={[
                    { title: 'Código', dataIndex: 'inventario', key: 'codigo', render: (inventario) => inventario?.codigo || 'N/A' },
                    { title: 'Descripción', dataIndex: 'inventario', key: 'descripcion', render: (inventario) => inventario?.descripcion || 'N/A' },
                    { title: 'Cantidad Prestada', dataIndex: 'cantidad_prestada', key: 'cantidad_prestada' },
                    { title: 'Receptor', dataIndex: 'receptor_prestamo', key: 'receptor_prestamo' },
                    { title: 'Usuario', dataIndex: 'usuario', key: 'usuario', render: (_,r) => r?.user?.name || 'N/A' },
                    { title: 'Fecha de Préstamo', dataIndex: 'fecha_prestado', key: 'fecha_prestado' },
                    {
                        title: 'Fecha de Devolución',
                        dataIndex: 'fecha_devolucion',
                        key: 'fecha_devolucion',
                        render: (text) => text ? new Date(text).toLocaleDateString() : 'No devuelto'
                    },
                    
                    {
                        title: 'Acciones',
                        key: 'acciones',
                        render: (_, record) => (
                            !record.devuelto ? (
                                <Button 
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
                                    onClick={() => handleDevolver(record.id)}
                                >
                                    Devolver
                                </Button>
                            ) : (
                                <span className="text-green-600 font-semibold">Devuelto</span>
                            )
                        ),
                    },
                    
                ]}
                dataSource={prestamos}
                rowKey='id'
                loading={loading}
                bordered
                className="shadow-md bg-white rounded-lg"
            />

<Modal
                title="Prestar Producto"
                open={modalPrestamoVisible}
                onOk={handlePrestarProducto}
                onCancel={() => setModalPrestamoVisible(false)}
                okText="Confirmar Préstamo"
                cancelText="Cancelar"
            >
                <Form form={formPrestamo} layout="vertical">
                    <Form.Item
                        label="Seleccionar Producto"
                        name="productoId"
                        rules={[{ required: true, message: 'Seleccione un producto' }]}
                    >
                        <Select placeholder="Seleccione un producto">
                            {productosAprobados.map((producto) => (
                                <Option key={producto.id} value={producto.id}>
                                    {producto.descripcion} - Stock: {producto.en_stock}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Nombre del Receptor"
                        name="nombreReceptor"
                        rules={[{ required: true, message: 'Ingrese el nombre del receptor' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Cantidad a Prestar"
                        name="cantidadPrestada"
                        rules={[{ required: true, message: 'Ingrese la cantidad a prestar' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PrestamosList;
