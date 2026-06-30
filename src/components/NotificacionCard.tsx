import { useNavigate } from "react-router-dom";

export default function NotificacionCard({ n }: any) {

  const navigate = useNavigate();

  const irDetalle = () => {
    if (n.ruta) {
      navigate(n.ruta);
    }
  };

  const getColor = () => {
    switch (n.tipo) {
      case "COTIZACION":
        return "border-yellow-300";
      case "PERSONALIZACION":
        return "border-pink-300";
      case "PEDIDO":
        return "border-green-300";
      case "COMERCIANTE":
        return "border-blue-300";
      default:
        return "border-gray-200";
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${getColor()}`}>

      {/* MENSAJE */}
      <p className="font-semibold text-gray-800">
        {n.mensaje}
      </p>

      {/* INFO */}
      <div className="text-xs text-gray-500 mt-1 space-y-1">

        <p>Tipo: {n.tipo}</p>

        {n.actorId && (
          <p>Actor: {n.actorId}</p>
        )}

        {n.estadoReferencia && (
          <p>Estado: {n.estadoReferencia}</p>
        )}

        <p>
          {new Date(n.fechaCreacion).toLocaleString()}
        </p>

      </div>

      {/* BOTÓN VER DETALLE (CLAVE) */}
      {(n.tipo === "COTIZACION" ||
        n.tipo === "PERSONALIZACION" ||
        n.tipo === "PEDIDO") && (

        <button
          onClick={irDetalle}
          className="mt-3 text-blue-600 text-sm font-medium"
        >
          Ver detalle →
        </button>
      )}

    </div>
  );
}