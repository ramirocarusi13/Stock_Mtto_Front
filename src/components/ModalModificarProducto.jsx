import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';

const { Option } = Select;

function ModalModificarProducto({ visible, onClose, onSubmit, initialValues, descripcionOptions = [], proveedorOptions = [] }) {
    const [form] = Form.useForm();
    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        if (visible && initialValues) {
            const prefilledValues = {
                ...initialValues,
                punto_de_pedido: initialValues.punto_de_pedido || initialValues.minimo || 0,
            };
            form.setFieldsValue(prefilledValues);
            actualizarCostoTotal();
        }
    }, [visible, initialValues]);

    if (!initialValues) {
        return null;
    }

    // ✅ Función para actualizar automáticamente el costo total
    const actualizarCostoTotal = () => {
        const { en_stock, costo_por_unidad } = form.getFieldsValue(['en_stock', 'costo_por_unidad']);
        const costoTotal = (en_stock || 0) * (costo_por_unidad || 0);
        form.setFieldsValue({ costo_total: costoTotal.toFixed(2) });
    };

    const handleUpdateProduct = async (updatedProduct) => {
        try {
            if (!VITE_APIURL) {
                throw new Error("VITE_APIURL no está definido. Verifica tu archivo de configuración.");
            }

            if (!initialValues.id) {
                throw new Error("El producto seleccionado no tiene un ID válido.");
            }

            const apiUrl = `${VITE_APIURL.replace(/\/$/, '')}/inventario/${initialValues.id}`;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
            });

            const textResponse = await response.text();

            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (error) {
                throw new Error("El servidor no devolvió una respuesta JSON válida.");
            }

            if (!response.ok) {
                console.error("Error en la API:", data);
                throw new Error(data.message || 'Error al actualizar el producto');
            }

            message.success('Producto actualizado con éxito');
            onSubmit(updatedProduct);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            message.error(error.message || 'Error al actualizar el producto');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await handleUpdateProduct(values);
        } catch (error) {
            console.error('Validación fallida:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Modificar Producto"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Guardar"
            cancelText="Cancelar"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Código"
                    name="codigo"
                    rules={[{ required: true, message: 'Por favor, ingrese el código' }]}
                >
                    <Input placeholder="Ingrese el código del producto" />
                </Form.Item>

                <Form.Item
                    label="Descripción"
                    name="descripcion"
                    rules={[{ required: true, message: 'Por favor, seleccione una descripción' }]}
                >
                    <Select placeholder="Seleccione una descripción">
                        {descripcionOptions.map((descripcion) => (
                            <Option key={descripcion.id} value={descripcion.id}>
                                {descripcion.nombre}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Proveedor"
                    name="proveedor_id"
                    rules={[{ required: true, message: 'Por favor, seleccione un proveedor' }]}
                >
                    <Select placeholder="Seleccione un proveedor">
                        {proveedorOptions.map((proveedor) => (
                            <Option key={proveedor.id} value={proveedor.id}>
                                {proveedor.nombre}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Stock Actual"
                    name="en_stock"
                    rules={[{ required: true, message: 'Por favor, ingrese el stock actual' }]}
                >
                    <InputNumber 
                        placeholder="Ingrese el stock actual" 
                        min={0} 
                        style={{ width: '100%' }} 
                        onChange={actualizarCostoTotal}
                    />
                </Form.Item>

                <Form.Item
                    label="Stock Mínimo (Punto de Pedido)"
                    name="minimo"
                    rules={[{ required: true, message: 'Por favor, ingrese el stock mínimo' }]}
                >
                    <InputNumber placeholder="Ingrese el stock mínimo" min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="Stock Máximo"
                    name="maximo"
                    rules={[{ required: true, message: 'Por favor, ingrese el stock máximo' }]}
                >
                    <InputNumber placeholder="Ingrese el stock máximo" min={0} style={{ width: '100%' }} />
                </Form.Item>

                {/* ✅ NUEVO CAMPO - Costo por Unidad */}
                <Form.Item
                    label="Costo por Unidad"
                    name="costo_por_unidad"
                    rules={[{ required: true, message: 'Por favor, ingrese el costo por unidad' }]}
                >
                    <InputNumber 
                        placeholder="Ingrese el costo por unidad" 
                        min={0} 
                        style={{ width: '100%' }} 
                        onChange={actualizarCostoTotal}
                    />
                </Form.Item>

                {/* ✅ NUEVO CAMPO - Costo Total (Calculado Automáticamente) */}
                <Form.Item
                    label="Costo Total"
                    name="costo_total"
                >
                    <InputNumber 
                        style={{ width: '100%' }} 
                        disabled 
                    />
                </Form.Item>

            </Form>
        </Modal>
    );
}

export default ModalModificarProducto;
