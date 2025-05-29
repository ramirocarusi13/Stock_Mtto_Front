import React, { useEffect, useState } from 'react';
import { Modal, InputNumber, Button, message, Form } from 'antd';

const EditarcantidadModal = ({ visible, onClose, movimiento, VITE_APIURL, onCantidadUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (movimiento) {
            form.setFieldsValue({
                cantidad: movimiento.stock_real ?? 1,
                punto_de_pedido: movimiento.punto_de_pedido ?? 0,
                minimo: movimiento.minimo ?? 0,
                maximo: movimiento.maximo ?? 0,
            });
        }
    }, [movimiento, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const { cantidad, punto_de_pedido, minimo, maximo } = values;

            // 1. Registrar movimiento (como ingreso pendiente)
            const nuevoMovimiento = {
                codigo_producto: movimiento?.codigo_producto || movimiento?.codigo,
                cantidad: cantidad,
                motivo: 'ingreso',
                estado: 'pendiente',
            };

            await fetch(`${VITE_APIURL}movimientos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoMovimiento),
            });

            // 2. Actualizar punto de pedido, mínimo y máximo en producto
            await fetch(`${VITE_APIURL}inventario/${movimiento.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    punto_de_pedido,
                    minimo,
                    maximo,
                }),
            });

            message.success('Cantidad y configuración actualizadas');
            onCantidadUpdated(movimiento.codigo, cantidad);
            onClose();
        } catch (error) {
            console.error(error);
            message.error(error.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Editar Cantidad y Configuración"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    style={{ backgroundColor: '#1677ff', borderColor: '#1677ff' }}
                >
                    Guardar
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Nueva Cantidad (opcional)"
                    name="cantidad"
                >
                    <InputNumber min={0} className="w-full" />
                </Form.Item>



                <Form.Item
                    label="Punto de Pedido"
                    name="punto_de_pedido"
                >
                    <InputNumber min={0} className="w-full" />
                </Form.Item>

                <Form.Item
                    label="Stock Mínimo"
                    name="minimo"
                >
                    <InputNumber min={0} className="w-full" />
                </Form.Item>

                <Form.Item
                    label="Stock Máximo"
                    name="maximo"
                >
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditarcantidadModal;
