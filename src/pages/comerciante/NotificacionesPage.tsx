import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComercianteSidebar from "../../components/ComercianteSidebar";
import { useAuth } from "../../hooks";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import { marcarComoLeida, getUsuarioById } from "../../services/notificacionService";
import { Bell } from "lucide-react";

export default function NotificacionesPage() {

  const { usuario } = useAuth();
  const navigate = useNavigate();

  const userId = usuario?.id ? Number(usuario.id) : null;

  const {
    notificaciones,
    setNotificaciones,
    loading
  } = useNotificaciones(userId || 0);

  const [grouped, setGrouped] = useState<any>({});
  const [usuariosCache, setUsuariosCache] = useState<Record<number, string>>({});

  // =========================
  // RESOLVER USUARIO (API REAL)
  // =========================
  const getUsuario = async (id: number) => {

    if (usuariosCache[id]) return usuariosCache[id];

    try {
      const u = await getUsuarioById(id);

      const nombre = `${u.nombres ?? ""} ${u.primerApellido ?? ""}`.trim();

      setUsuariosCache(prev => ({
        ...prev,
        [id]: nombre
      }));

      return nombre;

    } catch {
      return `Usuario #${id}`;
    }
  };

  // =========================
  // AGRUPAR POR FECHA
  // =========================
  useEffect(() => {

    const hoy = new Date().toDateString();

    const agrupado = notificaciones.reduce((acc: any, n: any) => {

      const fecha = new Date(n.fechaCreacion).toDateString();
      const key = fecha === hoy ? "Hoy" : "Anteriores";

      if (!acc[key]) acc[key] = [];

      acc[key].push(n);

      return acc;
    }, {});

    setGrouped(agrupado);

  }, [notificaciones]);

  // =========================
  // CARGAR NOMBRES (CACHE + API)
  // =========================
  useEffect(() => {

    const cargarUsuarios = async () => {

      const cache = { ...usuariosCache };

      for (const n of notificaciones) {

        if (!n.actorId) continue;

        if (!cache[n.actorId]) {
          const nombre = await getUsuario(n.actorId);
          cache[n.actorId] = nombre;
        }
      }

      setUsuariosCache(cache);
    };

    if (notificaciones.length > 0) {
      cargarUsuarios();
    }

  }, [notificaciones]);

  // =========================
  // MARCAR COMO LEÍDA
  // =========================
  const marcar = async (id: number) => {

    await marcarComoLeida(id);

    setNotificaciones(prev =>
      prev.filter(n => n.idNotificacion !== id)
    );
  };

  // =========================
  // VER DETALLE
  // =========================
  const irDetalle = (n: any) => {

    if (n.referenciaTipo === "COTIZACION") {
      navigate(`/comerciante/cotizaciones/${n.referenciaId}`);
    }

    if (n.referenciaTipo === "PERSONALIZACION") {
      navigate(`/comerciante/personalizaciones/${n.referenciaId}`);
    }
  };

  // =========================
  // UI
  // =========================
  return (
  <div className="flex min-h-screen bg-[#F3F4F6] font-sans">

    <ComercianteSidebar />

    <main className="min-w-0 flex-1 px-4 pb-5 pt-16 sm:px-6 sm:pb-8 lg:p-8">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
        <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-[22px]">
          Notificaciones
        </h1>

        <p className="text-[13px] text-gray-500">
          Centro de alertas y actividad de tu cuenta
        </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/comerciante')}
          className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 lg:hidden"
        >
          Volver al panel
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-10 text-center text-sm text-gray-400 shadow-sm">
          Cargando notificaciones...
        </div>
      )}

      {!loading && notificaciones.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-[#C83B6B]">
            <Bell className="h-7 w-7" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Todo está al día</h2>
          <p className="mt-1 text-sm text-gray-500">No tienes notificaciones pendientes por revisar.</p>
        </div>
      )}

      {/* LISTA */}
      <div className="space-y-6">

        {Object.entries(grouped).map(([section, items]: any) => (

          <div key={section}>

            {/* SECTION TITLE */}
            <h2 className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
              {section}
            </h2>

            <div className="space-y-4">

              {items.map((n: any) => (

                <div
                  key={n.idNotificacion}
                  className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#C83B6B] hover:-translate-y-0.5 hover:border-pink-100 hover:shadow-md sm:p-6 md:flex-row md:items-center md:justify-between"
                >

                  {/* LEFT CONTENT */}
                  <div className="min-w-0 flex-1 pl-1">

                    {/* TITULO + ESTADO (MISMA LINEA) */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                      <p className="min-w-0 break-words text-[16px] font-bold leading-6 text-gray-900">
                        {n.mensaje}
                      </p>

                      {/* ESTADO AL COSTADO DEL TITULO */}
                      {n.estadoReferencia && (
                        <span className="rounded-full bg-pink-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#C83B6B] ring-1 ring-pink-100">
                          {n.estadoReferencia}
                        </span>
                      )}

                    </div>

                    {/* TIPO */}
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Tipo: {n.tipo}
                    </p>

                    {/* ACTOR */}
                    <p className="mt-4 text-[12px] text-gray-500">
                      Hecho por:{" "}
                      <span className="font-semibold text-[#C83B6B]">
                        {usuariosCache[n.actorId] || `Usuario #${n.actorId}`}
                      </span>
                    </p>

                    {/* ORDEN */}
                    {n.referenciaId && (
                      <p className="mt-1 text-[12px] text-gray-500">
                        Orden :{" "}
                        <span className="font-semibold text-gray-800">
                          {n.referenciaId}
                        </span>
                      </p>
                    )}

                    {/* FECHA */}
                    <p className="mt-3 text-[11px] text-gray-400">
                      {new Date(n.fechaCreacion).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>

                  </div>

                  {/* ACTIONS */}
<div className="flex w-full flex-col gap-2 sm:flex-row md:w-40 md:flex-col md:items-end">

  {/* VER DETALLE */}
  <button
    onClick={() => irDetalle(n)}
    className="w-full rounded-lg bg-[#C83B6B] px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#b5325f]"
  >
    Ver detalle
  </button>

  {/* MARCAR LEÍDO */}
  <button
    onClick={() => marcar(n.idNotificacion)}
    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-gray-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-[#C83B6B]"
  >
    Marcar leído
  </button>

</div>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </main>
  </div>
);
}
