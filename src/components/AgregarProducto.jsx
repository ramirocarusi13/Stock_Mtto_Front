import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, InputNumber, Button, message } from 'antd';

const { Option } = Select;

const AgregarProductoModal = ({ visible, onClose, onProductAdded }) => {
    const [form] = Form.useForm();
    const [proveedores, setProveedores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    // 🔒 Rol del usuario desde localStorage (soporte flexible)
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRol = (userData.rol || localStorage.getItem('rol') || '').toLowerCase();
    const puedeVerLimites = ['group_leader', 'gerente'].includes(userRol);

    useEffect(() => {
        if (visible) {
            fetchProveedores();
            fetchCategorias();
            form.resetFields();
        }
    }, [visible]);

    const fetchCategorias = async () => {
        try {
            const response = await fetch(`${VITE_APIURL}categorias`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await response.json();
            setCategorias(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            message.error('No se pudieron cargar las categorías');
        }
    };

    const fetchProveedores = async () => {
        try {
            const response = await fetch(`${VITE_APIURL}proveedores`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await response.json();
            setProveedores(Array.isArray(data) ? data : data.data || []);
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
            if (!response.ok) throw new Error(data.message || 'Error al agregar el producto');

            if (values.en_stock > 0) {
                await fetch(`${VITE_APIURL}movimientos`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        codigo_producto: values.codigo,
                        cantidad: values.en_stock,
                        motivo: 'ingreso',
                        estado: 'aprobado',
                    }),
                });
            }

            message.success('Producto y movimiento creados con éxito');
            if (onProductAdded) onProductAdded(data.producto);
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
            open={visible}
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
                    categoria_id: null,
                    en_stock: 0,
                    punto_de_pedido: 0,
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
                    <Select
                        showSearch
                        placeholder="Selecciona un proveedor"
                        filterOption={(input, option) =>
                            option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {proveedores.map((proveedor) => (
                            <Option key={proveedor.id} value={proveedor.id}>
                                {proveedor.nombre}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Categoría"
                    name="categoria_id"
                    rules={[{ required: true, message: 'Por favor selecciona una categoría' }]}
                >
                    <Select
                        showSearch
                        placeholder="Selecciona una categoría"
                        filterOption={(input, option) =>
                            option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {categorias.map((categoria) => (
                            <Option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Cantidad"
                    name="en_stock"
                    rules={[{ required: true, message: 'El stock inicial es obligatorio' }]}
                >
                    <InputNumber min={0} className="w-full" placeholder="Cantidad inicial en stock" />
                </Form.Item>

                {puedeVerLimites && (
                    <>
                        <Form.Item label="Punto de Pedido" name="punto_de_pedido">
                            <InputNumber min={0} className="w-full" />
                        </Form.Item>

                        <Form.Item label="Stock Mínimo" name="minimo">
                            <InputNumber min={0} className="w-full" />
                        </Form.Item>

                        <Form.Item label="Stock Máximo" name="maximo">
                            <InputNumber min={0} className="w-full" />
                        </Form.Item>
                    </>
                )}

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        Agregar Producto
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AgregarProductoModal;
