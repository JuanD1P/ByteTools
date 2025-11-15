import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Login from './Components/Login';
import Registro from './Components/Registro';
import Inicio from './Components/Inicio';
import NotFound from './Components/NotFound';
import ProtectedRoute from './Components/PrivateRoute';
import Admin from './Components/Admin';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Conversion1 from './Components/Conversion1';
import DimensionamientoWifi from './Components/DimensionamientoWifi';
import IotPanel from './Components/IotPanel';
import Radio from './Components/Radio';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/userlogin" />} />

                <Route path="/userlogin" element={<Login />} />
                <Route path="/Registro" element={<Registro />} />

                <Route element={<LayoutWithNavbar />}>
                
                {/* RUTAS PARA EL ADMINISTRADOR */}

                    <Route path="/Admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <Admin />
                        </ProtectedRoute>
                    } />


                {/* RUTAS PARA LOS USUARIOS */}   

                
                    <Route path="/Inicio" element={
                        <ProtectedRoute allowedRoles={['USER']}>
                            <Inicio />
                        </ProtectedRoute>
                    } />

                    <Route path="/modulos/radio" element={
                        <ProtectedRoute allowedRoles={['USER']}>
                            <Radio />
                        </ProtectedRoute>
                    } />

                    <Route path="/modulos/velocidades" element={
                        <ProtectedRoute allowedRoles={['USER']}>
                            <Conversion1 />
                        </ProtectedRoute>
                    } />

                    <Route path="/modulos/wifi" element={
                        <ProtectedRoute allowedRoles={['USER']}>
                            <DimensionamientoWifi />
                        </ProtectedRoute>
                    } />
                    <Route path="/modulos/iot" element={
                        <ProtectedRoute allowedRoles={['USER']}>
                            <IotPanel />
                        </ProtectedRoute>
                    } />



                </Route>

    

                {/* RUTA NO ENCONTRADA */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}


//Navbar
function LayoutWithNavbar() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}



export default App;
