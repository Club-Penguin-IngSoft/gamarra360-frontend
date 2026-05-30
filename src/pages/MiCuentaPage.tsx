import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import MaterialIcon from '../components/MaterialIcon';
import { useAuth } from '../hooks/useAuth';
import {
  obtenerCliente,
  actualizarDireccionCliente,
} from '../services/clienteService';
import type { IClientePerfil } from '../services/clienteService';
import { listarPedidosCliente, cancelarPedido } from '../services/pedidoService';
import type { IPedido, EstadoPedido } from '../types/IPedido';
import { RUTAS } from '../constants/rutas';
import { formatearPrecio } from '../utils/formatearPrecio';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type SeccionCuenta =
  | 'informacion'
  | 'pedidos'
  | 'personalizaciones'
  | 'cotizaciones'
  | 'configuracion';

type FiltroPedido = 'todas' | 'en_progreso' | 'finalizados';

// ─── Constantes ──────────────────────────────────────────────────────────────

const PREF_CORREO_KEY = 'gamarra_pref_correo';
const PREF_PUSH_KEY = 'gamarra_pref_push';

const ESTADOS_EN_PROGRESO: EstadoPedido[] = [
  'PENDIENTE',
  'CONFIRMADO',
  'PENDIENTE_PAGO',
  'PAGADO',
  'EN_PROCESO',
  'LISTO_ENTREGA',
  'ENVIADO',
  'RECIBIDO',
];

const ESTADOS_FINALIZADOS: EstadoPedido[] = ['ENTREGADO', 'CANCELADO', 'RECHAZADO'];

const ESTADOS_CANCELABLES: EstadoPedido[] = ['PENDIENTE', 'CONFIRMADO', 'RECIBIDO'];

const ESTADOS_REPETIBLES: EstadoPedido[] = ['ENTREGADO', 'CANCELADO', 'RECHAZADO'];

const SECCIONES_NAV: { id: SeccionCuenta; label: string; icon: string }[] = [
  { id: 'informacion', label: 'Información Personal', icon: 'person' },
  { id: 'pedidos', label: 'Mis Pedidos', icon: 'shopping_bag' },
  { id: 'personalizaciones', label: 'Mis Personalizaciones', icon: 'auto_awesome' },
  { id: 'cotizaciones', label: 'Mis Cotizaciones', icon: 'description' },
  { id: 'configuracion', label: 'Configuración', icon: 'settings' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatearFecha(fechaISO: string): string {
  return new Date(fechaISO).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function agruparPorFecha(pedidos: IPedido[]): { fecha: string; items: IPedido[] }[] {
  const mapa: Record<string, IPedido[]> = {};
  for (const p of pedidos) {
    const clave = formatearFecha(p.fechaCreacion);
    if (!mapa[clave]) mapa[clave] = [];
    mapa[clave].push(p);
  }
  return Object.entries(mapa).map(([fecha, items]) => ({ fecha, items }));
}

function etiquetaEstado(estado: EstadoPedido): {
  texto: string;
  clases: string;
  dotColor: string;
} {
  switch (estado) {
    case 'PENDIENTE':
      return {
        texto: 'Pendiente de confirmación',
        clases: 'bg-yellow-50 text-yellow-700',
        dotColor: 'bg-yellow-400',
      };
    case 'CONFIRMADO':
      return {
        texto: 'Confirmado',
        clases: 'bg-blue-50 text-blue-700',
        dotColor: 'bg-blue-400',
      };
    case 'PENDIENTE_PAGO':
      return {
        texto: 'Pendiente de pago',
        clases: 'bg-amber-50 text-amber-700',
        dotColor: 'bg-amber-400',
      };
    case 'PAGADO':
      return {
        texto: 'Pagado',
        clases: 'bg-green-50 text-green-700',
        dotColor: 'bg-green-400',
      };
    case 'EN_PROCESO':
      return {
        texto: 'En preparación',
        clases: 'bg-orange-50 text-orange-700',
        dotColor: 'bg-orange-400',
      };
    case 'LISTO_ENTREGA':
      return {
        texto: 'Listo para entrega',
        clases: 'bg-teal-600 text-white',
        dotColor: 'bg-teal-200',
      };
    case 'ENVIADO':
      return {
        texto: 'En camino',
        clases: 'bg-teal-50 text-teal-700',
        dotColor: 'bg-teal-400',
      };
    case 'RECIBIDO':
      return {
        texto: 'Recibido',
        clases: 'bg-gray-100 text-gray-600',
        dotColor: 'bg-gray-400',
      };
    case 'ENTREGADO':
      return {
        texto: 'Entregado',
        clases: 'bg-green-600 text-white',
        dotColor: 'bg-green-200',
      };
    case 'CANCELADO':
      return {
        texto: 'Cancelado',
        clases: 'bg-red-50 text-red-600',
        dotColor: 'bg-red-400',
      };
    case 'RECHAZADO':
      return {
        texto: 'Rechazado',
        clases: 'bg-rose-50 text-rose-700',
        dotColor: 'bg-rose-400',
      };
  }
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function Toggle({ activo, onChange }: { activo: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={activo}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        activo ? 'bg-brand-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          activo ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function TarjetaPedido({
  pedido,
  onCancelar,
  onRepetir,
  cancelando,
}: {
  pedido: IPedido;
  onCancelar: (id: string) => void;
  onRepetir: (id: string) => void;
  cancelando: string | null;
}) {
  const etiqueta = etiquetaEstado(pedido.estado);
  const esCancelable = ESTADOS_CANCELABLES.includes(pedido.estado);
  const esRepetible = ESTADOS_REPETIBLES.includes(pedido.estado);
  const imagenes = pedido.detalles
    .map((d) => d.imagenUrl)
    .filter(Boolean) as string[];
  const iconoEntrega =
    pedido.tipoEntrega === 'RECOJO_TIENDA' ? 'store' : 'local_shipping';
  const textoEntrega =
    pedido.tipoEntrega === 'RECOJO_TIENDA' ? 'Recojo en tienda' : 'Envío a domicilio';

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      {/* Cabecera */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-gray-100 px-3 py-1 text-[13px] font-semibold text-ink-800">
          N° {pedido.numeroPedido ?? pedido.id}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium ${etiqueta.clases}`}
        >
          <span className={`h-2 w-2 rounded-full ${etiqueta.dotColor}`} />
          {etiqueta.texto}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Imágenes */}
        {imagenes.length > 0 && (
          <div className="flex gap-2">
            {imagenes.slice(0, 3).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-20 w-20 rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="flex flex-1 flex-col gap-3">
          {pedido.nombreComercio && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
                Tienda
              </p>
              <p className="text-[14px] text-ink-800">{pedido.nombreComercio}</p>
            </div>
          )}
          {pedido.tipoEntrega && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
                Tipo de entrega
              </p>
              <p className="flex items-center gap-1 text-[14px] text-ink-800">
                <MaterialIcon name={iconoEntrega} style={{ fontSize: '16px' }} />
                {textoEntrega}
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2">
          <button className="rounded-xl bg-brand-500 px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600">
            Ver detalle
          </button>
          {esCancelable && (
            <button
              onClick={() => onCancelar(pedido.id)}
              disabled={cancelando === pedido.id}
              className="rounded-xl border border-brand-500 px-5 py-2 text-[14px] font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50"
            >
              {cancelando === pedido.id ? 'Cancelando…' : 'Cancelar pedido'}
            </button>
          )}
          {esRepetible && (
            <button
              onClick={() => onRepetir(pedido.id)}
              className="rounded-xl border border-brand-500 px-5 py-2 text-[14px] font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              Repetir pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function GrupoPedidos({
  grupos,
  onCancelar,
  onRepetir,
  cancelando,
}: {
  grupos: { fecha: string; items: IPedido[] }[];
  onCancelar: (id: string) => void;
  onRepetir: (id: string) => void;
  cancelando: string | null;
}) {
  if (grupos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-16 text-center shadow-sm">
        <span className="material-icons-round text-5xl text-gray-300">
          shopping_bag
        </span>
        <p className="text-[15px] font-semibold text-ink-700">No hay pedidos aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grupos.map((grupo) => (
        <div key={grupo.fecha} className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-[15px] font-semibold text-ink-800">
              {grupo.fecha}
            </span>
            <span className="text-[15px] font-bold text-brand-600">
              {formatearPrecio(grupo.items.reduce((s, p) => s + p.total, 0))}
            </span>
          </div>
          <div className="space-y-3">
            {grupo.items.map((pedido) => (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
                onCancelar={onCancelar}
                onRepetir={onRepetir}
                cancelando={cancelando}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SeccionProximamente({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20 text-center shadow-sm">
      <span className="material-icons-round text-5xl text-brand-300">
        hourglass_empty
      </span>
      <h2 className="text-xl font-semibold text-ink-800">{titulo}</h2>
      <p className="max-w-xs text-[14px] text-ink-500">
        Esta sección estará disponible próximamente.
      </p>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MiCuentaPage() {
  const { usuario, estaAutenticado, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState<SeccionCuenta>('informacion');
  const [filtro, setFiltro] = useState<FiltroPedido>('todas');

  const [perfil, setPerfil] = useState<IClientePerfil | null>(null);
  const [pedidos, setPedidos] = useState<IPedido[]>([]);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [cancelando, setCancelando] = useState<string | null>(null);

  const [editandoDireccion, setEditandoDireccion] = useState(false);
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);

  const [alertaCorreo, setAlertaCorreo] = useState(
    () => localStorage.getItem(PREF_CORREO_KEY) !== 'false',
  );
  const [alertaPush, setAlertaPush] = useState(
    () => localStorage.getItem(PREF_PUSH_KEY) === 'true',
  );

  useEffect(() => {
    if (!estaAutenticado) navigate(RUTAS.LOGIN);
  }, [estaAutenticado, navigate]);

  useEffect(() => {
    if (!usuario) return;

    setCargandoPerfil(true);
    obtenerCliente(usuario.id)
      .then((data) => {
        setPerfil(data);
        setNuevaDireccion(data.direccion ?? '');
      })
      .catch(() => {})
      .finally(() => setCargandoPerfil(false));

    setCargandoPedidos(true);
    listarPedidosCliente(usuario.id)
      .then(setPedidos)
      .catch(() => {})
      .finally(() => setCargandoPedidos(false));
  }, [usuario]);

  function handleCerrarSesion() {
    cerrarSesion();
    navigate(RUTAS.INICIO);
  }

  async function handleGuardarDireccion() {
    if (!usuario) return;
    setGuardandoDireccion(true);
    try {
      await actualizarDireccionCliente(usuario.id, nuevaDireccion);
      setPerfil((prev) => (prev ? { ...prev, direccion: nuevaDireccion } : prev));
      setEditandoDireccion(false);
    } catch {
      /* el interceptor de Axios muestra el error */
    } finally {
      setGuardandoDireccion(false);
    }
  }

  async function handleCancelarPedido(pedidoId: string) {
    setCancelando(pedidoId);
    try {
      await cancelarPedido(pedidoId);
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId ? { ...p, estado: 'CANCELADO' as EstadoPedido } : p,
        ),
      );
    } catch {
      /* silencioso */
    } finally {
      setCancelando(null);
    }
  }

  function handleRepetirPedido(_pedidoId: string) {
    navigate(RUTAS.CATALOGO);
  }

  if (!usuario) return null;

  // Pedidos filtrados para la sección "Mis Pedidos"
  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === 'en_progreso') return ESTADOS_EN_PROGRESO.includes(p.estado);
    if (filtro === 'finalizados') return ESTADOS_FINALIZADOS.includes(p.estado);
    return true;
  });

  const gruposFiltrados = agruparPorFecha(pedidosFiltrados);
  const pedidosRecientes = pedidos.slice(0, 2);
  const gruposRecientes = agruparPorFecha(pedidosRecientes);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar active="Inicio" />

      <main className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
        <h1 className="mb-6 text-[28px] font-bold text-ink-900">Mi Cuenta</h1>

        <div className="flex items-start gap-6">
          {/* ── Sidebar ── */}
          <aside className="w-56 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {SECCIONES_NAV.map((item) => {
                const activa = seccion === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSeccion(item.id)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium transition-colors ${
                      activa
                        ? 'bg-brand-500 text-white'
                        : 'text-ink-700 hover:bg-gray-100'
                    }`}
                  >
                    <MaterialIcon
                      name={item.icon}
                      style={{
                        fontSize: '20px',
                        color: activa ? 'white' : '#6b7280',
                      }}
                    />
                    {item.label}
                  </button>
                );
              })}

              <button
                onClick={handleCerrarSesion}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <MaterialIcon
                  name="logout"
                  style={{ fontSize: '20px', color: '#ef4444' }}
                />
                Cerrar sesión
              </button>
            </nav>
          </aside>

          {/* ── Contenido ── */}
          <div className="min-w-0 flex-1 space-y-4">

            {/* ══ Información Personal ══ */}
            {seccion === 'informacion' && (
              <>
                <h2 className="text-[22px] font-bold text-ink-900">
                  Información Personal
                </h2>

                {/* Tarjeta perfil */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  {cargandoPerfil ? (
                    <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[18px] font-semibold text-ink-900">
                          {perfil
                            ? `${perfil.nombre} ${perfil.apellido}`
                            : usuario.nombre}
                        </p>
                        <p className="text-[14px] text-ink-500">{usuario.correo}</p>
                        <span className="inline-block rounded bg-gray-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                          Comprador
                        </span>
                      </div>
                      <button className="rounded-xl bg-brand-500 px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600">
                        Editar perfil
                      </button>
                    </div>
                  )}
                </div>

                {/* Dirección */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MaterialIcon
                        name="location_on"
                        style={{ fontSize: '20px', color: '#e91e63' }}
                      />
                      <h3 className="text-[16px] font-semibold text-ink-900">
                        Dirección de entrega
                      </h3>
                    </div>
                    {!editandoDireccion && (
                      <button
                        onClick={() => setEditandoDireccion(true)}
                        className="text-[14px] font-medium text-brand-500 hover:underline"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>

                  {editandoDireccion ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={nuevaDireccion}
                        onChange={(e) => setNuevaDireccion(e.target.value)}
                        placeholder="Ingresa tu dirección completa"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-ink-900 focus:border-brand-400 focus:outline-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleGuardarDireccion}
                          disabled={guardandoDireccion}
                          className="rounded-xl bg-brand-500 px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                        >
                          {guardandoDireccion ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => {
                            setEditandoDireccion(false);
                            setNuevaDireccion(perfil?.direccion ?? '');
                          }}
                          className="rounded-xl border border-gray-200 px-5 py-2 text-[14px] font-medium text-ink-700 transition-colors hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[14px] text-ink-800">
                      {perfil?.direccion ?? (
                        <span className="text-ink-400">
                          No hay dirección registrada
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Pedidos recientes */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[16px] font-semibold text-ink-900">
                      Mis Pedidos Recientes
                    </h3>
                    <button
                      onClick={() => setSeccion('pedidos')}
                      className="flex items-center gap-1 text-[14px] font-medium text-brand-500 hover:underline"
                    >
                      Ver todos
                      <MaterialIcon name="arrow_forward" style={{ fontSize: '16px' }} />
                    </button>
                  </div>

                  {cargandoPedidos ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-24 animate-pulse rounded-xl bg-gray-100"
                        />
                      ))}
                    </div>
                  ) : pedidosRecientes.length === 0 ? (
                    <p className="py-6 text-center text-[14px] text-ink-400">
                      No tienes pedidos recientes.
                    </p>
                  ) : (
                    gruposRecientes.map((grupo) => (
                      <div key={grupo.fecha} className="mb-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[14px] font-medium text-ink-700">
                            {grupo.fecha}
                          </span>
                          <span className="text-[14px] font-semibold text-brand-600">
                            {formatearPrecio(
                              grupo.items.reduce((s, p) => s + p.total, 0),
                            )}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {grupo.items.map((pedido) => (
                            <TarjetaPedido
                              key={pedido.id}
                              pedido={pedido}
                              onCancelar={handleCancelarPedido}
                              onRepetir={handleRepetirPedido}
                              cancelando={cancelando}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Notificaciones */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-[16px] font-semibold text-ink-900">
                    Preferencias de Notificación
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MaterialIcon
                          name="mail"
                          style={{ fontSize: '20px', color: '#e91e63' }}
                        />
                        <div>
                          <p className="text-[14px] font-semibold text-ink-900">
                            Alertas por Correo
                          </p>
                          <p className="text-[12px] text-ink-500">
                            Ofertas, cotizaciones, personalizaciones y estados de pedido.
                          </p>
                        </div>
                      </div>
                      <Toggle
                        activo={alertaCorreo}
                        onChange={() => {
                          const nuevo = !alertaCorreo;
                          setAlertaCorreo(nuevo);
                          localStorage.setItem(PREF_CORREO_KEY, String(nuevo));
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MaterialIcon
                          name="notifications"
                          style={{ fontSize: '20px', color: '#6b7280' }}
                        />
                        <div>
                          <p className="text-[14px] font-semibold text-ink-900">
                            Notificaciones Push
                          </p>
                          <p className="text-[12px] text-ink-500">
                            Alertas inmediatas en tu navegador.
                          </p>
                        </div>
                      </div>
                      <Toggle
                        activo={alertaPush}
                        onChange={() => {
                          const nuevo = !alertaPush;
                          setAlertaPush(nuevo);
                          localStorage.setItem(PREF_PUSH_KEY, String(nuevo));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══ Mis Pedidos ══ */}
            {seccion === 'pedidos' && (
              <>
                <h2 className="text-[22px] font-bold text-ink-900">Mis Pedidos</h2>

                {/* Filtros */}
                <div className="flex gap-2">
                  {(
                    [
                      { key: 'todas', label: 'Todas' },
                      { key: 'en_progreso', label: 'En Progreso' },
                      { key: 'finalizados', label: 'Finalizados' },
                    ] as { key: FiltroPedido; label: string }[]
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFiltro(key)}
                      className={`rounded-full px-5 py-2 text-[14px] font-semibold transition-colors ${
                        filtro === key
                          ? 'bg-brand-600 text-white'
                          : 'border border-gray-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Lista de pedidos */}
                {cargandoPedidos ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
                      />
                    ))}
                  </div>
                ) : (
                  <GrupoPedidos
                    grupos={gruposFiltrados}
                    onCancelar={handleCancelarPedido}
                    onRepetir={handleRepetirPedido}
                    cancelando={cancelando}
                  />
                )}
              </>
            )}

            {/* ══ Próximamente ══ */}
            {seccion === 'personalizaciones' && (
              <>
                <h2 className="text-[22px] font-bold text-ink-900">
                  Mis Personalizaciones
                </h2>
                <SeccionProximamente titulo="Mis Personalizaciones" />
              </>
            )}

            {seccion === 'cotizaciones' && (
              <>
                <h2 className="text-[22px] font-bold text-ink-900">
                  Mis Cotizaciones
                </h2>
                <SeccionProximamente titulo="Mis Cotizaciones" />
              </>
            )}

            {seccion === 'configuracion' && (
              <>
                <h2 className="text-[22px] font-bold text-ink-900">Configuración</h2>
                <SeccionProximamente titulo="Configuración de cuenta" />
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
