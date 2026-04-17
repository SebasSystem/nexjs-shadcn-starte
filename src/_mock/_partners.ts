import type {
  Partner,
  PartnerOpportunity,
  PortalMaterial,
  PartnerType,
  PartnerStatus,
  PartnerOpportunityStatus,
  MaterialType,
} from 'src/features/partners/types';

// ─── Status configs ───────────────────────────────────────────────────────────

export const PARTNER_STATUS_CONFIG: Record<
  PartnerStatus,
  { label: string; color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' }
> = {
  active: { label: 'Activo', color: 'success' },
  inactive: { label: 'Inactivo', color: 'error' },
  prospect: { label: 'Prospecto', color: 'warning' },
};

export const PARTNER_TYPE_CONFIG: Record<
  PartnerType,
  {
    label: string;
    color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' | 'primary';
  }
> = {
  distributor: { label: 'Distribuidor', color: 'info' },
  reseller: { label: 'Reseller', color: 'primary' },
  ally: { label: 'Aliado', color: 'secondary' },
};

export const PARTNER_OPP_STATUS_CONFIG: Record<
  PartnerOpportunityStatus,
  { label: string; color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' }
> = {
  pending: { label: 'Pendiente', color: 'warning' },
  approved: { label: 'Aprobada', color: 'success' },
  rejected: { label: 'Rechazada', color: 'error' },
  converted: { label: 'Convertida', color: 'info' },
  lost: { label: 'Perdida', color: 'secondary' },
};

export const MATERIAL_TYPE_CONFIG: Record<MaterialType, { label: string; icon: string }> = {
  deck: { label: 'Presentación', icon: 'Presentation' },
  training: { label: 'Capacitación', icon: 'GraduationCap' },
  product_sheet: { label: 'Ficha de Producto', icon: 'FileText' },
  guide: { label: 'Guía', icon: 'BookOpen' },
  contract_template: { label: 'Plantilla Contrato', icon: 'FileSignature' },
};

export const MOCK_INTERNAL_USERS = [
  'Carlos Medina',
  'Laura Sánchez',
  'Diego Ríos',
  'Valeria Torres',
  'Andrés Peña',
  'Sofía Gómez',
];

// ─── Partners ─────────────────────────────────────────────────────────────────

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'partner-001',
    name: 'TechDistrib Latam',
    type: 'distributor',
    status: 'active',
    contactName: 'Roberto Salcedo',
    contactEmail: 'r.salcedo@techdistrib.com',
    phone: '+57 310 555 1001',
    region: 'Bogotá, Colombia',
    registeredOpportunities: 18,
    convertedDeals: 12,
    joinedDate: '2024-03-15',
    notes: 'Partner estrella en el segmento tech B2B. Prioridad alta para habilitación.',
  },
  {
    id: 'partner-002',
    name: 'MegaReseller Norte',
    type: 'reseller',
    status: 'active',
    contactName: 'Patricia Lozano',
    contactEmail: 'p.lozano@megareseller.mx',
    phone: '+52 81 555 2020',
    region: 'Monterrey, México',
    registeredOpportunities: 11,
    convertedDeals: 7,
    joinedDate: '2024-07-01',
  },
  {
    id: 'partner-003',
    name: 'GovLink Partners',
    type: 'ally',
    status: 'active',
    contactName: 'Fernando Quispe',
    contactEmail: 'f.quispe@govlink.pe',
    phone: '+51 1 555 3030',
    region: 'Lima, Perú',
    registeredOpportunities: 5,
    convertedDeals: 3,
    joinedDate: '2025-01-10',
    notes: 'Especializado en licitaciones B2G. Canal clave para sector público.',
  },
  {
    id: 'partner-004',
    name: 'CorpDist Argentina',
    type: 'distributor',
    status: 'prospect',
    contactName: 'Gabriela Morales',
    contactEmail: 'g.morales@corpdist.ar',
    region: 'Buenos Aires, Argentina',
    registeredOpportunities: 0,
    convertedDeals: 0,
    joinedDate: '2026-03-20',
    notes: 'En proceso de evaluación. Primer contacto establecido en feria B2B.',
  },
  {
    id: 'partner-005',
    name: 'NorteShop Ltda.',
    type: 'reseller',
    status: 'inactive',
    contactName: 'Julio Castaño',
    contactEmail: 'j.castano@norteshop.co',
    region: 'Medellín, Colombia',
    registeredOpportunities: 4,
    convertedDeals: 1,
    joinedDate: '2023-11-05',
    notes: 'Inactivo desde enero 2026 por falta de actividad comercial.',
  },
  {
    id: 'partner-006',
    name: 'EduTech Aliados',
    type: 'ally',
    status: 'active',
    contactName: 'Ana Belén Ruiz',
    contactEmail: 'a.ruiz@edutech.mx',
    phone: '+52 55 555 4040',
    region: 'Ciudad de México',
    registeredOpportunities: 8,
    convertedDeals: 5,
    joinedDate: '2024-09-15',
  },
];

// ─── Partner Opportunities ────────────────────────────────────────────────────

export const MOCK_PARTNER_OPPORTUNITIES: PartnerOpportunity[] = [
  {
    id: 'popp-001',
    partnerId: 'partner-001',
    partnerName: 'TechDistrib Latam',
    clientName: 'Manufactura Nacional S.A.',
    clientEmail: 'compras@manufnacional.com',
    product: 'Módulo CRM completo + integración inventario',
    estimatedValue: 28000,
    currency: 'USD',
    status: 'pending',
    registeredDate: '2026-04-10',
    assignedToInternal: 'Carlos Medina',
    notes: 'Cliente con 3 plantas de producción, necesita multi-bodega obligatoriamente.',
  },
  {
    id: 'popp-002',
    partnerId: 'partner-002',
    partnerName: 'MegaReseller Norte',
    clientName: 'Ferretera del Norte',
    clientEmail: 'admin@ferrnorte.mx',
    product: 'Cotizador CPQ + Price Books B2B',
    estimatedValue: 12000,
    currency: 'USD',
    status: 'pending',
    registeredDate: '2026-04-12',
    assignedToInternal: 'Laura Sánchez',
  },
  {
    id: 'popp-003',
    partnerId: 'partner-001',
    partnerName: 'TechDistrib Latam',
    clientName: 'Agro Exportaciones Ltda.',
    clientEmail: 'it@agroexp.com',
    product: 'Módulo de Comisiones + Dashboard vendedores',
    estimatedValue: 8500,
    currency: 'USD',
    status: 'pending',
    registeredDate: '2026-04-14',
    notes: 'Tienen 25 vendedores de campo que necesitan app móvil.',
  },
  {
    id: 'popp-004',
    partnerId: 'partner-003',
    partnerName: 'GovLink Partners',
    clientName: 'Ministerio de Logística',
    product: 'CRM B2G completo con multimoneda',
    estimatedValue: 45000,
    currency: 'USD',
    status: 'approved',
    registeredDate: '2026-03-05',
    assignedToInternal: 'Sofía Gómez',
    notes: 'Licitación aprobada. GovLink tiene exclusividad en este cliente.',
  },
  {
    id: 'popp-005',
    partnerId: 'partner-006',
    partnerName: 'EduTech Aliados',
    clientName: 'Universidad Tecnológica MX',
    clientEmail: 'rector@unitec.mx',
    product: 'CRM para gestión de admisiones y relaciones con empresas',
    estimatedValue: 18000,
    currency: 'USD',
    status: 'approved',
    registeredDate: '2026-03-20',
    assignedToInternal: 'Valeria Torres',
  },
  {
    id: 'popp-006',
    partnerId: 'partner-002',
    partnerName: 'MegaReseller Norte',
    clientName: 'Distribuidora Petroquímica SA',
    product: 'Módulo básico de inventario',
    estimatedValue: 6000,
    currency: 'USD',
    status: 'rejected',
    registeredDate: '2026-02-28',
    notes:
      'Rechazada: el cliente ya fue contactado directamente por el equipo interno previamente.',
  },
  {
    id: 'popp-007',
    partnerId: 'partner-001',
    partnerName: 'TechDistrib Latam',
    clientName: 'Retail Corp Ltda.',
    product: 'CRM completo + comisiones',
    estimatedValue: 22000,
    currency: 'USD',
    status: 'converted',
    registeredDate: '2026-01-15',
    assignedToInternal: 'Laura Sánchez',
  },
  {
    id: 'popp-008',
    partnerId: 'partner-006',
    partnerName: 'EduTech Aliados',
    clientName: 'Instituto Formación Pro',
    product: 'Módulo de productividad y agenda',
    estimatedValue: 4500,
    currency: 'USD',
    status: 'converted',
    registeredDate: '2025-12-01',
    assignedToInternal: 'Andrés Peña',
  },
  {
    id: 'popp-009',
    partnerId: 'partner-005',
    partnerName: 'NorteShop Ltda.',
    clientName: 'Moda Urban SAS',
    product: 'CRM básico B2C',
    estimatedValue: 3200,
    currency: 'USD',
    status: 'lost',
    registeredDate: '2025-10-10',
    notes: 'Cliente eligió a la competencia. Precio fue el factor determinante.',
  },
];

// ─── Portal Materials ─────────────────────────────────────────────────────────

export const MOCK_PORTAL_MATERIALS: PortalMaterial[] = [
  {
    id: 'mat-001',
    title: 'Presentación Comercial 2026 — CRM B2B',
    description:
      'Deck actualizado con todas las funcionalidades del CRM para presentar a clientes B2B. Incluye casos de éxito y ROI proyectado.',
    type: 'deck',
    fileName: 'CRM-B2B-Presentacion-2026.pptx',
    fileSize: '8.2 MB',
    uploadedAt: '2026-03-01',
    uploadedBy: 'Carlos Medina',
    tags: ['ventas', 'B2B', '2026', 'comercial'],
    downloadCount: 34,
  },
  {
    id: 'mat-002',
    title: 'Guía de Onboarding para Partners',
    description:
      'Manual completo paso a paso para que los partners puedan registrar oportunidades, acceder al portal y entender el proceso de deal registration.',
    type: 'guide',
    fileName: 'Guia-Onboarding-Partners-v2.pdf',
    fileSize: '3.1 MB',
    uploadedAt: '2026-02-15',
    uploadedBy: 'Laura Sánchez',
    tags: ['onboarding', 'partners', 'deal registration'],
    downloadCount: 57,
  },
  {
    id: 'mat-003',
    title: 'Video Training: Módulo de Cotizaciones CPQ',
    description:
      'Capacitación en video sobre cómo usar el cotizador CPQ. Cubre listas de precios, descuentos, márgenes y generación de PDF.',
    type: 'training',
    fileName: 'Training-CPQ-Cotizaciones.mp4',
    fileSize: '245 MB',
    uploadedAt: '2026-01-20',
    uploadedBy: 'Diego Ríos',
    tags: ['CPQ', 'cotizaciones', 'training', 'video'],
    downloadCount: 89,
  },
  {
    id: 'mat-004',
    title: 'Ficha de Producto — Módulo Inventario',
    description:
      'Ficha técnica del módulo de inventario. Detalla funcionalidades de multi-bodega, reserva de stock B2B y reportes disponibles.',
    type: 'product_sheet',
    fileName: 'Ficha-Producto-Inventario.pdf',
    fileSize: '1.8 MB',
    uploadedAt: '2026-03-10',
    uploadedBy: 'Valeria Torres',
    tags: ['inventario', 'multi-bodega', 'stock', 'ficha'],
    downloadCount: 23,
  },
  {
    id: 'mat-005',
    title: 'Plantilla de Contrato — Partner Distribuidor',
    description:
      'Plantilla legal base para contratos con distribuidores. Incluye cláusulas de exclusividad territorial y términos de deal registration.',
    type: 'contract_template',
    fileName: 'Contrato-Partner-Distribuidor-Template.docx',
    fileSize: '420 KB',
    uploadedAt: '2025-12-05',
    uploadedBy: 'Andrés Peña',
    tags: ['legal', 'contrato', 'distribuidor', 'exclusividad'],
    downloadCount: 12,
  },
  {
    id: 'mat-006',
    title: 'Training: Comisiones y Dashboard de Vendedores',
    description:
      'Módulo de capacitación sobre cómo configurar planes de comisión, asignar vendedores y usar el simulador de comisiones.',
    type: 'training',
    fileName: 'Training-Comisiones-Dashboard.pdf',
    fileSize: '5.6 MB',
    uploadedAt: '2026-02-28',
    uploadedBy: 'Sofía Gómez',
    tags: ['comisiones', 'vendedores', 'training', 'incentivos'],
    downloadCount: 41,
  },
  {
    id: 'mat-007',
    title: 'Presentación Segmento B2G — Sector Público',
    description:
      'Deck especializado para licitaciones y ventas al sector público. Incluye funcionalidades de multimoneda y casos de uso gubernamentales.',
    type: 'deck',
    fileName: 'CRM-B2G-SectorPublico-2026.pptx',
    fileSize: '11.4 MB',
    uploadedAt: '2026-04-01',
    uploadedBy: 'Carlos Medina',
    tags: ['B2G', 'gobierno', 'licitaciones', 'multimoneda'],
    downloadCount: 18,
  },
];
