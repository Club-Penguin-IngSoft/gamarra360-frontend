import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

export default function AdminNotificacionesPage() {

  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [comerciantes, setComerciantes] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =========================
  // CARGAR NOTIFICACIONES
  // =========================
  useEffect(() => {

    const load = async () => {

      try {
        setLoading(true);

        const res = await apiClient.get("/notificaciones");

        const data = Array.isArray(res.data) ? res.data : [];

        // 🔥 SOLO NO LEÍDAS + COMERCIANTE
        const filtradas = data.filter(
          (n: any) =>
            n.tipo === "COMERCIANTE" &&
            n.fueleida === false
        );

        setNotificaciones(filtradas);

      } catch (err) {
        console.error(err);
        setNotificaciones([]);
      } finally {
        setLoading(false);
      }
    };

    load();

  }, []);

  // =========================
  // GET COMERCIANTE
  // =========================
  const getComerciante = async (id: number) => {
    const res = await apiClient.get(`/comerciantes/${id}`);
    return res.data;
  };

  // =========================
  // CACHE COMERCIANTES
  // =========================
  useEffect(() => {

    const load = async () => {

      const nuevos: any = {};

      for (const n of notificaciones) {

        if (n.actorId && !comerciantes[n.actorId]) {
          try {
            const data = await getComerciante(n.actorId);
            nuevos[n.actorId] = data;
          } catch (err) {
            console.error(err);
          }
        }
      }

      if (Object.keys(nuevos).length > 0) {
        setComerciantes((prev: any) => ({
          ...prev,
          ...nuevos
        }));
      }
    };

    if (notificaciones.length > 0) load();

  }, [notificaciones]);

  // =========================
  // MARCAR LEÍDO (DESAPARECE)
  // =========================
  const marcarLeida = async (id: number) => {

    try {

      await apiClient.put(`/notificaciones/leida/${id}`);

      setNotificaciones(prev =>
        prev.filter(n =>
          Number(n.idNotificacion) !== Number(id)
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // MARCAR TODAS
  // =========================
  const marcarTodas = async () => {

    try {

      await Promise.all(
        notificaciones.map(n =>
          apiClient.put(`/notificaciones/leida/${n.idNotificacion}`)
        )
      );

      setNotificaciones([]);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // IR A APROBACIÓN
  // =========================
  const verDetalle = () => {
    navigate("/admin/aprobacion-comerciantes");
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex min-h-screen bg-neutro-50 font-sans">

      <AdminSidebar />

      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="mb-8 flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-black">
              Notificaciones
            </h1>
            <p className="text-neutro-600">
              Validación de comerciantes
            </p>
          </div>

          {notificaciones.length > 0 && (
            <button
              onClick={marcarTodas}
              className="bg-primario text-white px-4 py-2 rounded-lg text-sm"
            >
              Marcar todas como leídas
            </button>
          )}

        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-tarjeta p-10 shadow-tarjeta">

          {/* EMPTY */}
          {!loading && notificaciones.length === 0 && (
            <div className="flex flex-col items-center text-center">
              <Bell className="w-10 h-10 text-primario mb-3" />
              <h2 className="text-xl font-bold">
                Sin notificaciones
              </h2>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <p>Cargando...</p>
          )}

          {/* LIST */}
          <div className="space-y-4">

            {notificaciones.map(n => {

              const c = comerciantes[n.actorId];

              return (
                <div
                  key={n.idNotificacion}
                  onClick={verDetalle}
                  className="p-4 border rounded-lg flex justify-between items-center cursor-pointer hover:shadow-md transition"
                >

                  {/* LEFT */}
                  <div className="flex items-center gap-3">

                    {/* LOGO */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">

                      {c?.logoUrl ? (
                        <img
                          src={c.logoUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-600">
                          {c?.nombres?.[0] || "C"}
                        </span>
                      )}

                    </div>

                    {/* INFO */}
                    <div>

                      {/* BADGE */}
                      <span className="text-[10px] px-2 py-1 rounded bg-blue-100 text-blue-600 font-semibold">
                        COMERCIANTE
                      </span>

                      {/* TITULO */}
                      <p className="font-bold text-neutro-900 mt-1">
                        Nuevo comerciante registrado
                      </p>

                      {/* NOMBRE */}
                      <p className="text-xs text-neutro-500">
                        {c
                          ? `${c.nombres} ${c.primerApellido}`
                          : `Comerciante #${n.actorId}`}
                      </p>

                      {/* EMPRESA */}
                      <p className="text-xs text-neutro-500">
                        Empresa: {c?.razonSocial || "Cargando..."}
                      </p>

                      {/* MENSAJE (AL FINAL COMO PEDISTE) */}
                      <p className="text-[11px] text-gray-400 mt-2">
                        Mensaje: {n.mensaje}
                      </p>

                      {/* FECHA */}
                      <p className="text-[11px] text-gray-400">
                        {n.fechaCreacion
                          ? new Date(n.fechaCreacion).toLocaleString()
                          : ""}
                      </p>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex gap-3">

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        marcarLeida(n.idNotificacion);
                      }}
                      className="text-xs text-primario font-medium"
                    >
                      Marcar leído
                    </button>

                    <span className="text-xs text-gray-400">
                      Ver aprobación →
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </main>
    </div>
  );
}