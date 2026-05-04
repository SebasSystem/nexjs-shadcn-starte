import type {
  Battlecard,
  Competitor,
  CompetitorTier,
  LostDeal,
  LostReasonCategory,
} from 'src/features/intelligence/types';
import type { BadgeColor } from 'src/shared/components/ui';

// ─── Config visual ────────────────────────────────────────────────────────────

export const COMPETITOR_TIER_CONFIG: Record<CompetitorTier, { label: string; color: BadgeColor }> =
  {
    direct: { label: 'Directo', color: 'error' },
    indirect: { label: 'Indirecto', color: 'warning' },
    emerging: { label: 'Emergente', color: 'info' },
  };

export const LOST_REASON_LABELS: Record<LostReasonCategory, string> = {
  price: 'Precio',
  features: 'Funcionalidades',
  relationship: 'Relación previa',
  support: 'Soporte / Implementación',
  timing: 'Timing / Presupuesto',
  competitor: 'Ganó la competencia',
  no_decision: 'Sin decisión',
  other: 'Otro',
};

export const LOST_REASON_OPTIONS = (
  Object.entries(LOST_REASON_LABELS) as [LostReasonCategory, string][]
).map(([value, label]) => ({ value, label }));

// ─── Competitors ──────────────────────────────────────────────────────────────

export const MOCK_COMPETITORS: Competitor[] = [
  {
    id: 'comp-001',
    name: 'Odoo',
    website: 'https://odoo.com',
    tier: 'direct',
  },
  {
    id: 'comp-002',
    name: 'SAP Business One',
    website: 'https://sap.com',
    tier: 'direct',
  },
  {
    id: 'comp-003',
    name: 'Zoho CRM',
    website: 'https://zoho.com/crm',
    tier: 'indirect',
  },
  {
    id: 'comp-004',
    name: 'HubSpot',
    website: 'https://hubspot.com',
    tier: 'indirect',
  },
  {
    id: 'comp-005',
    name: 'Monday.com',
    website: 'https://monday.com',
    tier: 'emerging',
  },
];

// ─── Battlecards ──────────────────────────────────────────────────────────────

export const MOCK_BATTLECARDS: Battlecard[] = [
  {
    id: 'bc-001',
    competitorId: 'comp-001',
    competitorName: 'Odoo',
    summary:
      'Odoo atrae por ser open-source y aparentemente "gratis", pero el costo real de implementación y personalización es alto. Nosotros ganamos en soporte local, rapidez de onboarding y modelo de precios transparente.',
    ourStrengths: [
      'Onboarding en semanas, no meses',
      'Soporte en español con SLA garantizado',
      'Precio fijo sin sorpresas de módulos adicionales',
      'Especialización en distribución y retail LATAM',
    ],
    theirStrengths: [
      'Amplio ecosistema de módulos',
      'Versión community gratuita',
      'Reconocimiento de marca global',
    ],
    objections: [
      {
        id: 'obj-001-1',
        objection: 'Odoo es open source, ¿por qué pagaría por su solución?',
        response:
          'Odoo Community es gratuito, pero la implementación, hosting, soporte y los módulos enterprise que realmente necesitan suman entre $15.000 y $40.000 USD en el primer año. Con nosotros sabés exactamente cuánto pagás desde el día uno, y tenés soporte local incluido.',
      },
      {
        id: 'obj-001-2',
        objection: 'Odoo tiene más módulos y funcionalidades',
        response:
          'Tener más módulos es una ventaja solo si los usás. El 80% de nuestros clientes activa menos del 40% de Odoo. Más funcionalidades significa más complejidad, más tiempo de capacitación y más cosas que pueden fallar. Nosotros entregamos lo que tu negocio necesita hoy, con capacidad de crecer.',
      },
      {
        id: 'obj-001-3',
        objection: 'Odoo tiene miles de partners y comunidad global',
        response:
          'Esa comunidad está dispersa en todo el mundo. Cuando hay un problema a las 3PM del viernes antes de un cierre de mes, ¿llamás a un foro o a tu consultor de cabecera que conoce tu negocio? Nosotros somos ese consultor.',
      },
    ],
    winRate: 62,
    dealsTracked: 21,
    dealsWon: 13,
    updatedAt: '2025-03-15',
    createdAt: '2024-08-01',
  },
  {
    id: 'bc-002',
    competitorId: 'comp-002',
    competitorName: 'SAP Business One',
    summary:
      'SAP B1 apunta a medianas empresas que quieren "lo de las grandes". El TCO es significativamente mayor y la implementación toma 6-18 meses. Nosotros ganamos en velocidad de valor, costo total y agilidad.',
    ourStrengths: [
      'Implementación 3-5x más rápida',
      'Costo total de propiedad 40-60% menor',
      'Interfaz moderna sin necesidad de consultores certificados permanentes',
      'Actualizaciones incluidas sin licencias adicionales',
    ],
    theirStrengths: [
      'Marca SAP como credencial corporativa',
      'Integración nativa con ecosistema SAP',
      'Amplia red de partners certificados',
    ],
    objections: [
      {
        id: 'obj-002-1',
        objection: 'SAP es el estándar de la industria, da más confianza',
        response:
          'SAP tiene el 30% del mercado ERP, pero el 70% restante elige soluciones más ágiles. La "confianza" de SAP viene con una factura: proyectos de $80.000-$200.000 USD, 12+ meses de implementación y dependencia de consultores certificados a $150/hora. Tus competidores que operan más ágil que vos probablemente no usan SAP.',
      },
      {
        id: 'obj-002-2',
        objection: 'Necesitamos un sistema que escale a nivel enterprise',
        response:
          'Define "escalar". Si es manejar más volumen de transacciones, más usuarios y más países: eso lo hacemos. Si es tener la complejidad burocrática de una multinacional cuando son una mediana empresa: eso no lo necesitás. SAP escala, sí — pero también escala el costo, la rigidez y los tiempos.',
      },
    ],
    winRate: 44,
    dealsTracked: 16,
    dealsWon: 7,
    updatedAt: '2025-02-20',
    createdAt: '2024-08-01',
  },
  {
    id: 'bc-003',
    competitorId: 'comp-003',
    competitorName: 'Zoho CRM',
    summary:
      'Zoho CRM es fuerte en gestión de contactos y pipeline de ventas. Pero no tiene inventario, facturación ni proyectos integrados. Nosotros ganamos cuando el cliente necesita operaciones unificadas.',
    ourStrengths: [
      'Inventario, ventas, proyectos y CRM en una sola plataforma',
      'Sin integraciones frágiles entre herramientas',
      'Flujo lead-to-cash completamente integrado',
      'Partners y canal de distribución incluidos',
    ],
    theirStrengths: [
      'Precio muy competitivo en CRM puro',
      'Interfaz intuitiva y onboarding rápido',
      'Amplia suite Zoho One para equipos pequeños',
    ],
    objections: [
      {
        id: 'obj-003-1',
        objection: 'Zoho CRM es mucho más barato',
        response:
          'Zoho CRM es barato para CRM, sí. Pero cuando necesitás inventory management, tenés que agregar Zoho Inventory. Cuando querés facturación, Zoho Books. Proyectos: Zoho Projects. Cada módulo tiene su costo, sus usuarios, sus limitaciones de integración y su propia curva de aprendizaje. El precio total de la suite completa se acerca al nuestro, pero con la fragmentación que nosotros eliminamos.',
      },
      {
        id: 'obj-003-2',
        objection: 'Solo necesitamos CRM por ahora',
        response:
          'Perfecto, empezamos con el módulo de ventas. La diferencia es que cuando en 6 meses quieran agregar inventario o proyectos, no van a necesitar cambiar de sistema ni migrar datos. Ya está todo listo para crecer. Con Zoho van a llegar a ese punto y van a tener que tomar una decisión difícil.',
      },
    ],
    winRate: 71,
    dealsTracked: 17,
    dealsWon: 12,
    updatedAt: '2025-03-01',
    createdAt: '2024-09-15',
  },
  {
    id: 'bc-004',
    competitorId: 'comp-004',
    competitorName: 'HubSpot',
    summary:
      'HubSpot domina en marketing y CRM inbound. No tiene operaciones: sin inventario, sin proyectos, sin distribución. El cliente que lo elige prioriza marketing sobre operaciones. Nosotros ganamos cuando el proceso va de ventas hasta entrega.',
    ourStrengths: [
      'Gestión operativa completa: desde el lead hasta la entrega',
      'Inventario y proyectos integrados al pipeline',
      'Facturación y comisiones sobre la misma plataforma',
      'Precio predecible sin marketplace de apps de pago',
    ],
    theirStrengths: [
      'Marketing automation de primer nivel',
      'UX excepcional y curva de aprendizaje mínima',
      'Ecosistema de integraciones muy amplio',
    ],
    objections: [
      {
        id: 'obj-004-1',
        objection: 'HubSpot es el mejor CRM del mercado',
        response:
          'Para marketing inbound y gestión de contactos, sí. Pero HubSpot no sabe qué hay en tu almacén, no gestiona proyectos de implementación, no te genera una factura legal y no maneja comisiones a vendedores. Cuando tu proceso de ventas termina en la reunión, HubSpot es excelente. Cuando termina en la entrega del producto o del servicio, necesitás más.',
      },
    ],
    winRate: 58,
    dealsTracked: 12,
    dealsWon: 7,
    updatedAt: '2025-01-10',
    createdAt: '2024-10-01',
  },
  {
    id: 'bc-005',
    competitorId: 'comp-005',
    competitorName: 'Monday.com',
    summary:
      'Monday.com es una herramienta de gestión de trabajo que algunos equipos usan como CRM improvisado. No tiene ERP, ni CRM real, ni inventario. Se lo ganamos mostrando lo que pasa cuando el negocio crece.',
    ourStrengths: [
      'CRM y ERP real vs. hojas en tableros',
      'Flujos automatizados de negocio, no solo tareas',
      'Escalabilidad sin necesidad de reconstruir procesos',
      'Reportes financieros y de inventario nativos',
    ],
    theirStrengths: [
      'Adopción viral por equipos operativos',
      'Muy fácil de usar y personalizar',
      'Precio por usuario competitivo para equipos pequeños',
    ],
    objections: [
      {
        id: 'obj-005-1',
        objection: 'Ya usamos Monday para todo, funciona bien',
        response:
          'Monday funciona bien para organizar tareas y proyectos — para eso fue diseñado. Pero ¿cómo calculan el margen de un deal? ¿Cómo saben qué hay en stock? ¿Cómo generan una factura? Cuando el negocio crece, esas preguntas se responden en otro sistema. Nosotros somos ese otro sistema — pero integrado desde el principio.',
      },
    ],
    winRate: 83,
    dealsTracked: 6,
    dealsWon: 5,
    updatedAt: '2025-02-05',
    createdAt: '2025-01-01',
  },
];

// ─── Lost Deals ───────────────────────────────────────────────────────────────

export const MOCK_LOST_DEALS: LostDeal[] = [
  {
    id: 'ld-001',
    opportunityName: 'Distribuidora Andina ERP',
    clientName: 'Distribuidora Andina S.A.',
    amount: 45000,
    currency: 'USD',
    competitorId: 'comp-001',
    competitorName: 'Odoo',
    lostReasonCategory: 'price',
    lostReasonDetail:
      'El cliente optó por Odoo Community + partner local para reducir costo inicial. Argumentaron que podían absorber el costo de implementación internamente.',
    lostDate: '2025-03-10',
    salesRepName: 'Carlos Medina',
  },
  {
    id: 'ld-002',
    opportunityName: 'Retail Corp Transformación Digital',
    clientName: 'Retail Corp Ltda.',
    amount: 120000,
    currency: 'USD',
    competitorId: 'comp-002',
    competitorName: 'SAP Business One',
    lostReasonCategory: 'relationship',
    lostReasonDetail:
      'El CFO tenía una relación de 8 años con el partner SAP. La decisión fue política, no técnica. El comité técnico prefería nuestra propuesta pero el CFO vetó.',
    lostDate: '2025-02-28',
    salesRepName: 'Ana Torres',
  },
  {
    id: 'ld-003',
    opportunityName: 'Moda Express CRM',
    clientName: 'Moda Express S.A.',
    amount: 18500,
    currency: 'USD',
    competitorId: 'comp-003',
    competitorName: 'Zoho CRM',
    lostReasonCategory: 'price',
    lostReasonDetail:
      'Solo necesitaban CRM básico por ahora. Zoho CRM Free tier fue suficiente para su volumen actual. Posible retomar en 12 meses cuando escalen.',
    lostDate: '2025-03-05',
    salesRepName: 'Luis Parra',
  },
  {
    id: 'ld-004',
    opportunityName: 'TechParts Pipeline & Marketing',
    clientName: 'TechParts Global',
    amount: 32000,
    currency: 'USD',
    competitorId: 'comp-004',
    competitorName: 'HubSpot',
    lostReasonCategory: 'features',
    lostReasonDetail:
      'El equipo de marketing tenía HubSpot firmemente en mente por las funcionalidades de inbound marketing. No tenemos marketing automation al nivel de HubSpot. El área de operaciones nos prefería pero no tuvo peso en la decisión.',
    lostDate: '2025-01-20',
    salesRepName: 'Ana Torres',
  },
  {
    id: 'ld-005',
    opportunityName: 'Agro Exportaciones ERP',
    clientName: 'Agro Exportaciones Ltda.',
    amount: 67000,
    currency: 'USD',
    competitorId: 'comp-001',
    competitorName: 'Odoo',
    lostReasonCategory: 'competitor',
    lostReasonDetail:
      'Partner de Odoo local ofreció personalización específica para el módulo de exportaciones agrícolas que nosotros no teníamos. El vertical agro es un gap real en nuestro producto.',
    lostDate: '2025-02-15',
    salesRepName: 'Carlos Medina',
  },
  {
    id: 'ld-006',
    opportunityName: 'SportZone Gestión Integral',
    clientName: 'SportZone Mayorista',
    amount: 41000,
    currency: 'USD',
    competitorId: 'comp-002',
    competitorName: 'SAP Business One',
    lostReasonCategory: 'features',
    lostReasonDetail:
      'Requerían integración nativa con su sistema de punto de venta Epicor ya instalado en 12 sucursales. SAP tenía conector certificado. Nosotros necesitábamos desarrollo custom.',
    lostDate: '2025-01-08',
    salesRepName: 'Luis Parra',
  },
  {
    id: 'ld-007',
    opportunityName: 'GovPro Licitación Sistema de Gestión',
    clientName: 'GovPro Institucional',
    amount: 89000,
    currency: 'USD',
    lostReasonCategory: 'no_decision',
    lostReasonDetail:
      'La licitación fue declarada desierta por cambios presupuestarios del sector público. No perdimos frente a un competidor — el proyecto fue cancelado internamente.',
    lostDate: '2025-03-01',
    salesRepName: 'Ana Torres',
  },
  {
    id: 'ld-008',
    opportunityName: 'Ferretera del Norte Módulo Inventario',
    clientName: 'Ferretera del Norte',
    amount: 22000,
    currency: 'COP',
    competitorId: 'comp-001',
    competitorName: 'Odoo',
    lostReasonCategory: 'price',
    lostReasonDetail:
      'Precio fue el factor decisivo. El dueño es muy sensible al costo inicial. Eligieron Odoo Community con implementación de estudiante universitario a muy bajo costo.',
    lostDate: '2025-02-10',
    salesRepName: 'Carlos Medina',
  },
  {
    id: 'ld-009',
    opportunityName: 'Constructora López ERP Proyectos',
    clientName: 'Constructora López',
    amount: 55000,
    currency: 'USD',
    competitorId: 'comp-002',
    competitorName: 'SAP Business One',
    lostReasonCategory: 'relationship',
    lostReasonDetail:
      'El gerente general había trabajado con SAP en su empresa anterior. Confianza basada en experiencia personal, no en evaluación objetiva.',
    lostDate: '2024-12-18',
    salesRepName: 'Luis Parra',
  },
  {
    id: 'ld-010',
    opportunityName: 'Startup Fintech CRM',
    clientName: 'PayFlex S.A.S.',
    amount: 15000,
    currency: 'USD',
    competitorId: 'comp-004',
    competitorName: 'HubSpot',
    lostReasonCategory: 'timing',
    lostReasonDetail:
      'El presupuesto del Q1 fue reasignado a desarrollo de producto. Quieren retomar en Q3. HubSpot Free cubrirá sus necesidades mínimas mientras tanto.',
    lostDate: '2025-01-30',
    salesRepName: 'Ana Torres',
  },
  {
    id: 'ld-011',
    opportunityName: 'Manufactura Industrial Gestión',
    clientName: 'InduxCo Ltda.',
    amount: 78000,
    currency: 'USD',
    competitorId: 'comp-001',
    competitorName: 'Odoo',
    lostReasonCategory: 'features',
    lostReasonDetail:
      'Necesitaban módulo de mantenimiento preventivo de maquinaria (MRO) que Odoo tiene nativo en su versión enterprise. Es un gap funcional que impacta varios deals en manufactura.',
    lostDate: '2025-03-20',
    salesRepName: 'Carlos Medina',
  },
  {
    id: 'ld-012',
    opportunityName: 'Clínica Veterinaria Software',
    clientName: 'VetCare Group',
    amount: 9500,
    currency: 'USD',
    lostReasonCategory: 'other',
    lostReasonDetail:
      'Decidieron desarrollar software a medida con un freelancer. No es un competidor del mercado sino la decisión de "hacer vs comprar". Recurrente en segmento PYME muy pequeño.',
    lostDate: '2025-02-25',
    salesRepName: 'Luis Parra',
  },
  {
    id: 'ld-013',
    opportunityName: 'Distribuidora Mayorista Renovación',
    clientName: 'Distribuidora Mayorista S.A.',
    amount: 38000,
    currency: 'USD',
    competitorId: 'comp-003',
    competitorName: 'Zoho CRM',
    lostReasonCategory: 'support',
    lostReasonDetail:
      'Tuvieron una mala experiencia con un partner nuestro en el pasado (pre nuestra gestión directa). Esa percepción de soporte deficiente los llevó a elegir Zoho que tiene soporte "en la nube" sin depender de partner local.',
    lostDate: '2025-01-15',
    salesRepName: 'Ana Torres',
  },
  {
    id: 'ld-014',
    opportunityName: 'Importadora Asia Pacific',
    clientName: 'AsiaPac Imports',
    amount: 44000,
    currency: 'USD',
    competitorId: 'comp-001',
    competitorName: 'Odoo',
    lostReasonCategory: 'price',
    lostReasonDetail:
      'Deal perdido principalmente por precio. Tienen un modelo de negocio de márgenes muy ajustados. La propuesta de Odoo con un partner de bajo costo fue un 35% más barata.',
    lostDate: '2025-03-12',
    salesRepName: 'Carlos Medina',
  },
];
