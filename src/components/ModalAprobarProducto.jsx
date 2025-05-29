import React, { useState, useEffect } from 'react';
import { Modal, Button, message /*, InputNumber */ } from 'antd';

const ModalAprobarProducto = ({ visible, onClose, product, onStatusChange, VITE_APIURL }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  // const [minimo, setMinimo] = useState(null);
  // const [maximo, setMaximo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Limpieza o preparación si se requiere
  }, [product]);

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
      let apiUrl = "";
      let successMessage = "";

      if (selectedStatus === 'aprobado') {
        if (product && product.estado === 'aprobado') {
          // Producto ya aprobado: solo aprobamos el movimiento
          apiUrl = `${VITE_APIURL}movimientos/aprobar/${codigoProducto}`;
          successMessage = "Movimiento aprobado con éxito";
        } else {
          // Producto no aprobado: aprobamos como nuevo
          apiUrl = `${VITE_APIURL}inventario/aprobar/${codigoProducto}`;
          successMessage = "Producto aprobado con éxito";
        }
      } else if (selectedStatus === 'rechazado') {
        apiUrl = `${VITE_APIURL}inventario/rechazar/${codigoProducto}`;
        successMessage = "Producto rechazado con éxito";
      }

      const bodyData = { estado: selectedStatus };

      // 👇 Comentado: ya no se agregan mínimo y máximo en esta etapa
      /*
      if (selectedStatus === 'aprobado' && !(product && product.estado === 'aprobado')) {
        bodyData.minimo = minimo;
        bodyData.maximo = maximo;
      }
      */

      const response = await fetch(apiUrl, {
        method: 'PUT',
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

      if (onStatusChange) {
        onStatusChange(codigoProducto, selectedStatus);
      }

      onClose();
    } catch (error) {
      console.error("Error en aprobación/rechazo:", error.message);
      message.error(error.message || 'Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  // 👇 Esta lógica queda desactivada, ya no se piden inputs de mínimo y máximo
  // const showInputs = selectedStatus === 'aprobado' && !(product && product.estado === 'aprobado');

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

      {/* 
      {showInputs && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <InputNumber
            placeholder="Mínimo"
            value={minimo}
            onChange={(value) => setMinimo(value)}
            style={{ width: '150px', color: 'black'}}
          />
          <InputNumber
            placeholder="Máximo"
            value={maximo}
            onChange={(value) => setMaximo(value)}
            style={{ width: '150px' }}
          />
        </div>
      )}
      */}
    </Modal>
  );
};

export default ModalAprobarProducto;
