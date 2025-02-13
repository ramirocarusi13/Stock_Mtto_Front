import React, { useEffect, useState } from 'react';
import { Table, Typography, Card, Button, message, Input } from 'antd';
import { EditOutlined, CheckOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AgregarProductoModal from './AgregarProducto';
import ModalAprobarProducto from './ModalAprobarProducto';
import ModalModificarProducto from './ModalModificarProducto';
import EditarcantidadModal from './EditarcantidadModal'; // Importamos el modal de edición de cantidad

const { Title } = Typography;

const ProductList = () => {
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalAprobarVisible, setModalAprobarVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [isModalCantidadVisible, setIsModalCantidadVisible] = useState(false); // Estado para el modal de cantidad
    const [currentProduct, setCurrentProduct] = useState(null);
    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null); // Movimiento seleccionado
    const [searchText, setSearchText] = useState('');

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        fetchProductos();
    }, []);

    // Función para obtener productos aprobados
    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}inventario`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener los productos');
            }

            const productosAprobados = data.data.filter(product => product.estado === 'aprobado');

            const productosConStock = await Promise.all(
                productosAprobados.map(async (product) => {
                    const stockResponse = await fetch(`${VITE_APIURL}inventario/${product.codigo}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    });

                    const stockData = await stockResponse.json();
                    return {
                        ...product,
                        stock_real: stockData.stock_real || 0,
                    };
                })
            );

            setProductos(productosConStock);
            setFilteredProductos(productosConStock);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            message.error('Error al obtener los productos');
        } finally {
            setLoading(false);
        }
    };

    // Manejo de filtro en tiempo real
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        const filtered = productos.filter((product) =>
            product.codigo.toLowerCase().includes(value) ||
            product.descripcion.toLowerCase().includes(value) ||
            (product.proveedor && product.proveedor.nombre.toLowerCase().includes(value))
        );

        setFilteredProductos(filtered);
    };

    // Manejo del modal de edición de cantidad
    const handleEditCantidad = (producto) => {
        setMovimientoSeleccionado(producto);
        setIsModalCantidadVisible(true);
    };

    // Función para actualizar la cantidad después de editar
    const handleCantidadUpdated = (codigo, nuevaCantidad) => {
        setProductos((prevProductos) =>
            prevProductos.map((prod) =>
                prod.codigo === codigo ? { ...prod, stock_real: nuevaCantidad } : prod
            )
        );
        setFilteredProductos((prevProductos) =>
            prevProductos.map((prod) =>
                prod.codigo === codigo ? { ...prod, stock_real: nuevaCantidad } : prod
            )
        );
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '20px',
            maxWidth: '1400px',
            margin: 'auto',
        }}>
            <div style={{ flex: 1, paddingLeft: '20px' }}>
                <Card>
                    <Title level={2} style={{ textAlign: 'center' }}>Productos</Title>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            style={{ width: '20%' }}
                        >
                            Agregar Producto
                        </Button>

                        <Input
                            placeholder="Buscar por código, nombre o proveedor..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={handleSearchChange}
                            style={{ width: '40%' }}
                        />
                    </div>

                    <Table
                        columns={[
                            {
                                title: 'Código',
                                dataIndex: 'codigo',
                                key: 'codigo',
                            },
                            {
                                title: 'Producto',
                                dataIndex: 'descripcion',
                                key: 'descripcion',
                            },
                            {
                                title: 'Proveedor',
                                dataIndex: 'proveedor',
                                key: 'proveedor',
                                render: (_, record) => record?.proveedor?.nombre || 'N/A'
                            },
                            {
                                title: 'Stock Real',
                                dataIndex: 'stock_real',
                                key: 'stock_real',
                                render: (stock) => stock ?? 0,
                            },
                            {
                                title: 'Acciones',
                                key: 'acciones',
                                render: (_, record) => (
                                    <>
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditCantidad(record)}
                                            type="primary"
                                            style={{ marginRight: '8px' }}
                                        >
                                            Editar Cantidad
                                        </Button>
                                    </>
                                ),
                            },
                        ]}
                        dataSource={filteredProductos}
                        rowKey="codigo"
                        bordered
                        loading={loading}
                    />
                </Card>
            </div>
            <AgregarProductoModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onProductAdded={(newProduct) => {
                    if (newProduct.estado === 'aprobado') {
                        setProductos((prev) => [...prev, { ...newProduct, stock_real: 0 }]);
                        setFilteredProductos((prev) => [...prev, { ...newProduct, stock_real: 0 }]);
                    }
                }}
                VITE_APIURL={VITE_APIURL}
            />
    
            <ModalAprobarProducto
                visible={modalAprobarVisible}
                onClose={() => setModalAprobarVisible(false)}
                product={currentProduct}
                onStatusChange={(codigo, newStatus) => {
                    setProductos((prev) =>
                        prev.map((p) =>
                            p.codigo === codigo ? { ...p, estado: newStatus } : p
                        )
                    );
                    setFilteredProductos((prev) =>
                        prev.map((p) =>
                            p.codigo === codigo ? { ...p, estado: newStatus } : p
                        )
                    );
                }}
                VITE_APIURL={VITE_APIURL}
            />

            <EditarcantidadModal
                visible={isModalCantidadVisible}
                onClose={() => setIsModalCantidadVisible(false)}
                movimiento={movimientoSeleccionado}
                onCantidadUpdated={handleCantidadUpdated}
                VITE_APIURL={VITE_APIURL}
            />
        </div>
    );
};

export default ProductList;
