import React, { useState, useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons'; // Icono de usuario de Ant Design
import { useNavigate } from 'react-router-dom'; // Para redirigir al login
 // Estilos de Ant Design

const Header = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Hook para navegación

    useEffect(() => {
        // Obtener la información del usuario desde localStorage
        const userData = localStorage.getItem('user');

        if (userData) {
            setUser(JSON.parse(userData)); // Convertir de string a objeto
        }
    }, []);

    const handleLogout = () => {
        // Remover la información del usuario de localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Redirigir al usuario a la página de login
        navigate('/login');
    };

    if (!user) {
        return <p>Cargando...</p>;
    }

    return (
        <div className="flex justify-between items-center p-4 bg-gray-100 rounded shadow-md">
            {/* Información del usuario */}
            <div className="flex items-center">
                <UserOutlined className="text-3xl text-gray-500 mr-3" />
                <div>
                    <p className="text-lg font-semibold">{user.name}</p>
                </div>
            </div>
    
            {/* Contenedor para el botón de cerrar sesión */}
            <div className="flex items-center space-x-2">
                <button
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded transition duration-300 ease-in-out"
                    onClick={handleLogout}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Header;