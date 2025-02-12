import React, { useEffect, useState } from 'react';
import { Table, Typography, Card, Button, message } from 'antd';
import { EditOutlined, CheckOutlined, PlusOutlined } from '@ant-design/icons';
import AgregarProducto from './AgregarProducto';
import ModalAprobarProducto from './ModalAprobarProducto';
import ModalModificarProducto from './ModalModificarProducto'; // Importar el modal de edición
import AgregarProductoModal from './AgregarProducto';
import FiltroProductos from './FiltroProductos';



const { Title } = Typography;

const ProductList = () => {
    const [productos, setProductos] = useState([]);
    const [productosPendientes, setProductosPendientes] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalAprobarVisible, setModalAprobarVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchProveedor, setSearchProveedor] = useState('');
    const [searchDate, setSearchDate] = useState(null);



    const VITE_APIURL = import.meta.env.VITE_APIURL;

    // Obtener los datos del usuario desde localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const userRole = userData.rol || 'guest'; // Si no hay rol, lo establecemos como "guest"

    useEffect(() => {
        fetchProductos();
    }, []);

    // Función para obtener productos con stock real
    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}inventario`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener los productos');
            }

            // Obtener stock real para cada producto
            const productosConStock = await Promise.all(
                data.data.map(async (product) => {
                    const stockResponse = await fetch(`${VITE_APIURL}inventario/${product.codigo}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const stockData = await stockResponse.json();
                    return {
                        ...product,
                        stock_real: stockData.stock_real, // Agregamos el stock real al producto
                    };
                })
            );

            setProductos(productosConStock);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            message.error('Error al obtener los productos');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (product) => {
        setCurrentProduct(product);
        setModalAprobarVisible(true);
    };

    const handleEditClick = (product) => {
        setCurrentProduct(product);
        setModalEditarVisible(true);
    };
    const handleStatusChange = async (codigo, newStatus) => {
        setProductos((prev) =>
            prev.map((p) =>
                p.codigo === codigo ? { ...p, estado: newStatus } : p
            )
        );
    };
    const handleSearch = () => {
        setFilteredProductos(productos.filter(item =>
            item.descripcion.toLowerCase().includes(searchText.toLowerCase()) &&
            (searchProveedor ? item.proveedor?.nombre.toLowerCase().includes(searchProveedor.toLowerCase()) : true) &&
            (searchDate ? item.fecha === searchDate.format('YYYY-MM-DD') : true)
        ));

        setFilteredPendientes(productosPendientes.filter(item =>
            item.descripcion.toLowerCase().includes(searchText.toLowerCase()) &&
            (searchProveedor ? item.proveedor?.nombre.toLowerCase().includes(searchProveedor.toLowerCase()) : true) &&
            (searchDate ? item.fecha === searchDate.format('YYYY-MM-DD') : true)
        ));
    };



    const handleUpdateProduct = async (updatedProduct) => {
        try {
            const response = await fetch(`${VITE_APIURL}inventario/${currentProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el producto');
            }

            message.success('Producto actualizado con éxito');

            // Actualizar la lista de productos en el frontend
            setProductos((prevProductos) =>
                prevProductos.map((prod) =>
                    prod.id === currentProduct.id ? { ...prod, ...updatedProduct } : prod
                )
            );

            setModalEditarVisible(false);
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            message.error('Error al actualizar el producto');
        }
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
            <div style={{
                flex: 1,
                paddingLeft: '20px',
            }}>
                <Card>
                    <Title level={2} style={{ textAlign: 'center' }}>Productos</Title>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                        style={{ width: '20%', marginTop: '10px', marginBottom: '20px' }}
                    >
                        Agregar Producto
                    </Button>

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
                                render: (stock) => stock ?? 0, // Si no hay stock, mostrar 0
                            },
                            {
                                title: 'Stock Mínimo',
                                dataIndex: 'minimo',
                                key: 'minimo',
                            },
                            {
                                title: 'Máximo',
                                dataIndex: 'maximo',
                                key: 'maximo',
                            },
                            {
                                title: 'Acciones',
                                key: 'acciones',
                                render: (_, record) => (
                                    <>
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditClick(record)}
                                            type="primary"
                                            style={{ marginRight: '8px' }}
                                        >
                                            Editar
                                        </Button>
                                        {record.estado === 'pendiente' && (
                                            <Button
                                                icon={<CheckOutlined />}
                                                onClick={() => handleApproveClick(record)}
                                                type="primary"
                                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                            >
                                                Aprobar
                                            </Button>
                                        )}
                                    </>
                                ),
                            },
                        ]}
                        dataSource={productos}
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
                    setProductos((prev) => [...prev, { ...newProduct, stock_real: 0 }]);
                }}
                VITE_APIURL={VITE_APIURL}
            />

            <ModalAprobarProducto
                visible={modalAprobarVisible}
                onClose={() => setModalAprobarVisible(false)}
                product={currentProduct}
                onStatusChange={handleStatusChange}
                VITE_APIURL={VITE_APIURL}
            />

            <ModalModificarProducto
                visible={modalEditarVisible}
                onClose={() => setModalEditarVisible(false)}
                onSubmit={fetchProductos} // Recargar lista después de editar
                initialValues={currentProduct}
                VITE_APIURL={VITE_APIURL}
            />
        </div>
    );
};

export default ProductList;
