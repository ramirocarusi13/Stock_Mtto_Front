import React from 'react';
import MyMenu from '../components/Menu';
import ProductList from '../components/ProductList';

function Inventario() {
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Menú ocupa un espacio fijo */}
            <div style={{ flex: '0 0 250px' }}>
                <MyMenu />
            </div>

            {/* Lista de productos ocupa el resto del espacio */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                <ProductList />
            </div>
        </div>
    );
}

export default Inventario;
