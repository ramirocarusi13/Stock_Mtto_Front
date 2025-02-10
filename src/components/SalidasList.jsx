import React, { useEffect, useState } from 'react';
import { Table, Button, Input, InputNumber, message, Modal, Form, Select } from 'antd';

const { Option } = Select;

const SalidasList = () => {
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    const [salidas, setSalidas] = useState([]);
    const [modalSalidaVisible, setModalSalidaVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formSalida] = Form.useForm();

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        fetchProductos();
        fetchSalidas();
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

            setProductosDisponibles(data.data.filter(producto => producto.en_stock > 0));
        } catch (error) {
            console.error("Error al obtener los productos:", error);
            message.error('Error al obtener los productos');
        } finally {
            setLoading(false);
        }
    };

    const fetchSalidas = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}salidas`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (!data || !data.data) {
                throw new Error('Estructura de respuesta incorrecta');
            }

            setSalidas(data.data);
        } catch (error) {
            console.error("Error al obtener las salidas:", error);
            message.error('Error al obtener las salidas');
        } finally {
            setLoading(false);
        }
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

            if (values.cantidadSalida > producto.en_stock) {
                message.error('No se puede registrar más cantidad de la disponible');
                return;
            }

            const response = await fetch(`${VITE_APIURL}salidas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inventario_id: producto.id,
                    cantidad: values.cantidadSalida,
                    motivo: values.motivoSalida,
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

    const columns = [
        {
            title: 'Código',
            dataIndex: 'inventario',
            key: 'codigo',
            render: (inventario) => inventario ? inventario.codigo : 'N/A'
        },
        {
            title: 'Descripción',
            dataIndex: 'inventario',
            key: 'descripcion',
            render: (inventario) => inventario ? inventario.descripcion : 'N/A'
        },
        {
            title: 'Cantidad',
            dataIndex: 'cantidad',
            key: 'cantidad',
        },
        {
            title: 'Motivo',
            dataIndex: 'motivo',
            key: 'motivo',
        },
        {
            title: 'Usuario',
            dataIndex: 'usuario',
            key: 'usuario',
            render: (usuario) => usuario ? usuario.name : 'N/A'
        },
        {
            title: 'Fecha',
            dataIndex: 'created_at',
            key: 'fecha',
            render: (fecha) => new Date(fecha).toLocaleDateString(),
        }
    ];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Registro de Salidas</h1>

            <Button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition mb-4"
                onClick={abrirModalSalida}
            >
                Registrar Salida
            </Button>

            <Table
                columns={columns}
                dataSource={salidas}
                rowKey='id'
                loading={loading}
                bordered
                className="shadow-lg bg-white rounded-lg"
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
                        <Select placeholder="Seleccione un producto">
                            {productosDisponibles.map((producto) => (
                                <Option key={producto.id} value={producto.id}>
                                    {producto.descripcion} - Stock: {producto.en_stock}
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
                        rules={[{ required: true, message: 'Ingrese el motivo de la salida' }]}
                    >
                        <Input className="border border-gray-300 rounded-md p-2" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SalidasList;
