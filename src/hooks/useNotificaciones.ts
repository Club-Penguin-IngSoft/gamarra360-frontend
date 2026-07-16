import { useEffect, useState } from "react";
import { getNotificaciones } from "../services/notificacionService";
import type { Notificacion } from "../services/notificacionService";

export const useNotificaciones = (usuarioId: number) => {

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {

    if (!usuarioId) return;

    setLoading(true);

    try {
      const data = await getNotificaciones(usuarioId);
      setNotificaciones(
        Array.isArray(data)
          ? data.filter((notificacion) => notificacion.fueleida === false)
          : []
      );
    } catch (e) {
      console.error(e);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [usuarioId]);

  return {
    notificaciones,
    setNotificaciones,
    loading,
    recargar: cargar
  };
};
