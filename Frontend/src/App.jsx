import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Login from './Components/Login';
import Registro from './Components/Registro';
import Inicio from './Components/Inicio';
import NotFound from './Components/NotFound';
import ProtectedRoute from './Components/PrivateRoute';
import Admin from './Components/Admin';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Components/Home';
import Conversion1 from './Components/Conversion1';
import DimensionamientoWifi from './Components/DimensionamientoWifi';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/Home" />} />

                <Route path="/userlogin" element={<Login />} />
                <Route path="/Registro" element={<Registro />} />

                <Route element={<LayoutWithNavbar />}>
                <Route path="/Home" element={<Home />} />
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
