import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IReporteAdmin, IReporteInventario, IReporteVentas } from '../services/reporteService';

const BRAND: [number, number, number] = [204, 51, 109];
const DARK: [number, number, number] = [24, 32, 48];
const MUTED: [number, number, number] = [102, 112, 133];
const MONEY = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const DATE = new Intl.DateTimeFormat('es-PE');

function fecha(valor: string) {
  const date = new Date(valor.length === 10 ? `${valor}T00:00:00` : valor);
  return Number.isNaN(date.getTime()) ? valor : DATE.format(date);
}

function documento(titulo: string, subtitulo: string, desde?: string, hasta?: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 34, 'F');
  doc.setFillColor(...BRAND);
  doc.rect(0, 34, 210, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('GAMARRA 360', 14, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('GESTION COMERCIAL Y REPORTES', 14, 22);
  doc.setFontSize(9);
  doc.text(`Generado: ${DATE.format(new Date())}`, 196, 15, { align: 'right' });
  doc.text(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }), 196, 21, { align: 'right' });

  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(titulo, 14, 49);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.setFontSize(9);
  doc.text(subtitulo, 14, 56);
  if (desde && hasta) doc.text(`Periodo: ${fecha(desde)} al ${fecha(hasta)}`, 14, 62);
  return doc;
}

function indicadores(doc: jsPDF, valores: { etiqueta: string; valor: string }[], y: number) {
  const separacion = 4;
  const ancho = (182 - separacion * (valores.length - 1)) / valores.length;
  valores.forEach((item, index) => {
    const x = 14 + index * (ancho + separacion);
    doc.setFillColor(247, 248, 250);
    doc.setDrawColor(225, 228, 234);
    doc.roundedRect(x, y, ancho, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.text(item.etiqueta.toUpperCase(), x + 4, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.setFontSize(12);
    doc.text(item.valor, x + 4, y + 15);
  });
}

function pie(doc: jsPDF) {
  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setDrawColor(225, 228, 234);
    doc.line(14, 284, 196, 284);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text('Documento generado por Gamarra 360', 14, 289);
    doc.text(`Pagina ${pagina} de ${paginas}`, 196, 289, { align: 'right' });
  }
}

function guardar(doc: jsPDF, nombre: string) {
  pie(doc);
  doc.save(nombre);
}

export function descargarReporteVentasPdf(reporte: IReporteVentas, desde: string, hasta: string) {
  const doc = documento('Reporte de ventas', 'Resumen comercial y detalle de pedidos', desde, hasta);
  indicadores(doc, [
    { etiqueta: 'Ventas netas', valor: MONEY.format(reporte.totalVentas) },
    { etiqueta: 'Pedidos', valor: String(reporte.pedidos) },
    { etiqueta: 'Cancelados', valor: String(reporte.cancelados) },
    { etiqueta: 'Devoluciones', valor: MONEY.format(reporte.devoluciones) },
  ], 69);

  autoTable(doc, {
    startY: 96,
    margin: { left: 14, right: 14, bottom: 18 },
    head: [['Pedido', 'Fecha', 'Estado', 'Modalidad', 'Total']],
    body: reporte.detalle.map((fila) => [
      `#${fila.pedidoId}`,
      fecha(fila.fecha),
      fila.estado.replace(/_/g, ' '),
      fila.tipoEntrega.replace(/_/g, ' '),
      MONEY.format(fila.total),
    ]),
    theme: 'grid',
    headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { textColor: DARK, fontSize: 8, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...DARK);
        doc.text('Reporte de ventas - continuacion', 14, 12);
      }
    },
  });
  guardar(doc, `reporte-ventas-${desde}-${hasta}.pdf`);
}

export function descargarReporteInventarioPdf(reporte: IReporteInventario) {
  const doc = documento('Reporte de inventario', 'Existencias, variantes y alertas de reposicion');
  indicadores(doc, [
    { etiqueta: 'Unidades disponibles', valor: String(reporte.unidades) },
    { etiqueta: 'Variantes registradas', valor: String(reporte.detalle.length) },
    { etiqueta: 'Stock bajo', valor: String(reporte.stockBajo) },
  ], 63);

  autoTable(doc, {
    startY: 90,
    margin: { left: 10, right: 10, bottom: 18 },
    head: [['Producto', 'SKU', 'Variante', 'Material / calidad', 'Stock', 'Min.', 'Estado']],
    body: reporte.detalle.map((fila) => [
      fila.producto,
      fila.sku || '-',
      [fila.talla, fila.color].filter(Boolean).join(' / ') || '-',
      [fila.material, fila.calidad].filter(Boolean).join(' / ') || '-',
      fila.stock,
      fila.stockMinimo,
      !fila.activo ? 'Inactivo' : fila.stock <= fila.stockMinimo ? 'Stock bajo' : 'Disponible',
    ]),
    theme: 'grid',
    headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { textColor: DARK, fontSize: 7, cellPadding: 2 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 4: { halign: 'center' }, 5: { halign: 'center' } },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6 && data.cell.raw === 'Stock bajo') {
        data.cell.styles.textColor = [190, 45, 45];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  guardar(doc, `reporte-inventario-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function descargarReportePlataformaPdf(reporte: IReporteAdmin, desde: string, hasta: string) {
  const doc = documento('Reporte financiero de plataforma', 'Consolidado ejecutivo de operaciones', desde, hasta);
  indicadores(doc, [
    { etiqueta: 'Ventas brutas', valor: MONEY.format(reporte.ventasBrutas) },
    { etiqueta: 'Comisiones', valor: MONEY.format(reporte.comisiones) },
    { etiqueta: 'Devoluciones', valor: MONEY.format(reporte.devoluciones) },
  ], 69);

  doc.setFillColor(247, 248, 250);
  doc.setDrawColor(225, 228, 234);
  doc.roundedRect(14, 98, 182, 43, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...DARK);
  doc.text('Resumen operativo', 20, 108);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`Pedidos pagados: ${reporte.pedidosPagados}`, 20, 119);
  doc.text(`Pedidos cancelados: ${reporte.pedidosCancelados}`, 20, 127);
  const total = reporte.pedidosPagados + reporte.pedidosCancelados;
  const tasa = total ? (reporte.pedidosCancelados / total) * 100 : 0;
  doc.text(`Tasa de cancelacion: ${tasa.toFixed(1)}%`, 110, 119);
  doc.text('Las devoluciones se presentan separadas y no generan comision.', 110, 127);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Observaciones', 14, 158);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...MUTED); doc.setFontSize(9);
  doc.text([
    '- Las cifras corresponden al periodo seleccionado.',
    '- Las comisiones se calculan con el parametro vigente de la plataforma.',
    '- Los pedidos cancelados se excluyen del total de ventas netas.',
  ], 14, 168, { lineHeightFactor: 1.7 });
  guardar(doc, `reporte-plataforma-${desde}-${hasta}.pdf`);
}
