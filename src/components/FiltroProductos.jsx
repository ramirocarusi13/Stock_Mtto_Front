import React from 'react';
import { Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const FiltroProductos = ({ searchText, setSearchText, searchProveedor, setSearchProveedor, searchDate, setSearchDate, proveedores, onSearch }) => {
    return (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
            <Input
                placeholder="Buscar por nombre"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
                placeholder="Seleccionar proveedor"
                value={searchProveedor}
                onChange={(value) => setSearchProveedor(value)}
                style={{ width: 200 }}
                allowClear
            >
                {proveedores.map((proveedor) => (
                    <Option key={proveedor.id} value={proveedor.nombre}>
                        {proveedor.nombre}
                    </Option>
                ))}
            </Select>
            <DatePicker
                placeholder="Filtrar por fecha"
                onChange={(date) => setSearchDate(date)}
                style={{ width: 150 }}
            />
            <Button type="primary" onClick={onSearch}>
                Filtrar
            </Button>
        </div>
    );
};

export default FiltroProductos;
