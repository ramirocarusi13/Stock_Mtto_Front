import React, { useEffect, useState } from 'react';
import { Table, Typography, Card, Button, message, Input ,Spin , Tag} from 'antd';
import { EditOutlined, CheckOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AgregarProductoModal from './AgregarProducto';
import ModalAprobarProducto from './ModalAprobarProducto';
import ModalModificarProducto from './ModalModificarProducto';
import EditarcantidadModal from './EditarcantidadModal';

 

const { Title } = Typography;

const ProductList = () => {
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalAprobarVisible, setModalAprobarVisible] = useState(false);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [isModalCantidadVisible, setIsModalCantidadVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);


    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        fetchProductos();
    }, []);

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

            // const productosConStock = await Promise.all(
            // productosAprobados.map(async (product) => {
            //     const stockResponse = await fetch(`${VITE_APIURL}inventario/${product.codigo}`, {
            //         method: 'GET',
            //         headers: {
            //             'Authorization': `Bearer ${localStorage.getItem('token')}`,
            //         },
            //     });

            //     const stockData = await stockResponse.json();
            //     return {
            //         ...product,
            //         stock_real: stockData.stock_real || 0,
            //     };
            // })
            // );

            setProductos(productosAprobados);
            setFilteredProductos(productosAprobados);

        } catch (error) {
            console.error('Error al obtener los productos:', error);
            message.error('Error al obtener los productos');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchText(value);
        setSearchLoading(true); // Activar solo el spinner del input

        try {
            const response = await fetch(`${VITE_APIURL}inventario?search=${encodeURIComponent(value)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = await response.json();
            setFilteredProductos(data.data || []);
        } catch (error) {
            message.error('Error al buscar productos');
        } finally {
            setSearchLoading(false); // Detener el spinner del input
        }
    };



    const handleEditCantidad = (producto) => {
        setMovimientoSeleccionado(producto);
        setIsModalCantidadVisible(true);
    };

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
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                
                    <Title level={2} className="text-center text-blue-600 mb-6">
                        Productos
                    </Title>

                    <div className="flex justify-between items-center mb-6">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                        >
                            Agregar Producto
                        </Button>

                        <Input
                            placeholder="Buscar por código, nombre o proveedor..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            suffix={searchLoading && <Spin size="small" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={handleSearchChange}
                            className="w-96 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />


                    </div>

                    <Table
                        columns={[
                            {
                                title: 'Código',
                                dataIndex: 'codigo',
                                key: 'codigo',
                                render: (codigo) => (
                                    <Tag color="volcano" className="font-mono text-sm">{codigo}</Tag>
                                ),
                            },
                            {
                                title: 'Producto',
                                dataIndex: 'descripcion',
                                key: 'descripcion',
                                render: (descripcion) => (
                                    <Tag color="purple" className="text-xs">{descripcion}</Tag>
                                ),
                            },
                            {
                                title: 'Proveedor',
                                dataIndex: 'proveedor',
                                key: 'proveedor',
                                render: (_, record) => (
                                    <Tag color="geekblue">{record?.proveedor?.nombre || 'N/A'}</Tag>
                                ),
                            },
                            {
                                title: 'Stock Real',
                                dataIndex: 'stock_real',
                                key: 'stock_real',
                                render: (_, record) => {
                                    const stock = record?.stock?.reduce((prev, cur) => prev + parseFloat(cur.cantidad), 0);
                                    const isLow = stock < (record.punto_de_pedido ?? 0);
                                    return (
                                        <Tag color={isLow ? 'red' : 'green'}>
                                            {stock ?? 0}
                                        </Tag>
                                    );
                                },
                            },
                            {
                                title: 'Punto de Pedido',
                                dataIndex: 'punto_de_pedido',
                                key: 'punto_de_pedido',
                                render: (value) => <Tag color="orange">{value ?? 0}</Tag>,
                            },
                            {
                                title: 'Mínimo',
                                dataIndex: 'minimo',
                                key: 'minimo',
                                render: (value) => <Tag color="red">{value ?? 0}</Tag>,
                            },
                            {
                                title: 'Máximo',
                                dataIndex: 'maximo',
                                key: 'maximo',
                                render: (value) => <Tag color="blue">{value ?? 0}</Tag>,
                            },
                            {
                                title: 'Acciones',
                                key: 'acciones',
                                render: (_, record) => (
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditCantidad(record)}
                                        type="primary"
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-4 rounded-lg transition duration-300"
                                    >
                                        Editar Cantidad
                                    </Button>
                                ),
                            },
                        ]}

                        bordered
                        size="middle"
                        pagination={{ pageSize: 15 ,
                            showSizeChanger: false,
                        }}
                        className="shadow-lg bg-white rounded-lg"
                        rowClassName="hover:bg-blue-50 transition-colors duration-200 text-sm"
                        dataSource={filteredProductos}
                        rowKey="codigo"
                        loading={loading}
                    />
                

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


        </div >

    );
};

export default ProductList;