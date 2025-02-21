import React, { useEffect, useState } from 'react';
import { Table, Select, message } from 'antd';
import ReporteCategorias from '../components/ReporteCategorias';
import MyMenu from '../components/Menu';
import ReporteEgresos from '../components/ReporteEgresos';

const { Option } = Select;

const Reporte = () => {
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [loading, setLoading] = useState(false);

    const VITE_APIURL = import.meta.env.VITE_APIURL;

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await fetch(`${VITE_APIURL}categorias`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error('Error al obtener categorías');
                const data = await response.json();
                setCategorias(data);
            } catch (error) {
                console.error('Error al obtener categorías:', error);
                message.error('No se pudieron cargar las categorías');
            }
        };
        fetchCategorias();
    }, []);

    return (
        <div className="flex min-h-screen">
            {/* Menú lateral */}
            <div className="w-64 bg-gray-800 text-white min-h-screen">
                <MyMenu />
            </div>

            {/* Contenido principal */}
            <div className="flex-1 p-6 bg-gray-100">

                <ReporteEgresos />
            </div>
        </div>
    );
};

export default Reporte;
