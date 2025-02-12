import React, { useState, useEffect } from 'react';
import { Modal, Form, AutoComplete, Select, Input, InputNumber, Button, message } from 'antd';

const { Option } = Select;

const AgregarProductoModal = ({ visible, onClose, onProductAdded }) => {
    const [form] = Form.useForm();
    const [proveedores, setProveedores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]); // Lista de productos existentes
    const [filteredProductos, setFilteredProductos] = useState([]); // Productos filtrados en tiempo real
    const [loading, setLoading] = useState(false);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        if (visible) {
            fetchProveedores();
            fetchCategorias();
            fetchProductos();
        }
    }, [visible]);

    const fetchCategorias = async () => {
        try {
            const response = await fetch(`${VITE_APIURL}categorias`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener las categorías');
            }

            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            message.error('No se pudieron cargar las categorías');
        }
    };

    const fetchProveedores = async () => {
        try {
            const response = await fetch(`${VITE_APIURL}proveedores`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener los proveedores');
            }

            const data = await response.json();
            setProveedores(data);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            message.error('No se pudieron cargar los proveedores');
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await fetch(`${VITE_APIURL}inventario`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener los productos');
            }

            const data = await response.json();
            setProductos(data.data); // Guardamos la lista de productos en el estado
        } catch (error) {
            console.error('Error al cargar productos:', error);
            message.error('No se pudieron cargar los productos');
        }
    };

    const handleCodigoChange = (value) => {
        const filtered = productos
            .filter((producto) => producto.codigo.toLowerCase().includes(value.toLowerCase()))
            .map((producto) => ({
                value: producto.codigo,
                label: `${producto.codigo} - ${producto.descripcion}`,
            }));

        setFilteredProductos(filtered);
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}/inventario`, {
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

            if (onProductAdded) {
                onProductAdded(data.producto);
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
                    categoria_id: null,
                    en_stock: 0,
                    minimo: 0,
                    maximo: 0,
                }}
            >
                {/* Campo Código con AutoComplete */}
                <Form.Item
                    label="Código"
                    name="codigo"
                    rules={[{ required: true, message: 'El código es obligatorio' }]}
                >
                    <AutoComplete
                        options={filteredProductos}
                        onSearch={handleCodigoChange}
                        placeholder="Ingresa el código del producto"
                        style={{ width: '100%' }}
                    />
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
                    label="Categoría"
                    name="categoria_id"
                    rules={[{ required: true, message: 'Por favor selecciona una categoría' }]}
                >
                    <Select placeholder="Selecciona una categoría">
                        {categorias.map((categoria) => (
                            <Option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
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
