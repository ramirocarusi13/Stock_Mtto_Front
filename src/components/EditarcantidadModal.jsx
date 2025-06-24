import React, { useEffect, useState } from 'react';
import { Modal, InputNumber, Button, message, Form } from 'antd';

const EditarcantidadModal = ({ visible, onClose, movimiento, onCantidadUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        if (movimiento) {
            form.setFieldsValue({
                cantidad: movimiento.cantidad || 0,
                punto_de_pedido: movimiento.punto_de_pedido || 0,
                minimo: movimiento.minimo || 0,
                maximo: movimiento.maximo || 0,
            });
        }
    }, [movimiento, form]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const { cantidad, punto_de_pedido, minimo, maximo } = values;

            // Registrar nuevo movimiento (ingreso pendiente)
            const responseMovimiento = await fetch(`${VITE_APIURL}movimientos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo_producto: movimiento?.codigo_producto || movimiento?.codigo,
                    cantidad,
                    motivo: 'ingreso',
                    estado: 'pendiente',
                }),
            });

            const dataMovimiento = await responseMovimiento.json();
            if (!responseMovimiento.ok) {
                throw new Error(dataMovimiento.message || 'Error al registrar el movimiento');
            }

            // Actualizar valores del inventario
            const responseInventario = await fetch(`${VITE_APIURL}inventario/${movimiento.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ punto_de_pedido, minimo, maximo }),
            });

            const dataInventario = await responseInventario.json();
            if (!responseInventario.ok) {
                throw new Error(dataInventario.message || 'Error al actualizar el producto');
            }

            message.success('Cantidad y configuración actualizadas');
            if (onCantidadUpdated) onCantidadUpdated(movimiento.codigo, cantidad);
            onClose();
        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Error al guardar los cambios');
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
                >
                    Guardar
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Nueva Cantidad" name="cantidad">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
                <Form.Item label="Punto de Pedido" name="punto_de_pedido">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
                <Form.Item label="Stock Mínimo" name="minimo">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
                <Form.Item label="Stock Máximo" name="maximo">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditarcantidadModal;
