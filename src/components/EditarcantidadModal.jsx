import React, { useState } from 'react';
import { Modal, InputNumber, Button, message } from 'antd';

const EditarcantidadModal = ({ visible, onClose, movimiento, VITE_APIURL }) => {
    const [nuevaCantidad, setNuevaCantidad] = useState(movimiento?.cantidad || 1);
    const [loading, setLoading] = useState(false);

    const handleCreateMovimiento = async () => {
        if (nuevaCantidad < 1) {
            message.error("La cantidad debe ser mayor a 0.");
            return;
        }

        setLoading(true);

        try {
            console.log("Movimiento recibido:", movimiento); // 🔹 Debug para verificar los datos del movimiento

            const nuevoMovimiento = {
                codigo_producto: movimiento?.codigo_producto || movimiento?.codigo, // 🔹 Aseguramos el código correcto
                cantidad: nuevaCantidad,
                motivo: 'ingreso', // Se puede cambiar según la lógica del negocio
                estado: 'pendiente', // 🔹 Se asegura que el movimiento quede pendiente
            };

            console.log("Datos enviados al backend:", nuevoMovimiento); // 🔹 Debug

            const response = await fetch(`${VITE_APIURL}movimientos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoMovimiento),
            });

            const data = await response.json();
            console.log("Respuesta del backend:", data); // 🔹 Debug

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el nuevo movimiento');
            }

            message.success('Nuevo movimiento creado con éxito, pendiente de aprobación');
            onClose();
        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Error al crear el nuevo movimiento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Crear Nuevo Movimiento"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    onClick={handleCreateMovimiento}
                    loading={loading}
                    style={{ backgroundColor: '#1677ff', borderColor: '#1677ff' }}
                >
                    Guardar
                </Button>,
            ]}
        >
            <p>Ingrese la nueva cantidad para generar un nuevo movimiento:</p>
            <InputNumber
                min={1}
                value={nuevaCantidad}
                onChange={setNuevaCantidad}
                style={{ width: '100%', marginTop: '10px', padding: '10px', fontSize: '16px' }}
            />
        </Modal>
    );
};

export default EditarcantidadModal;
