// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';   // Cambia la ruta según tu estructura
import Login from './pages/Login'; // Cambia la ruta según tu estructura
import './index.css'; // Asegúrate de que este archivo contenga las directivas de Tailwind
import MyMenu from './components/Menu'
import Pañol from './pages/Pañol'
import Inventario from './pages/Inventario';
import Salidas from './pages/Salidas'; // Asegúrate de tener estas vistas
import Prestamos from './pages/Prestamos';
import PendientesList from './components/PendientesList';
import Costos from './pages/Costos'; // Importa el nuevo componente

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/pañol" element={<Pañol />} />
        <Route path="/pañol/inventario" element={<Inventario />} />
        <Route path="/pañol/prestamos" element={<Prestamos />} />
        <Route path="/pañol/salidas" element={<Salidas />} />
        <Route path="/pañol/pendientes" element={<PendientesList />} />
        <Route path="/pañol/costos" element={<Costos />} /> {/* Nueva ruta */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
