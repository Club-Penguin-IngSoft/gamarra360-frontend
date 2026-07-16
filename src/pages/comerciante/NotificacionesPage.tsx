import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComercianteSidebar from "../../components/ComercianteSidebar";
import { useAuth } from "../../hooks";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import { marcarComoLeida, getUsuarioById } from "../../services/notificacionService";

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

    <div className="flex-1 p-8">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">
          Notificaciones
        </h1>

        <p className="text-[13px] text-gray-500">
          Centro de alertas y actividad de tu cuenta
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-400">Cargando notificaciones...</p>
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
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex justify-between items-center hover:shadow-md transition"
                >

                  {/* LEFT CONTENT */}
                  <div className="flex-1">

                    {/* TITULO + ESTADO (MISMA LINEA) */}
                    <div className="flex items-center gap-3">

                      <p className="text-[15px] font-semibold text-gray-900">
                        {n.mensaje}
                      </p>

                      {/* ESTADO AL COSTADO DEL TITULO */}
                      {n.estadoReferencia && (
                        <span className="px-3 py-1 text-[11px] rounded-full bg-pink-50 text-[#C83B6B] font-semibold">
                          {n.estadoReferencia}
                        </span>
                      )}

                    </div>

                    {/* TIPO */}
                    <p className="text-[12px] text-gray-500 mt-2">
                      Tipo: {n.tipo}
                    </p>

                    {/* ACTOR */}
                    <p className="text-[12px] mt-2">
                      Hecho por:{" "}
                      <span className="font-semibold text-[#C83B6B]">
                        {usuariosCache[n.actorId] || `Usuario #${n.actorId}`}
                      </span>
                    </p>

                    {/* ORDEN */}
                    {n.referenciaId && (
                      <p className="text-[12px] text-purple-300 mt-1">
                        Orden :{" "}
                        <span className="font-semibold text-gray-800">
                          {n.referenciaId}
                        </span>
                      </p>
                    )}

                    {/* FECHA */}
                    <p className="text-[11px] text-gray-400 mt-2">
                      {new Date(n.fechaCreacion).toLocaleString()}
                    </p>

                  </div>

                  {/* ACTIONS */}
<div className="flex flex-col gap-2 items-end w-[130px]">

  {/* VER DETALLE */}
  <button
    onClick={() => irDetalle(n)}
    className="w-full px-4 py-2 rounded-lg bg-[#C83B6B] text-white text-[12px] font-semibold hover:bg-[#b5325f] transition"
  >
    Ver detalle
  </button>

  {/* MARCAR LEÍDO */}
  <button
    onClick={() => marcar(n.idNotificacion)}
    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-500 text-[12px] font-semibold hover:bg-gray-100 transition"
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

    </div>
  </div>
);
}