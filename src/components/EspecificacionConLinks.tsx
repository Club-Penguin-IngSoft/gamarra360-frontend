import { Image as ImageIcon, ExternalLink } from 'lucide-react';

interface Props {
  texto: string;
  className?: string;
}

const URL_RE = /(https?:\/\/[^\s]+)/;

/**
 * Renderiza el texto de especificación de una cotización respetando saltos de
 * línea, pero convirtiendo cualquier URL en un enlace compacto ("Ver imagen" /
 * "Ver enlace") en lugar de mostrar la URL cruda (que se ve mal y se desborda).
 */
export default function EspecificacionConLinks({ texto, className = '' }: Props) {
  const lineas = texto.split('\n');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {lineas.map((linea, i) => {
        const m = linea.match(URL_RE);

        if (!m) {
          if (linea.trim() === '') return <span key={i} className="h-1" />;
          return (
            <p key={i} className="whitespace-pre-wrap break-words text-sm text-ink-700">
              {linea}
            </p>
          );
        }

        const url = m[1];
        const etiqueta = linea.slice(0, m.index).replace(/[\s:–-]+$/, '').trim();
        const esImagen =
          /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(url) || /imagen|dise/i.test(etiqueta);

        return (
          <div key={i} className="flex flex-wrap items-center gap-2">
            {etiqueta && <span className="text-sm text-ink-700">{etiqueta}:</span>}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100"
            >
              {esImagen ? <ImageIcon className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
              {esImagen ? 'Ver imagen' : 'Ver enlace'}
            </a>
          </div>
        );
      })}
    </div>
  );
}
