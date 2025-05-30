import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';

const ModalAprobarProducto = ({ visible, onClose, product, onStatusChange }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const VITE_APIURL = import.meta.env.VITE_APIURL;

  useEffect(() => {
    if (visible) {
      setSelectedStatus(null);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!selectedStatus) {
      message.warning("Debes seleccionar un estado.");
      return;
    }

    setLoading(true);
    try {
      if (!product || (!product.codigo && !product.codigo_producto)) {
        throw new Error("Código de producto no encontrado");
      }

      const codigoProducto = product.codigo_producto || product.codigo;
      let apiUrl = '';
      let method = 'PUT';
      let bodyData = {};
      let successMessage = '';

      if (selectedStatus === 'aprobado') {
        if (product.estado === 'aprobado') {
          apiUrl = `${VITE_APIURL}movimientos/aprobar/${codigoProducto}`;
          successMessage = 'Movimiento aprobado con éxito';
        } else {
          apiUrl = `${VITE_APIURL}inventario/aprobar/${codigoProducto}`;
          successMessage = 'Producto aprobado con éxito';
        }
        bodyData = { estado: 'aprobado' };
      } else if (selectedStatus === 'rechazado') {
        if (product.estado === 'aprobado') {
          apiUrl = `${VITE_APIURL}movimientos/rechazar/${codigoProducto}`;
          successMessage = 'Movimientos rechazados con éxito';
        } else {
          apiUrl = `${VITE_APIURL}inventario/rechazar/${codigoProducto}`;
          successMessage = 'Producto rechazado con éxito';
        }
        bodyData = { estado: 'rechazado' };
      }

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el estado');
      }

      message.success(successMessage);
      if (onStatusChange) onStatusChange(codigoProducto, selectedStatus);
      onClose();
    } catch (error) {
      console.error("Error en aprobación/rechazo:", error);
      message.error(error.message || 'Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Actualizar Estado del Movimiento"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
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
      <p>Selecciona el estado para aprobar o rechazar el movimiento:</p>
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
