import React from 'react';
import { db } from '../firebase';

const Registro = (props) => {
  const [lista, setLista] = React.useState([]);
  const [Titulo, setTitulo] = React.useState('');
  const [Autor, setAutor] = React.useState('');
  const [Descripción, setDescripción] = React.useState('');
  const [Disponibilidad, setDisponibilidad] = React.useState('');
  const [Año, setAño] = React.useState('');
  const [ImagenURL, setImagenURL] = React.useState('');
  const [modoEdicion, setModoEdicion] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [id, setId] = React.useState('');

  React.useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const data = await db.collection('Libros').get();
        const arrayData = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLista(arrayData);
      } catch (error) {
        console.error(error);
      }
    };

    obtenerDatos();
  }, []);

  const guardarDatos = async (e) => {
    e.preventDefault();

    // Validar campos
    if (!Titulo || !Autor || !Descripción || !Disponibilidad || !Año) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    // Validar que Año y Disponibilidad sean números
    if (isNaN(Año) || isNaN(Disponibilidad)) {
      setError('Año y Disponibilidad deben ser números.');
      return;
    }

    try {
      // Registrar en Firebase
      const nuevoLibro = {
        Titulo,
        Autor,
        Descripción,
        Disponibilidad: Number(Disponibilidad),
        Año: Number(Año),
        ImagenURL,
      };
      const docRef = await db.collection('Libros').add(nuevoLibro);
      setLista([...lista, { id: docRef.id, ...nuevoLibro }]);
      setTitulo('');
      setAutor('');
      setDescripción('');
      setDisponibilidad('');
      setAño('');
      setImagenURL('');
      setError(null);
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarDato = async (id) => {
    if (modoEdicion) {
      setError('No puedes eliminar mientras editas el libro.');
      return;
    }

    try {
      await db.collection('Libros').doc(id).delete();
      const listaFiltrada = lista.filter((elemento) => elemento.id !== id);
      setLista(listaFiltrada);
    } catch (error) {
      console.error(error);
    }
  };

  const editar = (elemento) => {
    setModoEdicion(true);
    setTitulo(elemento.Titulo);
    setAutor(elemento.Autor);
    setDescripción(elemento.Descripción);
    setDisponibilidad(elemento.Disponibilidad.toString());
    setAño(elemento.Año.toString());
    setImagenURL(elemento.ImagenURL);
    setId(elemento.id);
  };

  const editarDatos = async (e) => {
    e.preventDefault();

    // Validar campos
    if (!Titulo || !Autor || !Descripción || !Disponibilidad || !Año) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    // Validar que Año y Disponibilidad sean números
    if (isNaN(Año) || isNaN(Disponibilidad)) {
      setError('Año y Disponibilidad deben ser números.');
      return;
    }

    try {
      await db.collection('Libros').doc(id).update({
        Titulo,
        Autor,
        Descripción,
        Disponibilidad: Number(Disponibilidad),
        Año: Number(Año),
        ImagenURL,
      });

      const listaEditada = lista.map((elemento) =>
        elemento.id === id
          ? { id, Titulo, Autor, Descripción, Disponibilidad: Number(Disponibilidad), Año: Number(Año), ImagenURL }
          : elemento
      );

      setLista(listaEditada);
      setModoEdicion(false);
      setTitulo('');
      setAutor('');
      setDescripción('');
      setDisponibilidad('');
      setAño('');
      setImagenURL('');
      setId('');
      setError(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisponibilidadChange = (e) => {
    const value = e.target.value;
    setDisponibilidad(value);
  };

  return (
    <div className='container'>
      {modoEdicion ? (
        <h2 className='text-center text-success'>Editando Libros</h2>
      ) : (
        <h2 className='text-center text-primary'>Registro de Libros</h2>
      )}

      <form onSubmit={modoEdicion ? editarDatos : guardarDatos}>
        {error ? (
          <div className='alert alert-danger' role='alert'>
            {error}
          </div>
        ) : null}

        <input
          type='text'
          placeholder='Ingrese el Título'
          className='form-control mb-2'
          onChange={(e) => {
            setTitulo(e.target.value);
          }}
          value={Titulo}
        />
        <input
          type='text'
          placeholder='Ingrese el Autor'
          className='form-control mb-2'
          onChange={(e) => {
            setAutor(e.target.value);
          }}
          value={Autor}
        />
        <input
          type='text'
          placeholder='Ingrese la Descripción'
          className='form-control mb-2'
          onChange={(e) => {
            setDescripción(e.target.value);
          }}
          value={Descripción}
        />
        <input
          type='text'
          placeholder='Cantidad de Libros'
          className='form-control mb-2'
          onChange={handleDisponibilidadChange}
          value={Disponibilidad}
        />
        <input
          type='text'
          placeholder='Ingrese el Año'
          className='form-control mb-2'
          onChange={(e) => {
            setAño(e.target.value);
          }}
          value={Año}
        />
        <input
          type='text'
          placeholder='Ingrese la URL de la Imagen'
          className='form-control mb-2'
          onChange={(e) => {
            setImagenURL(e.target.value);
          }}
          value={ImagenURL}
        />

        <div className='d-grid gap-2'>
          {modoEdicion ? (
            <button type='submit' className='btn btn-outline-success'>
              Editar
            </button>
          ) : (
            <button type='submit' className='btn btn-outline-info'>
              Registrar
            </button>
          )}
        </div>
      </form>

      <h2 className='text-center text-primary'>Listado de Libros</h2>
      <ul className='container'>
        {lista.map((elemento) => (
          <li className='card bg-white shadow mb-3 m-2' key={elemento.id}>
            <p>
              <strong>Título:</strong> {elemento.Titulo}
            </p>
            <p>
              <strong>Autor:</strong> {elemento.Autor}
            </p>
            <p>
              <strong>Descripción:</strong> {elemento.Descripción}
            </p>
            <p>
              <strong>Disponible:</strong> {elemento.Disponibilidad >= 1 ? 'Disponible' : 'No disponible'}
            </p>
            <p>
              <strong>Año:</strong> {elemento.Año}
            </p>
            <img
              src={elemento.ImagenURL}
              alt='Portada del libro'
              className='img-fluid mb-3'
              style={{ maxWidth: '150px' }} // Ajusta el tamaño máximo de la imagen
            />
            <button
              onClick={() => eliminarDato(elemento.id)}
              className='btn btn-danger float-end me-2'
            >
              Eliminar
            </button>
            <button
              onClick={() => editar(elemento)}
              className='btn btn-warning float-end me-2'
            >
              Editar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Registro;
