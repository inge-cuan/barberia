import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import PosDashboard from './components/PosDashboard';
import AdminUsuarios from './components/AdminUsuarios';
import AdminCorteHistorial from './components/AdminCorteHistorial';
import CajeroCorte from './components/CajeroCorte';
import RecepcionistaServicios from './components/RecepcionistaServicios';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Navigate to="admin" replace />} />
          
          {/* Rutas Admin */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="historial-caja" element={<AdminCorteHistorial />} />
          
          {/* Rutas Cajero/Recepcionista/POS */}
          <Route path="caja" element={<PosDashboard />} />
          <Route path="corte" element={<CajeroCorte />} />
          <Route path="servicios" element={<RecepcionistaServicios />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
