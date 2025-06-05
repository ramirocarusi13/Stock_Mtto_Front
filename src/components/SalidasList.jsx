import React, { useEffect, useState, useRef } from 'react';
import {
    Table,
    Button,
    Tag,
    message,
    Modal,
    Form,
    Select,
    InputNumber,
    Input,
    Spin,
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    PlusOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import FiltroSalidas from './FiltroSalidas';
import ModalRegistrarSalida from './ModalRegistrarSalida'; // importar componente





const { Option } = Select;

const SalidasList = () => {
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [modalSalidaVisible, setModalSalidaVisible] = useState(false);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [productoSearchText, setProductoSearchText] = useState('');
    const [productoSearchStatus, setProductoSearchStatus] = useState('idle');
    const [formSalida] = Form.useForm();
    const selectRef = useRef(null);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        fetchSalidasFromServer(); // traer 100 salidas por defecto
    }, []);

    const fetchSalidasFromServer = async (search = '') => {
        setLoading(true);
        try {
            const response = await fetch(`${VITE_APIURL}movimientos/egresos?search=${encodeURIComponent(search.trim())}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            setSalidas(data.movimientos || []);
        } catch (error) {
            console.error("Error al obtener las salidas:", error);
            message.error('Error al obtener las salidas');
        } finally {
            setLoading(false);
        }
    };

    const abrirModalSalida = () => {
        setModalSalidaVisible(true);
        formSalida.resetFields();
        setProductoSearchText('');
        setFilteredProductos([]);
        setProductoSearchStatus('idle');
    };

    const buscarProductoPorCodigo = async () => {
        if (!productoSearchText.trim()) return;
        setProductoSearchStatus('loading');

        try {
            const response = await fetch(`${VITE_APIURL}inventario?search=${encodeURIComponent(productoSearchText.trim())}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            const productosAprobados = data.data?.filter(p => p.estado === 'aprobado') || [];
            setFilteredProductos(productosAprobados);
            setProductoSearchStatus('success');

            setTimeout(() => {
                selectRef.current?.focus();
                selectRef.current?.open();
            }, 150);
        } catch (error) {
            console.error("Error al buscar producto por código:", error);
            message.error('Error al buscar producto');
            setProductoSearchStatus('idle');
        }
    };

    const handleRegistrarSalida = async () => {
        try {
            const values = await formSalida.validateFields();
            const producto = filteredProductos.find(p => p.id === values.productoId);

            if (!producto) {
                message.error('Seleccione un producto válido');
                return;
            }

            const cantidad = Math.abs(values.cantidadSalida) * -1;

            const response = await fetch(`${VITE_APIURL}movimientos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo_producto: producto.codigo,
                    cantidad: cantidad,
                    motivo: 'egreso',
                    estado: 'aprobado',
                    observacion_salida: values.observacionSalida || ''
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al registrar la salida');
            }

            message.success('Salida registrada con éxito');
            setModalSalidaVisible(false);
            fetchSalidasFromServer();
        } catch (error) {
            console.error("Error al registrar la salida:", error);
            message.error('Error al registrar la salida: ' + error.message);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📦 Registro de Salidas</h1>

            <div className="flex justify-between items-center mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={abrirModalSalida}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition"
                >
                    Registrar Salida
                </Button>

                <FiltroSalidas
                    searchText={searchText}
                    setSearchText={setSearchText}
                    onSearch={(text) => fetchSalidasFromServer(text)}
                />
            </div>

            <Table
                columns={[
                    {
                        title: 'Usuario',
                        dataIndex: ['usuario', 'name'],
                        key: 'usuario',
                        render: (usuario) => (
                            <Tag icon={<UserOutlined />} color="blue">
                                {usuario || 'Desconocido'}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Código de Producto',
                        dataIndex: 'codigo_producto',
                        key: 'codigo_producto',
                        render: (codigo) => <Tag color="volcano">{codigo}</Tag>,
                    },
                    {
                        title: 'Descripción',
                        dataIndex: ['producto', 'descripcion'],
                        key: 'descripcion',
                        render: (descripcion) => <Tag color="purple">{descripcion || 'Sin descripción'}</Tag>,
                    },
                    {
                        title: 'Cantidad',
                        dataIndex: 'cantidad',
                        key: 'cantidad',
                        render: (cantidad) => <Tag color="red">{cantidad}</Tag>,
                    },
                    {
                        title: 'Observación',
                        dataIndex: 'observacion_salida',
                        key: 'observacion_salida',
                        render: (observacion) => <Tag color="gold">{observacion || 'Sin observación'}</Tag>,
                    },
                    {
                        title: 'Fecha',
                        dataIndex: 'created_at',
                        key: 'fecha',
                        render: (fecha) => (
                            <Tag icon={<CalendarOutlined />} color="green">
                                {new Date(fecha).toLocaleDateString()}
                            </Tag>
                        ),
                    },
                ]}
                dataSource={salidas}
                rowKey="id"
                loading={loading}
                bordered
                className="shadow-lg bg-white rounded-lg"
                pagination={{ pageSize: 8 }}
            />

            <ModalRegistrarSalida
                visible={modalSalidaVisible}
                onClose={() => setModalSalidaVisible(false)}
                VITE_APIURL={VITE_APIURL}
                onRegistrar={async (payload) => {
                    try {
                        const response = await fetch(`${VITE_APIURL}movimientos`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(payload),
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || 'Error al registrar la salida');
                        }

                        message.success('Salida registrada con éxito');
                        fetchSalidasFromServer(); // refresca tabla
                    } catch (error) {
                        console.error("Error al registrar la salida:", error);
                        message.error('Error al registrar la salida: ' + error.message);
                    }
                }}
            />
        </div>
    );
};

export default SalidasList;
