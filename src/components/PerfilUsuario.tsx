// src/components/PerfilUsuario.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import { FaUser, FaShoppingCart, FaPalette, FaFileAlt, FaSignOutAlt, FaKey, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function PerfilUsuario() {
  const { usuario, actualizarUsuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    telefono: usuario?.telefono || '',
    direccion: usuario?.direccion || '',
  });

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
      });
    }
  }, [usuario]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleGuardar = async () => {
    if (!usuario) return;
    try {
      setGuardando(true);

      // Actualizar usuario
      const resp = await apiClient.put('clientes/me/perfil', {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
      });

      // Actualizar dirección si es cliente
      if (usuario.rol === 'CLIENTE') {
        await apiClient.patch('clientes/me/direccion', {
          direccionEntrega: form.direccion,
        });
      }

      // Actualizar frontend
      actualizarUsuario({
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        direccion: form.direccion,
      });

      setEditModal(false);
      alert('Cambios guardados correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  if (!usuario) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Barra lateral */}
      <aside className="w-64 bg-white shadow-md flex flex-col p-6 gap-4">
        <h2 className="text-xl font-bold mb-4">Mi Cuenta</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded">
          <FaUser /> Información Personal
        </button>
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded">
          <FaShoppingCart /> Mis Pedidos
        </button>
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded">
          <FaPalette /> Mis Personalizaciones
        </button>
        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded">
          <FaFileAlt /> Mis Cotizaciones
        </button>
        <button
          onClick={() => { cerrarSesion(); navigate('/login'); }}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 rounded"
        >
          <FaSignOutAlt /> Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col gap-6 p-6 items-center">
        <h1 className="text-2xl font-bold">Información Personal</h1>

        {/* Tarjeta perfil */}
        <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center w-full max-w-4xl">
          <div>
            <span className="font-semibold text-lg">{form.nombre} {form.apellido}</span>
            <p className="text-gray-600">{form.telefono ? `+51 ${form.telefono}` : 'Sin teléfono'}</p>
            <span className="inline-block bg-teal-600 text-white px-2 py-1 mt-1 rounded text-xs">CLIENTE</span>
          </div>
          <button
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            onClick={() => setEditModal(true)}
          >
            Editar perfil
          </button>
        </div>

        {/* Tarjeta dirección */}
        <div className="bg-white rounded-xl shadow p-6 w-full max-w-4xl flex justify-between">
          <div>
            <p className="font-semibold">Dirección de entrega</p>
            <p className="text-gray-600">{form.direccion || 'Sin dirección'}</p>
          </div>
          <button className="text-pink-600" onClick={() => setEditModal(true)}>Cambiar</button>
        </div>

        {/* Tarjeta contraseña */}
        <div className="bg-white rounded-xl shadow p-6 w-full max-w-4xl flex justify-between">
          <div>
            <p className="font-semibold">Contraseña</p>
            <p className="text-gray-600">********</p>
          </div>
          <button className="text-blue-600" onClick={() => setPasswordModal(true)}>Cambiar</button>
        </div>

        {/* Tarjeta eliminar cuenta */}
        <div className="bg-white rounded-xl shadow p-6 w-full max-w-4xl flex justify-between">
          <div>
            <p className="font-semibold text-red-600">Eliminar cuenta</p>
            <p className="text-gray-600 text-sm">Esta acción borrará tu información personal e historial.</p>
          </div>
          <button className="border border-red-600 text-red-600 px-4 py-2 rounded" onClick={() => setDeleteModal(true)}>
            Eliminar cuenta
          </button>
        </div>

        {/* Modal editar perfil */}
        {editModal && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Editar Perfil</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Nombre"
                />
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Apellido"
                />
              </div>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Teléfono (+51)"
              />
              <input
                type="text"
                value={form.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Dirección de entrega"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleGuardar}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={guardando}
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal cambiar contraseña */}
        {passwordModal && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Cambiar Contraseña</h2>
              <input type="password" placeholder="Contraseña actual" className="border p-2 rounded w-full" />
              <input type="password" placeholder="Nueva contraseña" className="border p-2 rounded w-full" />
              <input type="password" placeholder="Confirmar nueva contraseña" className="border p-2 rounded w-full" />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setPasswordModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal eliminar cuenta */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-red-600">Eliminar Cuenta</h2>
              <p>¿Estás seguro que deseas eliminar tu cuenta?</p>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setDeleteModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
                <button className="border border-red-600 text-red-600 px-4 py-2 rounded">Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}