import React, { useState, useEffect } from 'react';
import { Modal, Button, message, InputNumber } from 'antd';

const ModalAprobarProducto = ({ visible, onClose, product, onStatusChange, VITE_APIURL }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [minimo, setMinimo] = useState(null);
  const [maximo, setMaximo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Se puede usar un useEffect para ver los datos del producto (opcional)
  useEffect(() => {
    
  }, [product]);

  const handleConfirm = async () => {
    if (!selectedStatus) {
      message.warning("Debes seleccionar un estado.");
      return;
    }

    // Si se aprueba y el producto NO está aprobado aún (producto nuevo o pendiente),
    // se requieren los valores de mínimo y máximo.
    if (selectedStatus === 'aprobado') {
      if (!(product && product.estado === 'aprobado') && (minimo === null || maximo === null)) {
        message.warning('Debes ingresar los valores mínimo y máximo.');
        return;
      }
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
          // Producto ya aprobado: se suma cantidad (aprobamos solo el movimiento)
          apiUrl = `${VITE_APIURL}movimientos/aprobar/${codigoProducto}`;
          successMessage = "Movimiento aprobado con éxito";
        } else {
          // Producto no aprobado: se aprueba el producto con límites
          apiUrl = `${VITE_APIURL}inventario/aprobar-con-limites/${codigoProducto}`;
          successMessage = "Producto aprobado con éxito y límites actualizados";
        }
      } else if (selectedStatus === 'rechazado') {
        // Para rechazar se utiliza la misma ruta (se podría ajustar según lógica de negocio)
        apiUrl = `${VITE_APIURL}inventario/rechazar/${codigoProducto}`;
        successMessage = "Producto rechazado con éxito";
      }

      const bodyData = { estado: selectedStatus };
      // Solo incluir los límites si el producto no está aprobado aún
      if (selectedStatus === 'aprobado' && !(product && product.estado === 'aprobado')) {
        bodyData.minimo = minimo;
        bodyData.maximo = maximo;
      }

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

  // Se muestran los inputs de mínimo y máximo solo si se selecciona "aprobado"
  // Y el producto no está aprobado (para el caso de sumar stock, no se solicitan límites)
  const showInputs = selectedStatus === 'aprobado' && !(product && product.estado === 'aprobado');

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
    </Modal>
  );
};

export default ModalAprobarProducto;
