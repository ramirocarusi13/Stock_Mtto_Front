import React, { useEffect, useState, useRef } from 'react';
import {
    Modal,
    Form,
    Select,
    InputNumber,
    Input,
    Spin,
    message,
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function ModalRegistrarSalida({
    visible,
    onClose,
    onRegistrar,

}) {
    const [form] = Form.useForm();
    const [productos, setProductos] = useState([]);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const selectRef = useRef(null);
    const VITE_APIURL = import.meta.env.VITE_APIURL;
    useEffect(() => {
        if (visible) {
            form.resetFields();
            fetchProductos();
        }
    }, [visible]);

    const fetchProductos = async () => {
        setLoadingProductos(true);
        try {
            const response = await fetch(`${VITE_APIURL}inventario/lista-minima`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setProductos(data.data || []);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            
        } finally {
            setLoadingProductos(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const producto = productos.find(p => p.id === values.productoId);
            if (!producto) return message.error("Producto no válido");

            const payload = {
                codigo_producto: producto.codigo,
                cantidad: Math.abs(values.cantidadSalida) * -1,
                motivo: 'egreso',
                estado: 'aprobado',
                observacion_salida: values.observacionSalida || '',
            };

            await onRegistrar(payload);
            onClose();
        } catch (error) {
            console.error('Error al registrar:', error);
            message.error('Error al registrar la salida');
        }
    };

    return (
        <Modal
            title="Registrar Salida"
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Registrar"
            cancelText="Cancelar"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Seleccionar Producto"
                    name="productoId"
                    rules={[{ required: true, message: 'Seleccione un producto' }]}
                >
                    <Select
                        ref={selectRef}
                        placeholder="Seleccione un producto"
                        loading={loadingProductos}
                        showSearch
                        optionFilterProp="label"
                        notFoundContent={loadingProductos ? <Spin indicator={<LoadingOutlined />} /> : 'No hay productos'}
                    >
                        {productos.map(p => (
                            <Option
                                key={p.id}
                                value={p.id}
                                label={`${p.codigo} - ${p.descripcion}`}
                            >
                                {p.codigo} - {p.descripcion}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Cantidad a Registrar"
                    name="cantidadSalida"
                    rules={[{ required: true, message: 'Ingrese la cantidad a registrar' }]}
                >
                    <InputNumber min={1} className="w-full" />
                </Form.Item>

                <Form.Item label="Motivo" name="motivoSalida" initialValue="egreso">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Observación" name="observacionSalida">
                    <Input.TextArea rows={3} placeholder="Observación (opcional)" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
