import React from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Registro from './Registro';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    if (auth.currentUser) {
      console.log('Existe un usuario');
      setUser(auth.currentUser);
    } else {
      console.log('No existe un usuario');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      {user && (
        <h3>Usuario: {user.email}</h3>
      )}

      {user && user.email === 'administrador@gmail.com' ? (
        <Registro user={user} />
      ) : (
        navigate('/usuarios')
      )}
    </div>
  );
};

export default Admin;