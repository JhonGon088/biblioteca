import React, { useEffect, useState } from 'react';
import { db } from '../firebase';

const Usuarios = () => {
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [librosFiltrados, setLibrosFiltrados] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [prestamoConfirmado, setPrestamoConfirmado] = useState(false);
  const [prestamoRealizado, setPrestamoRealizado] = useState(false);
  const [librosPrestados, setLibrosPrestados] = useState([]);

  useEffect(() => {
    const obtenerLibros = async () => {
      try {
        const librosSnapshot = await db.collection('Libros').get();
        const librosData = librosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLibros(librosData);
      } catch (error) {
        console.error('Error al obtener los libros:', error);
      }
    };

    obtenerLibros();
  }, []);

  useEffect(() => {
    const obtenerLibrosPrestados = async () => {
      try {
        const librosPrestadosSnapshot = await db.collection('Libros').where('PrestadoPor', '!=', null).get();
        const librosPrestadosData = librosPrestadosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLibrosPrestados(librosPrestadosData);
      } catch (error) {
        console.error('Error al obtener los libros prestados:', error);
      }
    };

    obtenerLibrosPrestados();
  }, [prestamoRealizado]);

  useEffect(() => {
    const filtrarLibros = () => {
      let librosFiltrados = libros;

      if (filtro !== 'todos') {
        librosFiltrados = librosFiltrados.filter((libro) => {
          if (filtro === 'titulo') {
            return libro.Titulo.toLowerCase().includes(busqueda.toLowerCase());
          } else if (filtro === 'autor') {
            return libro.Autor.toLowerCase().includes(busqueda.toLowerCase());
          } else if (filtro === 'año') {
            return libro.Año.toLowerCase().includes(busqueda.toLowerCase());
          }
          return false;
        });
      } else {
        librosFiltrados = librosFiltrados.filter((libro) => {
          return (
            libro.Titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            libro.Autor.toLowerCase().includes(busqueda.toLowerCase()) ||
            libro.Año.toLowerCase().includes(busqueda.toLowerCase())
          );
        });
      }

      setLibrosFiltrados(librosFiltrados);
    };

    filtrarLibros();
  }, [busqueda, libros, filtro]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleMouseEnter = (id) => {
    setLibroSeleccionado(id);
  };

  const handleMouseLeave = () => {
    setLibroSeleccionado(null);
  };

  const handlePrestarClick = async () => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas solicitar el préstamo del libro?');
    if (confirmacion) {
      // Comprobar si el usuario ya realizó un préstamo
      if (prestamoRealizado) {
        alert('Ya has realizado un préstamo');
        return;
      }

      // Realizar el préstamo del libro
      try {
        const libroSeleccionadoRef = db.collection('Libros').doc(libroSeleccionado);
        const libroSeleccionadoDoc = await libroSeleccionadoRef.get();

        if (libroSeleccionadoDoc.exists) {
          const libroData = libroSeleccionadoDoc.data();
          const disponibilidadActual = libroData.Disponibilidad;

          // Verificar si el libro está disponible
          if (disponibilidadActual === 0) {
            alert('El libro no está disponible en este momento');
            return;
          }

          // Actualizar la disponibilidad del libro
          await libroSeleccionadoRef.update({
            Disponibilidad: disponibilidadActual - 1,
            PrestadoPor: 'Usuario actual', 
          });

          // Marcar el préstamo como realizado
          setPrestamoRealizado(true);

          alert('Préstamo realizado con éxito');
        }
      } catch (error) {
        console.error('Error al realizar el préstamo:', error);
        alert('Ocurrió un error al realizar el préstamo');
      }
    }
  };

  
  const handleDevolverClick = async (libroId) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas devolver el libro?');
    if (confirmacion) {
      try {
        const libroRef = db.collection('Libros').doc(libroId);
  
        // Obtener la información del libro
        const libroDoc = await libroRef.get();
        const libroData = libroDoc.data();
  
        // Actualizar la disponibilidad del libro
        await libroRef.update({
          Disponibilidad: libroData.Disponibilidad + 1,
          PrestadoPor: null,
        });
  
        // Actualizar la lista de libros prestados
        setLibrosPrestados((prevState) => prevState.filter((libro) => libro.id !== libroId));
  
        alert('Libro devuelto con éxito');
        setPrestamoRealizado(false); // Marcar como no realizado
      } catch (error) {
        console.error('Error al devolver el libro:', error);
        alert('Ocurrió un error al devolver el libro');
      }
    }
  };
  
  return (
    <div className="container">
      <h1 className="text-center mt-4">BIBLIOTECA UNICOSTA</h1>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar..."
          value={busqueda}
          onChange={handleBusquedaChange}
        />
      </div>

      <div className="mb-4">
        <select className="form-control" value={filtro} onChange={handleFiltroChange}>
          <option value="todos">Todos</option>
          <option value="titulo">Título</option>
          <option value="autor">Autor</option>
          <option value="año">Año</option>
        </select>
      </div>

      <div className="row">
        {librosFiltrados.map((libro) => (
          <div
            className="col-lg-3 col-md-4 col-sm-6 mb-4"
            key={libro.id}
            onMouseEnter={() => handleMouseEnter(libro.id)}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`card ${libroSeleccionado === libro.id ? "border-primary" : ""}`}>
              <img
                src={libro.ImagenURL}
                className="card-img-top"
                alt="Portada del libro"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{libro.Titulo}</h5>
                <p className="card-text">
                  <strong>Autor:</strong> {libro.Autor}
                </p>
                <p className="card-text">
                  <strong>Descripción:</strong> {libro.Descripción}
                </p>
                {!librosPrestados.some((libroPrestado) => libroPrestado.id === libro.id) && (
                  <p className="card-text">
                    <strong>Disponibilidad:</strong> {libro.Disponibilidad}
                  </p>
                  
                )}
                <p className="card-text">
                  <strong>Año:</strong> {libro.Año}
                </p>
                {libroSeleccionado === libro.id && (
                  <button className="btn btn-primary" onClick={handlePrestarClick} disabled={prestamoRealizado}>
                    {prestamoRealizado ? "Ya has realizado un prestamo" : "Prestar"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-4">Libros prestados</h2>

      <div className="row">
        {librosPrestados.map((libro) => (
          <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={libro.id}>
            <div className="card">
              <img
                src={libro.ImagenURL}
                className="card-img-top"
                alt="Portada del libro"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{libro.Titulo}</h5>
                <p className="card-text">
                  <strong>Autor:</strong> {libro.Autor}
                </p>
                <p className="card-text">
                  <strong>Descripción:</strong> {libro.Descripción}
                </p>
                <p className="card-text">
                  <strong>Año:</strong> {libro.Año}
                </p>
                <button className="btn btn-primary" onClick={() => handleDevolverClick(libro.id)}>
                  Devolver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Usuarios;
