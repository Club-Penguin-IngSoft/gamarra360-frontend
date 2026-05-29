import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { RUTAS } from '../../constants/rutas';
import {
  listarCategorias,
  listarTiposPorCategoria,
  actualizarProducto,
  eliminarProducto,
  type ICategoriaOpcion,
  type ITipoProductoOpcion,
} from '../../services/catalogoService';
import apiClient from '../../services/apiClient';

const CAT_ABREV: Record<string, string> = {
  Hombre: 'HON', Mujer: 'MUJ', Niños: 'NIN', 'Unisex Adultos': 'UNI',
};

const generarSKUBase = (cat: string, tipo: string, corr: number): string => {
  const catCode = CAT_ABREV[cat] ?? 'GEN';
  const tipoCode = tipo.replace(/\s+y\s+/gi, '').replace(/\s+/g, '').substring(0, 3).toUpperCase() || 'PRD';
  return `${catCode}-${tipoCode}-${String(corr).padStart(3, '0')}-GEN`;
};

const generarSKUVariante = (skuBase: string, talla: string, colorNombre: string): string => {
  const base = skuBase.endsWith('-GEN') ? skuBase.slice(0, -4) : skuBase;
  const tallaCode = talla.replace(/\s+/g, '').toUpperCase().substring(0, 3);
  const colorCode = colorNombre.replace(/\s+/g, '').toUpperCase().substring(0, 3);
  return `${base}-${tallaCode}-${colorCode}`;
};

interface IColor {
  nombre: string;
  hex: string;
}

interface IVarianteEditable {
  id: number;
  talla: string;
  colorNombre: string;
  colorHex: string;
  precioBase: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  imagenes: string[];
}

interface IEspecificacion {
  id: number;
  titulo: string;
  descripcion: string;
}


const MAX_IMG_VISIBLES = 3;

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-[38px] h-[22px] rounded-full border-none cursor-pointer transition-colors flex-shrink-0 ${on ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all ${on ? 'left-[18px]' : 'left-[2px]'}`} />
    </button>
  );
}

function PrecioInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center border border-gray-300 rounded h-[34px] overflow-hidden focus-within:border-primario transition-colors w-[108px]">
      <span className="px-2 text-[12px] text-gray-500 bg-gray-50 border-r border-gray-300 h-full flex items-center select-none">S/</span>
      <input
        type="number"
        min={0}
        step={0.1}
        className="flex-1 px-2 text-[13px] text-gray-900 bg-white focus:outline-none w-0"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function EditarProductoPage() {
  const { id } = useParams<{ id: string }>();
  const [nombreProducto, setNombreProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | ''>('');
  const [idTipoProducto, setIdTipoProducto] = useState<number | ''>('');
  const [categorias, setCategorias] = useState<ICategoriaOpcion[]>([]);
  const [tipos, setTipos] = useState<ITipoProductoOpcion[]>([]);
  const [correlativo] = useState(1);
  const [skuInterno, setSkuInterno] = useState('');
  const [imagenesExistentes, setImagenesExistentes] = useState<{ url: string; esPrincipal: boolean }[]>([]);
  const [imagenUrl, setImagenUrl] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorApi, setErrorApi] = useState('');

  const [precioBase, setPrecioBase] = useState(0);
  const [publicado, setPublicado] = useState(true);

  const [tallas, setTallas] = useState<string[]>([]);
  const [tallaInput, setTallaInput] = useState('');

  const [colores, setColores] = useState<IColor[]>([]);
  const [colorNombreInput, setColorNombreInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#000000');

  const [variantes, setVariantes] = useState<IVarianteEditable[]>([]);

  const [especificaciones, setEspecificaciones] = useState<IEspecificacion[]>([]);
  const [especTitulo, setEspecTitulo] = useState('');
  const [especDescripcion, setEspecDescripcion] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeVarianteId, setActiveVarianteId] = useState<number | null>(null);
  const [modalImagenes, setModalImagenes] = useState<{ varianteId: number } | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(console.error);
  }, []);

  useEffect(() => {
    if (!id) return;
    apiClient.get<any>(`/productos/${id}`).then(({ data }) => {
      setNombreProducto(data.nombre ?? '');
      setDescripcion(data.descripcion ?? '');
      setPrecioBase(data.precioBase ?? 0);
      setPublicado(data.activo ?? true);
      setImagenesExistentes((data.imagenes ?? []).map((i: any) => ({ url: i.url, esPrincipal: i.esPrincipal ?? false })));
      const catId = data.idCategoria ?? '';
      const tipoId = data.idTipoProducto ?? '';
      setIdCategoria(catId);
      setIdTipoProducto(tipoId);
      const variantesApi: IVarianteEditable[] = (data.variantes ?? []).map((v: any, i: number) => ({
        id: v.idVariante,
        talla: v.sku?.split('-')[3] ?? `V${i + 1}`,
        colorNombre: v.sku?.split('-')[4] ?? '',
        colorHex: '#888888',
        precioBase: v.precioAjustado ?? data.precioBase ?? 0,
        stock: v.stock ?? 0,
        stockMinimo: 5,
        activo: v.disponible ?? true,
        imagenes: [],
      }));
      setVariantes(variantesApi);
      if (catId !== '') {
        listarTiposPorCategoria(catId as number).then(setTipos).catch(console.error);
      }
    }).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (idCategoria !== '') {
      listarTiposPorCategoria(idCategoria as number).then(setTipos).catch(console.error);
    } else {
      setTipos([]);
    }
  }, [idCategoria]);

  const totalStock = variantes.reduce((sum, v) => sum + v.stock, 0);

  const errores = {
    nombreProducto: !nombreProducto.trim() ? 'El nombre es obligatorio' : '',
    descripcion: !descripcion.trim() ? 'La descripción es obligatoria' : '',
    categoria: idCategoria === '' ? 'Selecciona una categoría' : '',
    tipoProducto: idTipoProducto === '' ? 'Selecciona un tipo de producto' : '',
    precioBase: precioBase <= 0 ? 'El precio debe ser mayor a 0' : '',
    variantes: variantes.length === 0 ? 'Debe haber al menos una variante' : '',
  };
  const hayErrores = Object.values(errores).some(Boolean);

  const handleCategoriaChange = (val: string) => {
    const newId = val === '' ? '' : Number(val);
    setIdCategoria(newId as number | '');
    setIdTipoProducto('');
    const cat = categorias.find((c) => c.idCategoria === Number(val));
    setSkuInterno(cat ? generarSKUBase(cat.nombre, '', correlativo) : '');
  };

  const handleTipoChange = (val: string) => {
    const newId = val === '' ? '' : Number(val);
    setIdTipoProducto(newId as number | '');
    const cat = categorias.find((c) => c.idCategoria === idCategoria);
    const tipo = tipos.find((t) => t.idTipoProducto === Number(val));
    if (cat && tipo) setSkuInterno(generarSKUBase(cat.nombre, tipo.nombre, correlativo));
  };

  const agregarTalla = () => {
    const val = tallaInput.trim().toUpperCase();
    if (val && !tallas.includes(val)) setTallas((p) => [...p, val]);
    setTallaInput('');
  };
  const eliminarTalla = (t: string) => setTallas((p) => p.filter((x) => x !== t));

  const agregarColor = () => {
    const nombre = colorNombreInput.trim();
    if (nombre && !colores.find((c) => c.nombre === nombre)) {
      setColores((p) => [...p, { nombre, hex: colorHexInput }]);
    }
    setColorNombreInput('');
    setColorHexInput('#000000');
  };
  const eliminarColor = (nombre: string) => setColores((p) => p.filter((c) => c.nombre !== nombre));

  const toggleVariante = (id: number) =>
    setVariantes((p) => p.map((v) => (v.id === id ? { ...v, activo: !v.activo } : v)));

  const updateVariantePrecio = (id: number, precio: number) =>
    setVariantes((p) => p.map((v) => (v.id === id ? { ...v, precioBase: precio } : v)));

  const updateVarianteStock = (id: number, stock: number) =>
    setVariantes((p) => p.map((v) => (v.id === id ? { ...v, stock } : v)));

  const updateVarianteStockMinimo = (id: number, stockMinimo: number) =>
    setVariantes((p) => p.map((v) => (v.id === id ? { ...v, stockMinimo } : v)));

  const handleClickAgregarImagen = (varianteId: number) => {
    setActiveVarianteId(varianteId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || activeVarianteId === null) return;
    const nuevas = Array.from(e.target.files).map((f) => URL.createObjectURL(f));
    setVariantes((p) =>
      p.map((v) => (v.id === activeVarianteId ? { ...v, imagenes: [...v.imagenes, ...nuevas] } : v))
    );
    e.target.value = '';
  };

  const handleEliminarImagen = (varianteId: number, index: number) => {
    setVariantes((p) =>
      p.map((v) => {
        if (v.id !== varianteId) return v;
        const copia = [...v.imagenes];
        URL.revokeObjectURL(copia[index]);
        copia.splice(index, 1);
        return { ...v, imagenes: copia };
      })
    );
  };

  const agregarEspecificacion = () => {
    if (especTitulo.trim() && especDescripcion.trim()) {
      setEspecificaciones((p) => [
        ...p,
        { id: Date.now(), titulo: especTitulo.trim(), descripcion: especDescripcion.trim() },
      ]);
      setEspecTitulo('');
      setEspecDescripcion('');
    }
  };
  const eliminarEspecificacion = (id: number) =>
    setEspecificaciones((p) => p.filter((e) => e.id !== id));

  const handleGuardar = async () => {
    setSubmitted(true);
    if (hayErrores) return;
    if (!id) return;
    setEnviando(true);
    setErrorApi('');
    try {
      await actualizarProducto(id, {
        nombre: nombreProducto,
        descripcion,
        precioBase,
        esPersonalizable: false,
        idCategoria: idCategoria as number,
        idTipoProducto: idTipoProducto as number,
        imagenes: imagenUrl.trim()
          ? [{ url: imagenUrl.trim(), esPrincipal: true }, ...imagenesExistentes.filter((i) => !i.esPrincipal)]
          : imagenesExistentes,
      });
      navigate(RUTAS.COMERCIANTE_CATALOGO);
    } catch (err: any) {
      setErrorApi(err.response?.data?.mensaje ?? 'Error al guardar los cambios');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async () => {
    if (!id || !window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    setEnviando(true);
    try {
      await eliminarProducto(id);
      navigate(RUTAS.COMERCIANTE_CATALOGO);
    } catch (err: any) {
      setErrorApi(err.response?.data?.mensaje ?? 'No se pudo eliminar el producto');
      setEnviando(false);
    }
  };

  const labelClass = 'block text-[11px] font-semibold text-gray-600 uppercase tracking-[0.4px] mb-1.5';
  const tagInputClass = 'h-9 border border-gray-300 rounded-lg px-3 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none transition-colors';

  const fc = (key: keyof typeof errores) =>
    `w-full h-[42px] border rounded-lg px-3.5 text-[13px] text-gray-900 bg-white focus:outline-none transition-colors ${
      submitted && errores[key] ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-primario'
    }`;

  const errMsg = (key: keyof typeof errores) =>
    submitted && errores[key] ? <p className="text-[11px] text-red-500 mt-1">{errores[key]}</p> : null;

  const varianteModal = modalImagenes ? variantes.find((v) => v.id === modalImagenes.varianteId) : null;

  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <main className="ml-64 flex-1 bg-gray-100 p-7">
        <p className="text-[12px] text-gray-500 mb-2">
          <span className="text-primario font-medium cursor-pointer hover:underline" onClick={() => navigate(RUTAS.COMERCIANTE_DASHBOARD)}>Inicio</span>
          {' '}›{' '}
          <span className="text-primario font-medium cursor-pointer hover:underline" onClick={() => navigate(RUTAS.COMERCIANTE_CATALOGO)}>Inventario</span>
        </p>

        <h1 className="text-[22px] font-bold text-gray-900 mb-6">Editar Producto</h1>

        {/* Main grid */}
        <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '1fr 280px', alignItems: 'start' }}>
          {/* Left: product details */}
          <div className="bg-white rounded-xl px-6 py-[22px] shadow-sm">
            <p className="text-[13px] font-bold text-gray-900 mb-[18px] pb-3 border-b border-gray-200">
              Detalles del Producto
            </p>

            <div className="mb-4">
              <label className={labelClass}>
                Nombre del Producto <span className="text-red-500 normal-case font-normal">*</span>
              </label>
              <input
                type="text"
                className={fc('nombreProducto')}
                value={nombreProducto}
                onChange={(e) => setNombreProducto(e.target.value)}
              />
              {errMsg('nombreProducto')}
            </div>

            <div className="mb-4">
              <label className={labelClass}>
                Descripción Editorial <span className="text-red-500 normal-case font-normal">*</span>
              </label>
              <textarea
                className={`w-full min-h-[100px] border rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 bg-white resize-y focus:outline-none transition-colors ${
                  submitted && errores.descripcion ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-primario'
                }`}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
              />
              {errMsg('descripcion')}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelClass}>
                  Categoría <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <select className={fc('categoria')} value={idCategoria} onChange={(e) => handleCategoriaChange(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {categorias.map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
                </select>
                {errMsg('categoria')}
              </div>
              <div>
                <label className={labelClass}>
                  Tipo de Producto <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <select className={fc('tipoProducto')} value={idTipoProducto} onChange={(e) => handleTipoChange(e.target.value)} disabled={idCategoria === ''}>
                  <option value="">{idCategoria !== '' ? 'Seleccionar' : 'Elige categoría primero'}</option>
                  {tipos.map((t) => <option key={t.idTipoProducto} value={t.idTipoProducto}>{t.nombre}</option>)}
                </select>
                {errMsg('tipoProducto')}
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass}>URL de imagen principal</label>
              <input
                type="url"
                className="w-full h-[42px] border border-gray-300 rounded-lg px-3.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none transition-colors"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Opcional. Deja vacío para conservar la imagen actual.
              </p>
            </div>

          </div>

          {/* Right: seller card */}
          <div className="bg-white rounded-xl px-6 py-[22px] shadow-sm">
            <p className="text-[13px] font-bold text-gray-900 mb-[18px] pb-3 border-b border-gray-200">
              Tarjeta del Vendedor
            </p>

            {/* Precio Base editable */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-2">
                Precio Base <span className="text-red-500 normal-case font-normal">*</span>
              </p>
              <div className={`flex items-center border rounded-lg overflow-hidden h-[46px] transition-colors ${
                submitted && errores.precioBase ? 'border-red-400' : 'border-gray-300 focus-within:border-primario'
              }`}>
                <span className="px-3.5 text-[14px] font-semibold text-gray-500 bg-gray-50 border-r border-gray-300 h-full flex items-center select-none">S/</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className="flex-1 px-3 text-[22px] font-bold text-gray-900 bg-white focus:outline-none"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(Number(e.target.value))}
                />
              </div>
              {errMsg('precioBase')}
            </div>

            {/* Total Stock */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px]">Total Stock</p>
              <div className="text-right">
                <p className="text-[18px] font-bold text-gray-900">{totalStock}</p>
                <span className="block text-[11px] text-gray-500">unidades</span>
              </div>
            </div>


            {/* Publicado */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Publicado</p>
                <p className="text-[11px] text-gray-500">Visible en la tienda</p>
              </div>
              <Toggle on={publicado} onClick={() => setPublicado((v) => !v)} />
            </div>

            {errorApi && (
              <p className="text-[11px] text-red-500 mb-2 text-center">{errorApi}</p>
            )}
            <button
              className="w-full h-[42px] bg-primario text-white rounded-lg text-[13px] font-semibold mb-2.5 hover:bg-primario-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGuardar}
              disabled={enviando}
            >
              {enviando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              className="w-full h-[42px] bg-white text-red-600 rounded-lg text-[13px] font-semibold border-[1.5px] border-red-500 hover:bg-[#FEE2E2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleEliminar}
              disabled={enviando}
            >
              Eliminar Producto
            </button>
          </div>
        </div>

        {/* Variantes */}
        <div className="bg-white rounded-xl px-6 py-[22px] shadow-sm mb-5">
          <p className="text-[14px] font-bold text-gray-900 mb-5">Gestión de Variantes</p>

          <div className="grid grid-cols-2 gap-5 mb-5">
            {/* Tallas */}
            <div>
              <label className={labelClass}>Tallas</label>
              <div className="flex gap-2 flex-wrap mb-2.5 min-h-[32px]">
                {tallas.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[12px] font-semibold border border-sky-200">
                    {t}
                    <button
                      onClick={() => eliminarTalla(t)}
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-sky-200 transition-colors"
                    >
                      <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={`flex-1 ${tagInputClass}`}
                  placeholder="Ej: XS, S, M, 38, 40..."
                  value={tallaInput}
                  onChange={(e) => setTallaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && agregarTalla()}
                />
                <button onClick={agregarTalla} className="h-9 px-3.5 bg-sky-600 text-white rounded-lg text-[12px] font-semibold hover:bg-sky-700 transition-colors">
                  Agregar
                </button>
              </div>
            </div>

            {/* Colores */}
            <div>
              <label className={labelClass}>Colores</label>
              <div className="flex gap-2 flex-wrap mb-2.5 min-h-[32px]">
                {colores.map((c) => (
                  <span key={c.nombre} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primario-claro text-primario text-[12px] font-semibold">
                    <span className="w-3 h-3 rounded-full border border-white/60 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    {c.nombre}
                    <button
                      onClick={() => eliminarColor(c.nombre)}
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-primario hover:text-white transition-colors"
                    >
                      <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className={`flex-1 ${tagInputClass}`}
                  placeholder="Nombre del color"
                  value={colorNombreInput}
                  onChange={(e) => setColorNombreInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && agregarColor()}
                />
                <input
                  type="color"
                  value={colorHexInput}
                  onChange={(e) => setColorHexInput(e.target.value)}
                  className="h-9 w-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white flex-shrink-0"
                  title={colorHexInput}
                />
                <span className="text-[11px] text-gray-400 font-mono w-[58px] flex-shrink-0">{colorHexInput}</span>
                <button onClick={agregarColor} className="h-9 px-3.5 bg-primario text-white rounded-lg text-[12px] font-semibold hover:bg-primario-hover transition-colors flex-shrink-0">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Variants table */}
          {submitted && errores.variantes && (
            <p className="text-[11px] text-red-500 mb-3">{errores.variantes}</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Variante', 'SKU', 'Precio Base', 'Stock', 'Stock Mín.', 'Imágenes', 'Estado'].map((col, i) => (
                    <th
                      key={col}
                      className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] px-3 py-2 bg-gray-100 border-b border-gray-200 whitespace-nowrap ${
                        i === 0 ? 'rounded-tl' : i === 6 ? 'rounded-tr' : ''
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variantes.map((v) => {
                  const skuVariante = generarSKUVariante(skuInterno, v.talla, v.colorNombre);
                  const visibles = v.imagenes.slice(0, MAX_IMG_VISIBLES);
                  const extras = v.imagenes.length - MAX_IMG_VISIBLES;
                  return (
                    <tr key={v.id}>
                      <td className="px-3 py-3 text-[13px] text-gray-900 border-b border-gray-100 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-[22px] h-[22px] rounded border border-gray-300 flex-shrink-0" style={{ backgroundColor: v.colorHex }} />
                          {v.talla} / {v.colorNombre}
                        </div>
                      </td>
                      <td className="px-3 py-3 border-b border-gray-100 align-middle">
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                          {skuVariante}
                        </span>
                      </td>
                      <td className="px-3 py-3 border-b border-gray-100 align-middle">
                        <PrecioInput value={v.precioBase} onChange={(p) => updateVariantePrecio(v.id, p)} />
                      </td>
                      <td className="px-3 py-3 border-b border-gray-100 align-middle">
                        <input
                          type="number"
                          min={0}
                          className="w-20 h-[34px] border border-gray-300 rounded px-2.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
                          value={v.stock}
                          onChange={(e) => updateVarianteStock(v.id, Number(e.target.value))}
                        />
                      </td>
                      <td className="px-3 py-3 border-b border-gray-100 align-middle">
                        <input
                          type="number"
                          min={0}
                          className="w-20 h-[34px] border border-gray-300 rounded px-2.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
                          value={v.stockMinimo}
                          onChange={(e) => updateVarianteStockMinimo(v.id, Number(e.target.value))}
                        />
                      </td>
                      <td className="px-3 py-3 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-1.5">
                          {visibles.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              className="w-9 h-9 rounded object-cover border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setModalImagenes({ varianteId: v.id })}
                              title="Ver imágenes"
                            />
                          ))}
                          {extras > 0 && (
                            <button
                              onClick={() => setModalImagenes({ varianteId: v.id })}
                              className="w-9 h-9 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-600 hover:bg-gray-200 flex-shrink-0 transition-colors"
                              title={`Ver ${extras} imagen${extras > 1 ? 'es' : ''} más`}
                            >
                              +{extras}
                            </button>
                          )}
                          <button
                            onClick={() => handleClickAgregarImagen(v.id)}
                            className="w-9 h-9 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primario hover:text-primario transition-colors flex-shrink-0"
                            title="Agregar imágenes"
                          >
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 border-b border-gray-100 align-middle">
                        <Toggle on={v.activo} onClick={() => toggleVariante(v.id)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Especificaciones Técnicas */}
        <div className="bg-white rounded-xl px-6 py-[22px] shadow-sm">
          <p className="text-[14px] font-bold text-gray-900 mb-5">Especificaciones Técnicas</p>

          <div className="mb-5 space-y-2">
            <div className="flex gap-3">
              <input
                type="text"
                className={`flex-1 ${tagInputClass}`}
                placeholder="Título (ej: Material)"
                value={especTitulo}
                onChange={(e) => setEspecTitulo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarEspecificacion()}
              />
              <button
                onClick={agregarEspecificacion}
                disabled={!especTitulo.trim() || !especDescripcion.trim()}
                className="h-9 px-4 bg-primario text-white rounded-lg text-[12px] font-semibold hover:bg-primario-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                Agregar
              </button>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 bg-white resize-y focus:border-primario focus:outline-none transition-colors"
              placeholder="Descripción (ej: 100% algodón pima)"
              value={especDescripcion}
              onChange={(e) => setEspecDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          {especificaciones.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-6">
              Aún no hay especificaciones. Agrega características como material, peso, instrucciones de lavado, etc.
            </p>
          ) : (
            <div className="space-y-2">
              {especificaciones.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <span className="text-[12px] font-bold text-gray-700 w-[180px] flex-shrink-0">{e.titulo}</span>
                    <span className="text-[13px] text-gray-600 truncate">{e.descripcion}</span>
                  </div>
                  <button
                    onClick={() => eliminarEspecificacion(e.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal: todas las imágenes de una variante */}
      {varianteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalImagenes(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Imágenes — {varianteModal.talla} / {varianteModal.colorNombre}
                </h3>
                <p className="text-[12px] text-gray-500">{varianteModal.imagenes.length} imagen{varianteModal.imagenes.length !== 1 ? 'es' : ''}</p>
              </div>
              <button
                onClick={() => setModalImagenes(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {varianteModal.imagenes.length === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-10">No hay imágenes aún.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {varianteModal.imagenes.map((img, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={img} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                      <button
                        onClick={() => handleEliminarImagen(varianteModal.id, i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar imagen"
                      >
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex-shrink-0">
              <button
                onClick={() => handleClickAgregarImagen(varianteModal.id)}
                className="w-full h-10 border-2 border-dashed border-gray-300 rounded-lg text-[13px] text-gray-500 hover:border-primario hover:text-primario transition-colors flex items-center justify-center gap-2"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar más imágenes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
