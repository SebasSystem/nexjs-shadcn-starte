import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_MOVEMENTS,
  getProductStockStatus,
  getProductAvailable,
  StockStatus
} from 'src/_mock/_inventories';
import { MOCK_QUOTES, getQuotesByProduct } from 'src/_mock/_quotes';

// ─── UTILS ───────────────────────────────────────────────────────────────────

function getReserved(productId: string) {
  return MOCK_QUOTES
    .filter((q) => q.status === 'approved')
    .flatMap((q) => q.items)
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

const richProducts = MOCK_PRODUCTS.map((p) => {
  const reserved = getReserved(p.id);
  const available = getProductAvailable(p, reserved);
  const physical = p.stockMain + p.stockStore;
  const stockStatus = getProductStockStatus(p, reserved);
  return { ...p, reserved, available, physical, stockStatus };
});

const stockStatusConfig: Record<StockStatus, { label: string; color: string }> = {
  available: { label: 'En stock', color: 'success' },
  low_stock: { label: 'Bajo', color: 'warning' },
  reserved: { label: 'Reservado', color: 'info' },
  out_of_stock: { label: 'Agotado', color: 'error' },
};

// ─── INVENTARIO ─────────────────────────────────────────────────────────────

export const mockInventoryStockByWarehouse = () => {
  const totalMain = richProducts.reduce((sum, p) => sum + p.stockMain, 0);
  const totalStore = richProducts.reduce((sum, p) => sum + p.stockStore, 0);
  const activeProducts = richProducts.filter((p) => p.status === 'active').length;
  
  const categories = Array.from(new Set(richProducts.map(p => p.category)));
  const chartData = categories.slice(0, 10).map(cat => {
    const prods = richProducts.filter(p => p.category === cat);
    return {
      name: cat,
      main: prods.reduce((s, p) => s + p.stockMain, 0),
      store: prods.reduce((s, p) => s + p.stockStore, 0),
    }
  });

  return {
    kpis: {
      "Bodega Principal": totalMain,
      "Stock Tiendas": totalStore,
      "Productos Activos": activeProducts,
      "Descuadre": Math.abs(totalMain - totalStore)
    },
    chartData: {
      categories: chartData.map(c => c.name),
      series: [
        { name: 'B. Principal', data: chartData.map(c => c.main) },
        { name: 'Tienda', data: chartData.map(c => c.store) }
      ]
    },
    tableData: richProducts.map(p => ({
      id: p.id,
      producto: p.name,
      sku: p.sku,
      categoría: p.category,
      bodegaPrin: p.stockMain,
      tiendas: p.stockStore,
      total: p.physical,
      statusBadge: stockStatusConfig[p.stockStatus]
    }))
  };
};

export const mockInventoryRisk = () => {
  const riskProducts = richProducts
    .filter((p) => p.stockStatus === 'out_of_stock' || p.stockStatus === 'low_stock' || p.available <= p.minStock * 2)
    .sort((a, b) => (a.available - a.minStock) - (b.available - b.minStock));

  const outOfStock = riskProducts.filter((p) => p.available <= 0).length;
  const critical = riskProducts.filter((p) => p.available > 0 && p.available <= p.minStock).length;
  const low = riskProducts.filter((p) => p.available > p.minStock && p.available <= p.minStock * 2).length;
  const totalRisk = riskProducts.length;

  return {
    kpis: { "Agotados (Riesgo)": outOfStock, "Estado Crítico": critical, "Stock Bajo": low, "Total en Riesgo": totalRisk },
    chartData: {
      series: [outOfStock, critical, low, richProducts.length - totalRisk],
      labels: ['Sin stock', 'Crítico', 'Bajo', 'Normal'],
      total: richProducts.length
    },
    mostCritical: riskProducts.length > 0 ? riskProducts[0] : null,
    tableData: riskProducts.map(p => {
      const diff = p.available - p.minStock;
      const statusBadge = diff < 0 ? { label: 'Crítico', color: 'error' } : { label: 'Bajo', color: 'warning' };
      return { 
        id: p.id,
        producto: p.name,
        sku: p.sku,
        categoría: p.category,
        disponible: p.available,
        mínimo: p.minStock,
        déficit: Math.abs(diff),
        statusBadge 
      };
    })
  };
};

export const mockInventoryMovements = () => {
  const receipts = MOCK_MOVEMENTS.filter((m) => m.type === 'receipt').length;
  const transfers = MOCK_MOVEMENTS.filter((m) => m.type === 'transfer').length;
  const adjustments = MOCK_MOVEMENTS.filter((m) => m.type.startsWith('adjustment')).length;

  return {
    kpis: {
      "Total Movimientos": MOCK_MOVEMENTS.length,
      "Entradas": receipts,
      "Traslados": transfers,
      "Ajustes Internos": adjustments
    },
    chartData: {
      categories: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5'], // Falso estático para el linechart
      series: [
        { name: 'Entradas', data: [5, 12, 8, 3, 10] },
        { name: 'Traslados', data: [2, 0, 4, 1, 8] },
        { name: 'Ajustes (-)', data: [0, 1, 0, 0, 2] }
      ]
    },
    tableData: MOCK_MOVEMENTS.map(m => ({
      id: m.id,
      tipo: m.type === 'receipt' ? 'Entrada' : m.type === 'transfer' ? 'Traslado' : m.type === 'adjustment_sub' ? 'Ajuste (-)' : 'Ajuste (+)',
      fecha: new Date(m.date).toLocaleDateString('es-CO'),
      producto: richProducts.find(p => p.id === m.productId)?.name || m.productId,
      bodega: m.from || m.to || m.adjustmentWarehouse || '-',
      referencia: m.receiptOrderRef || m.comment || '-',
      cantidad: m.quantity,
      usuario: m.registeredBy
    }))
  };
};

export const mockInventoryCategories = () => {
  const categories = MOCK_CATEGORIES.map(cat => {
    const prods = richProducts.filter(p => p.category === cat.name);
    return {
      category: cat.name,
      count: prods.length,
      stockMain: prods.reduce((s, p) => s + p.stockMain, 0),
      stockStore: prods.reduce((s, p) => s + p.stockStore, 0),
      totalStock: prods.reduce((s, p) => s + p.physical, 0),
      atRisk: prods.filter(p => p.stockStatus === 'out_of_stock' || p.stockStatus === 'low_stock').length
    };
  }).sort((a,b) => b.totalStock - a.totalStock);

  const totalProds = richProducts.filter((p) => p.status === 'active').length;
  const totalValue = categories.reduce((s, c) => s + c.totalStock, 0);

  return {
    kpis: {
      "Catálogo Activo": totalProds,
      "Categorías Activas": categories.filter(c => c.count > 0).length,
      "Unidades Globales": totalValue,
      "Agotados (Out of Stock)": richProducts.filter(p => p.available <= 0).length
    },
    chartData: {
      categories: categories.map(c => c.category),
      series: [{ name: 'Stock Total', data: categories.map(c => c.totalStock) }]
    },
    tableData: categories.map(c => ({
      categoría: c.category,
      productosActivos: c.count,
      bodegaPrin: c.stockMain,
      tiendas: c.stockStore,
      stockTotal: c.totalStock,
      enRiesgo: c.atRisk,
      participación: (totalValue ? Math.round((c.totalStock / totalValue) * 100) : 0) + '%'
    }))
  };
};

export const mockInventoryB2B = () => {
  const activeQuotes = MOCK_QUOTES.filter((q) => q.status === 'approved');
  const items = activeQuotes.flatMap(q => q.items.map(i => ({
    ...i, quoteId: q.id, client: q.clientName, date: q.createdAt, quoteStatus: q.status
  })));
  const totalReserved = items.reduce((s, i) => s + i.quantity, 0);
  const clients = Array.from(new Set(activeQuotes.map(q => q.clientName)));

  return {
    kpis: {
      "Reservas Activas": activeQuotes.length,
      "Unidades Separadas": totalReserved,
      "Variedad de Muestras": Array.from(new Set(items.map(i => i.productId))).length,
      "Clientes (B2B)": clients.length
    },
    chartData: {
      categories: clients.slice(0, 10),
      series: [{
        name: 'Unidades Reservadas',
        data: clients.slice(0, 10).map(c => items.filter(i => i.client === c).reduce((s, i) => s + i.quantity, 0))
      }]
    },
    tableData: items.map(i => ({
      id: i.productId + Math.random(),
      producto: richProducts.find(p => p.id === i.productId)?.name || i.productId,
      cliente: i.client,
      fecha: new Date(i.date).toLocaleDateString('es-CO'),
      cantidad: i.quantity,
      precio: (i.quantity * 100).toLocaleString('es-CO', { style: 'currency', currency:'COP' }),
      estadoCotizacion: i.quoteStatus === 'approved' ? 'Aprobada' : i.quoteStatus === 'sent' ? 'Enviada' : 'Rechazada'
    }))
  };
};

// ─── VENTAS ──────────────────────────────────────────────────────────────────

export const mockSalesStatus = () => {
  const tableData = MOCK_QUOTES.map(q => ({
    id: q.id,
    cliente: q.clientName,
    fecha: new Date(q.createdAt).toLocaleDateString('es-CO'),
    ítems: q.items.length,
    total: q.items.reduce((s, i) => s + (i.quantity * 100), 0).toLocaleString('es-CO', { style: 'currency', currency:'COP' }),
    ejecutivo: 'Ana Ejecutiva',
    statusBadge: {
      label: q.status === 'approved' ? 'Aprobada' : q.status === 'sent' ? 'Enviada' : q.status === 'rejected' ? 'Rechazada' : 'Borrador',
      color: q.status === 'approved' ? 'success' : q.status === 'sent' ? 'info' : q.status === 'rejected' ? 'error' : 'default'
    }
  }));

  return {
    kpis: {
      "Total Generadas": MOCK_QUOTES.length,
      "Aprobadas": MOCK_QUOTES.filter(q => q.status === 'approved').length,
      "Pendientes (En aire)": MOCK_QUOTES.filter(q => q.status === 'sent').length,
      "Rechazadas": MOCK_QUOTES.filter(q => q.status === 'rejected').length,
    },
    chartData: {
      labels: ['Aprobadas', 'Enviadas', 'Borrador', 'Rechazadas'],
      series: [
        MOCK_QUOTES.filter(q => q.status === 'approved').length,
        MOCK_QUOTES.filter(q => q.status === 'sent').length,
        MOCK_QUOTES.filter(q => q.status === 'draft').length,
        MOCK_QUOTES.filter(q => q.status === 'rejected').length,
      ]
    },
    tableData
  };
};

export const mockSalesProducts = () => {
  // Compute how many times products appear in quotes
  const freqMap: Record<string, { count: number, units: number, approvedUnits: number }> = {};
  MOCK_QUOTES.forEach(q => {
    q.items.forEach(i => {
      if(!freqMap[i.productId]) freqMap[i.productId] = { count: 0, units: 0, approvedUnits: 0 };
      freqMap[i.productId].count += 1;
      freqMap[i.productId].units += i.quantity;
      if (q.status === 'approved') freqMap[i.productId].approvedUnits += i.quantity;
    });
  });

  const tableData = richProducts.map(p => {
    const f = freqMap[p.id] || { count: 0, units: 0, approvedUnits: 0 };
    return {
      producto: p.name,
      sku: p.sku,
      categoría: p.category,
      vecesCotizado: f.count,
      unidades: f.units,
      aprobadas: f.approvedUnits,
      conversión: (f.units > 0 ? Math.round((f.approvedUnits / f.units) * 100) : 0) + '%'
    };
  }).sort((a,b) => b.vecesCotizado - a.vecesCotizado).filter(x => x.vecesCotizado > 0);

  return {
    kpis: {
      "Producto Estrella": tableData[0]?.producto || 'Ninguno',
      "Variedad (SKUs)": Object.keys(freqMap).length,
      "Promedio Cotizado": tableData.length ? Math.round(tableData.reduce((s,x)=>s+x.unidades,0) / tableData.length) : 0,
      "Líder de Categoría": tableData[0]?.categoría || 'Ninguno'
    },
    chartData: {
      categories: tableData.slice(0, 10).map(x => x.producto.substring(0, 15)+'...'),
      series: [{ name: 'Frecuencia en cotizaciones', data: tableData.slice(0, 10).map(x => x.vecesCotizado) }]
    },
    tableData
  };
};

export const mockSalesDistributors = () => {
  const clients = Array.from(new Set(MOCK_QUOTES.map(q => q.clientName)));
  const tableData = clients.map(c => {
    const q = MOCK_QUOTES.filter(x => x.clientName === c);
    return {
      distribuidor: c,
      cotizaciones: q.length,
      aprobadas: q.filter(x => x.status === 'approved').length,
      rechazadas: q.filter(x => x.status === 'rejected').length,
      pendientes: q.filter(x => x.status === 'sent').length,
      unidades: q.flatMap(x => x.items).reduce((s,i) => s + i.quantity, 0),
      últimaActividad: new Date(q[0]?.createdAt || Date.now()).toLocaleDateString('es-CO')
    };
  }).sort((a,b) => b.cotizaciones - a.cotizaciones);

  return {
    kpis: {
      "Distribuidores Activos": clients.length,
      "Distribuidor Top": tableData[0]?.distribuidor || '-',
      "Cotizaciones x Cliente": clients.length ? Math.round(MOCK_QUOTES.length / clients.length) : 0,
      "Oportunidades Pendientes": tableData.reduce((s,x)=>s+x.pendientes, 0)
    },
    chartData: {
      categories: tableData.slice(0, 8).map(x => x.distribuidor.substring(0, 10)),
      series: [
        { name: 'Aprobadas', data: tableData.slice(0, 8).map(x => x.aprobadas) },
        { name: 'Rechazadas', data: tableData.slice(0, 8).map(x => x.rechazadas) }
      ]
    },
    tableData
  };
};

export const mockSalesVs = () => {
  return {
    kpis: {
      "Tasa de Cierre": '68%',
      "Aprobadas (Mes)": 15,
      "Rechazadas (Mes)": 5,
      "Pendientes (En aire)": 12
    },
    chartData: {
      categories: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
      series: [
        { name: 'Aprobadas', data: [2, 5, 1, 4, 3] },
        { name: 'Rechazadas', data: [0, 1, 2, 0, 1] }
      ]
    },
    tableData: [
      { período: 'Semana 1', aprobadas: 8, rechazadas: 2, conv: '80%', vario: '+5%' },
      { período: 'Semana 2', aprobadas: 5, rechazadas: 4, conv: '55%', vario: '-25%' },
      { período: 'Semana 3', aprobadas: 12, rechazadas: 1, conv: '92%', vario: '+37%' },
    ]
  };
};
