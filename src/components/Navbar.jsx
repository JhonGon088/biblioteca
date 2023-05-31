import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Navbar = (props) => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  return (
    <div className="navbar navbar-dark bg-dark">
      <Link className="navbar-brand" to="/">
        Unicosta
      </Link>
      <div className="d-flex">
        <Link className="btn btn-dark" to="/">
          Inicio
        </Link>
        {props.firebaseUser !== null ? (
          <>
            {props.firebaseUser.email && (
              <>
                <Link className="btn btn-dark" to="/Logueado">
                  Logueado
                </Link>
                <button className="btn btn-dark" onClick={cerrarSesion}>
                  Cerrar Sesión
                </button>
              </>
            )}
          </>
        ) : (
          <Link className="btn btn-dark" to="/login">
            Login
          </Link>
        )}
        {props.firebaseUser !== null && props.firebaseUser.email !== 'administrador@gmail.com' && (
          <Link className="btn btn-dark" to="/usuarios">
            Usuarios
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;


