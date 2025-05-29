import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import './index.css';
import MyMenu from './components/Menu';
import Pañol from './pages/Pañol';
import Inventario from './pages/Inventario';
import Salidas from './pages/Salidas';
import Prestamos from './pages/Prestamos';
import PendientesList from './components/PendientesList';
import Costos from './pages/Costos';
import Reporte from './pages/Reporte';
import Criticos from './pages/Criticos';
import PuntoDePedido from './pages/PuntoDePedido';

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
        <Route path="/pañol/costos" element={<Costos />} />
        <Route path="/pañol/reporte" element={<Reporte />} />
        <Route path="/pañol/criticos" element={<Criticos />} />
        <Route path="/pañol/punto-de-pedido" element={<PuntoDePedido />} />


        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
