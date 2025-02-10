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
                setProductos(data.data.filter(product => product.estado === 'aprobado'));
                setProductosPendientes(data.data.filter(product => product.estado === 'pendiente'));
            } catch (error) {
                console.error('Error al obtener los productos:', error);
                alert('Error al obtener los productos');
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []);

    const handleApproveClick = (product) => {
        setCurrentProduct(product);
        setModalAprobarVisible(true);
    };

    const handleEditClick = (product) => {
        setCurrentProduct(product);
        setModalEditarVisible(true);
    };
    const handleStatusChange = (productId, newStatus) => {
        setProductosPendientes(prev => prev.filter(p => p.id !== productId));

        if (newStatus === 'aprobado') {
            setProductos(prev => [...prev, { ...currentProduct, estado: 'aprobado' }]);
        }
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
            

            {/* Panel derecho con la lista de productos */}
            <div style={{
                flex: 1,
                paddingLeft: '20px',
            }}>
                <Card>
                    <Title level={2} style={{ textAlign: 'center' }}>Productos</Title>

                    {/* Solo el gerente puede ver la lista de productos pendientes */}
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                        style={{ width: '20%', marginTop: '10px' , marginBottom: '20px' }}
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
                                render: (_, record) => record?.proveedor?.nombre
                            },
                            {
                                title: 'En Stock',
                                dataIndex: 'en_stock',
                                key: 'en_stock',
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
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditClick(record)}
                                        type="primary"
                                    >
                                        Editar
                                    </Button>
                                ),
                            },
                        ]}
                        dataSource={productos.filter(product => product.estado === 'aprobado')} // 🔹 FILTRO APLICADO
                        rowKey="id"
                        bordered
                        loading={loading}
                    />

                </Card>
            </div>

            <AgregarProductoModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onProductAdded={(newProduct) => {
                    setProductos((prev) => [...prev, newProduct]);
                }}
                VITE_APIURL={VITE_APIURL}
            />


            <ModalAprobarProducto
                visible={modalAprobarVisible}
                onClose={() => setModalAprobarVisible(false)}
                product={currentProduct}
                onStatusChange={handleStatusChange} // ✅ Se pasa correctamente
                VITE_APIURL={VITE_APIURL}
            />



            <ModalModificarProducto
                visible={modalEditarVisible}
                onClose={() => setModalEditarVisible(false)}
                onSubmit={handleUpdateProduct}
                descripcionOptions={productos}
                proveedorOptions={productos.map(prod => prod.proveedor)}
                initialValues={currentProduct}
                VITE_APIURL={VITE_APIURL} // ✅ Se pasa correctamente la URL
            />

        </div>
    );
};

export default ProductList;
