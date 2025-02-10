import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';

const ModalAprobarProducto = ({ visible, onClose, product, onStatusChange, VITE_APIURL }) => {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!selectedStatus) {
            message.warning("Debes seleccionar un estado.");
            return;
        }

        setLoading(true);
        try {
            const apiUrl = `${VITE_APIURL.replace(/\/$/, '')}/inventario/${product.id}/estado`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: selectedStatus }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar el estado del producto');
            }

            message.success(`Producto ${selectedStatus} con éxito`);
            if (onStatusChange) {
                onStatusChange(product.id, selectedStatus);
            }
            onClose();
        } catch (error) {
            message.error(error.message || 'Error al actualizar el estado del producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Actualizar Estado del Producto"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancelar
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    onClick={handleConfirm}
                    loading={loading}
                    style={{
                        background: selectedStatus === 'aprobado' ? '#52c41a' : selectedStatus === 'rechazado' ? '#ff4d4f' : '',
                        borderColor: selectedStatus === 'aprobado' ? '#52c41a' : selectedStatus === 'rechazado' ? '#ff4d4f' : '',
                    }}
                    disabled={!selectedStatus}
                >
                    Confirmar
                </Button>,
            ]}
        >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <Button
                    type={selectedStatus === 'aprobado' ? "primary" : "default"}
                    style={{
                        background: selectedStatus === 'aprobado' ? '#52c41a' : 'white',
                        color: selectedStatus === 'aprobado' ? 'white' : '#52c41a',
                        borderColor: '#52c41a',
                        fontSize: '16px',
                        padding: '10px 20px',
                        width: '150px',
                        textAlign: 'center',
                    }}
                    onClick={() => setSelectedStatus('aprobado')}
                >
                    ✅ Aprobado
                </Button>
                <Button
                    type={selectedStatus === 'rechazado' ? "primary" : "default"}
                    style={{
                        background: selectedStatus === 'rechazado' ? '#ff4d4f' : 'white',
                        color: selectedStatus === 'rechazado' ? 'white' : '#ff4d4f',
                        borderColor: '#ff4d4f',
                        fontSize: '16px',
                        padding: '10px 20px',
                        width: '150px',
                        textAlign: 'center',
                    }}
                    onClick={() => setSelectedStatus('rechazado')}
                >
                    ❌ Rechazado
                </Button>
            </div>
        </Modal>
    );
};

export default ModalAprobarProducto;
