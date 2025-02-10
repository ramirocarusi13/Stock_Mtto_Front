import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd';

const { Option } = Select;

const AgregarProductoModal = ({ visible, onClose, onProductAdded, VITE_APIURL }) => {
    const [form] = Form.useForm();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchProveedores();
        }
    }, [visible]);

    const fetchProveedores = async () => {
        try {
            const response = await fetch(`${VITE_APIURL}proveedores`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setProveedores(data);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            message.error('No se pudieron cargar los proveedores');
        }
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}inventario`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al agregar el producto');
            }

            message.success('Producto agregado con éxito');

            // ✅ Verificar si onProductAdded está definido antes de llamarlo
            if (onProductAdded) {
                onProductAdded(data.data);
            }

            form.resetFields();
            onClose();
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            message.error(error.message || 'Error al agregar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            title="Agregar Producto"
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                    codigo: '',
                    descripcion: '',
                    proveedor_id: null,
                    en_stock: 0,
                    minimo: 0,
                    maximo: 0,
                }}
            >
                <Form.Item
                    label="Código"
                    name="codigo"
                    rules={[{ required: true, message: 'El código es obligatorio' }]}
                >
                    <Input placeholder="Ingresa el código del producto" />
                </Form.Item>

                <Form.Item
                    label="Descripción"
                    name="descripcion"
                    rules={[{ required: true, message: 'La descripción es obligatoria' }]}
                >
                    <Input placeholder="Ingresa la descripción del producto" />
                </Form.Item>

                <Form.Item
                    label="Proveedor"
                    name="proveedor_id"
                    rules={[{ required: true, message: 'Por favor selecciona un proveedor' }]}
                >
                    <Select placeholder="Selecciona un proveedor">
                        {proveedores.map((proveedor) => (
                            <Option key={proveedor.id} value={proveedor.id}>
                                {proveedor.nombre}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Stock Inicial"
                    name="en_stock"
                    rules={[{ required: true, message: 'El stock inicial es obligatorio' }]}
                >
                    <InputNumber min={0} placeholder="Cantidad inicial en stock" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="Mínimo en Stock"
                    name="minimo"
                    rules={[{ required: true, message: 'El mínimo en stock es obligatorio' }]}
                >
                    <InputNumber min={0} placeholder="Cantidad mínima en stock" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="Máximo en Stock"
                    name="maximo"
                    rules={[{ required: true, message: 'El máximo en stock es obligatorio' }]}
                >
                    <InputNumber min={0} placeholder="Cantidad máxima en stock" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Agregar Producto
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AgregarProductoModal;
