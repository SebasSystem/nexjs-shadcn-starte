import type {
  MilestoneStatus,
  Project,
  ProjectStatus,
  ResourceRole,
} from 'src/features/projects/types';

// ─── Status configs ───────────────────────────────────────────────────────────

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' }
> = {
  planning: { label: 'Planificación', color: 'secondary' },
  in_progress: { label: 'En progreso', color: 'info' },
  on_hold: { label: 'En pausa', color: 'warning' },
  completed: { label: 'Completado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'error' },
};

export const MILESTONE_STATUS_CONFIG: Record<
  MilestoneStatus,
  { label: string; color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' }
> = {
  pending: { label: 'Pendiente', color: 'secondary' },
  in_progress: { label: 'En progreso', color: 'info' },
  completed: { label: 'Completado', color: 'success' },
  delayed: { label: 'Vencido', color: 'error' },
};

export const RESOURCE_ROLE_CONFIG: Record<
  ResourceRole,
  {
    label: string;
    color: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'error' | 'primary';
  }
> = {
  consultant: { label: 'Consultor', color: 'primary' },
  technician: { label: 'Técnico', color: 'info' },
  manager: { label: 'Manager', color: 'secondary' },
  support: { label: 'Soporte', color: 'warning' },
};

export const MOCK_CONSULTANTS = [
  { name: 'Carlos Medina', email: 'c.medina@crm.io' },
  { name: 'Laura Sánchez', email: 'l.sanchez@crm.io' },
  { name: 'Diego Ríos', email: 'd.rios@crm.io' },
  { name: 'Valeria Torres', email: 'v.torres@crm.io' },
  { name: 'Andrés Peña', email: 'a.pena@crm.io' },
  { name: 'Sofía Gómez', email: 's.gomez@crm.io' },
  { name: 'Martín Vargas', email: 'm.vargas@crm.io' },
  { name: 'Camila Herrera', email: 'c.herrera@crm.io' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Onboarding ERP — Distribuidora Mayorista',
    clientId: 'contact-001',
    clientName: 'Distribuidora Mayorista S.A.',
    opportunityId: 'COT-2026-001',
    status: 'in_progress',
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    manager: 'Carlos Medina',
    description:
      'Implementación completa del módulo de inventario y facturación para la operación B2B del cliente. Incluye migración de datos históricos y capacitación del equipo.',
    progress: 60,
    createdAt: '2026-01-28T10:00:00Z',
    milestones: [
      {
        id: 'ms-001-1',
        name: 'Kick-off y relevamiento de procesos',
        description: 'Reunión inicial con el equipo del cliente para mapear flujos actuales.',
        dueDate: '2026-02-15',
        completedDate: '2026-02-14',
        status: 'completed',
        assignedTo: 'Carlos Medina',
      },
      {
        id: 'ms-001-2',
        name: 'Configuración inicial del sistema',
        description: 'Setup de bodegas, usuarios y roles en el CRM.',
        dueDate: '2026-03-01',
        completedDate: '2026-03-02',
        status: 'completed',
        assignedTo: 'Diego Ríos',
      },
      {
        id: 'ms-001-3',
        name: 'Migración de catálogo de productos',
        description: 'Importar los 2.000 SKUs desde el sistema anterior.',
        dueDate: '2026-03-20',
        completedDate: '2026-03-19',
        status: 'completed',
        assignedTo: 'Laura Sánchez',
      },
      {
        id: 'ms-001-4',
        name: 'Capacitación equipo de ventas',
        description: 'Entrenamiento en CPQ y pipeline para los 12 vendedores.',
        dueDate: '2026-04-30',
        status: 'in_progress',
        assignedTo: 'Carlos Medina',
      },
      {
        id: 'ms-001-5',
        name: 'Go-live y soporte post-lanzamiento',
        description: 'Acompañamiento durante las primeras 2 semanas de operación en producción.',
        dueDate: '2026-06-15',
        status: 'pending',
        assignedTo: 'Carlos Medina',
      },
    ],
    resources: [
      {
        id: 'res-001-1',
        name: 'Carlos Medina',
        role: 'manager',
        email: 'c.medina@crm.io',
        startDate: '2026-02-01',
      },
      {
        id: 'res-001-2',
        name: 'Diego Ríos',
        role: 'technician',
        email: 'd.rios@crm.io',
        startDate: '2026-02-01',
        endDate: '2026-03-31',
      },
    ],
  },
  {
    id: 'proj-002',
    name: 'Implementación CRM — Retail Corp',
    clientId: 'contact-002',
    clientName: 'Retail Corp Ltda.',
    opportunityId: 'COT-2026-002',
    status: 'in_progress',
    startDate: '2026-03-01',
    endDate: '2026-07-31',
    manager: 'Laura Sánchez',
    description:
      'Despliegue del módulo CRM completo: contactos, pipeline, cotizaciones y comisiones. Especial atención en la segmentación de clientes B2C y B2B.',
    progress: 25,
    createdAt: '2026-02-20T09:00:00Z',
    milestones: [
      {
        id: 'ms-002-1',
        name: 'Análisis de requerimientos',
        dueDate: '2026-03-15',
        completedDate: '2026-03-14',
        status: 'completed',
        assignedTo: 'Laura Sánchez',
      },
      {
        id: 'ms-002-2',
        name: 'Configuración de roles y permisos',
        dueDate: '2026-04-01',
        status: 'in_progress',
        assignedTo: 'Andrés Peña',
      },
      {
        id: 'ms-002-3',
        name: 'Carga inicial de contactos y clientes',
        dueDate: '2026-05-01',
        status: 'pending',
        assignedTo: 'Sofía Gómez',
      },
      {
        id: 'ms-002-4',
        name: 'Capacitación gerencia y vendedores',
        dueDate: '2026-06-30',
        status: 'pending',
        assignedTo: 'Laura Sánchez',
      },
    ],
    resources: [
      {
        id: 'res-002-1',
        name: 'Laura Sánchez',
        role: 'manager',
        email: 'l.sanchez@crm.io',
        startDate: '2026-03-01',
      },
      {
        id: 'res-002-2',
        name: 'Andrés Peña',
        role: 'consultant',
        email: 'a.pena@crm.io',
        startDate: '2026-03-15',
      },
      {
        id: 'res-002-3',
        name: 'Sofía Gómez',
        role: 'support',
        email: 's.gomez@crm.io',
        startDate: '2026-04-01',
      },
    ],
  },
  {
    id: 'proj-003',
    name: 'Setup Inicial — TechParts Global',
    clientId: 'contact-003',
    clientName: 'TechParts Global',
    status: 'planning',
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    manager: 'Valeria Torres',
    description:
      'Proyecto en fase de planificación. Setup inicial del módulo de inventario y precios B2B para distribuidor de componentes electrónicos.',
    progress: 0,
    createdAt: '2026-04-10T11:00:00Z',
    milestones: [
      {
        id: 'ms-003-1',
        name: 'Reunión de alcance y firma de contrato',
        dueDate: '2026-05-10',
        status: 'pending',
        assignedTo: 'Valeria Torres',
      },
      {
        id: 'ms-003-2',
        name: 'Setup y configuración inicial',
        dueDate: '2026-06-15',
        status: 'pending',
        assignedTo: 'Martín Vargas',
      },
      {
        id: 'ms-003-3',
        name: 'Pruebas de aceptación y go-live',
        dueDate: '2026-08-15',
        status: 'pending',
        assignedTo: 'Valeria Torres',
      },
    ],
    resources: [
      {
        id: 'res-003-1',
        name: 'Valeria Torres',
        role: 'consultant',
        email: 'v.torres@crm.io',
        startDate: '2026-05-01',
      },
    ],
  },
  {
    id: 'proj-004',
    name: 'Migración de Datos — Moda Express',
    clientId: 'contact-004',
    clientName: 'Moda Express S.A.',
    status: 'completed',
    startDate: '2025-10-01',
    endDate: '2026-01-31',
    manager: 'Diego Ríos',
    description:
      'Migración exitosa de 5 años de histórico de clientes, ventas y productos desde sistema legacy. Proyecto cerrado dentro del plazo estimado.',
    progress: 100,
    createdAt: '2025-09-15T08:00:00Z',
    milestones: [
      {
        id: 'ms-004-1',
        name: 'Auditoría de datos fuente',
        dueDate: '2025-10-20',
        completedDate: '2025-10-19',
        status: 'completed',
        assignedTo: 'Diego Ríos',
      },
      {
        id: 'ms-004-2',
        name: 'Limpieza y normalización de datos',
        dueDate: '2025-11-15',
        completedDate: '2025-11-14',
        status: 'completed',
        assignedTo: 'Camila Herrera',
      },
      {
        id: 'ms-004-3',
        name: 'Migración a producción',
        dueDate: '2025-12-20',
        completedDate: '2025-12-18',
        status: 'completed',
        assignedTo: 'Diego Ríos',
      },
      {
        id: 'ms-004-4',
        name: 'Validación y cierre formal',
        dueDate: '2026-01-31',
        completedDate: '2026-01-28',
        status: 'completed',
        assignedTo: 'Diego Ríos',
      },
    ],
    resources: [
      {
        id: 'res-004-1',
        name: 'Diego Ríos',
        role: 'manager',
        email: 'd.rios@crm.io',
        startDate: '2025-10-01',
        endDate: '2026-01-31',
      },
      {
        id: 'res-004-2',
        name: 'Camila Herrera',
        role: 'technician',
        email: 'c.herrera@crm.io',
        startDate: '2025-10-01',
        endDate: '2025-12-31',
      },
    ],
  },
  {
    id: 'proj-005',
    name: 'Integración Contable — GovPro',
    clientId: 'contact-005',
    clientName: 'GovPro Institucional',
    status: 'on_hold',
    startDate: '2026-01-15',
    endDate: '2026-05-31',
    manager: 'Sofía Gómez',
    description:
      'Integración con sistema contable gubernamental. En pausa por demora en aprobación del proveedor externo de la institución.',
    progress: 40,
    createdAt: '2026-01-10T10:00:00Z',
    milestones: [
      {
        id: 'ms-005-1',
        name: 'Definición de especificaciones técnicas',
        dueDate: '2026-02-01',
        completedDate: '2026-01-30',
        status: 'completed',
        assignedTo: 'Sofía Gómez',
      },
      {
        id: 'ms-005-2',
        name: 'Desarrollo del conector API',
        dueDate: '2026-03-15',
        completedDate: '2026-03-18',
        status: 'completed',
        assignedTo: 'Martín Vargas',
      },
      {
        id: 'ms-005-3',
        name: 'Aprobación proveedor externo',
        dueDate: '2026-04-01',
        status: 'delayed',
        assignedTo: 'Sofía Gómez',
      },
      {
        id: 'ms-005-4',
        name: 'Pruebas de integración',
        dueDate: '2026-05-01',
        status: 'pending',
        assignedTo: 'Martín Vargas',
      },
      {
        id: 'ms-005-5',
        name: 'Puesta en producción',
        dueDate: '2026-05-31',
        status: 'pending',
        assignedTo: 'Sofía Gómez',
      },
    ],
    resources: [
      {
        id: 'res-005-1',
        name: 'Sofía Gómez',
        role: 'manager',
        email: 's.gomez@crm.io',
        startDate: '2026-01-15',
      },
      {
        id: 'res-005-2',
        name: 'Martín Vargas',
        role: 'technician',
        email: 'm.vargas@crm.io',
        startDate: '2026-02-01',
      },
    ],
  },
  {
    id: 'proj-006',
    name: 'Capacitación Usuarios — SportZone',
    clientId: 'contact-006',
    clientName: 'SportZone Mayorista',
    status: 'cancelled',
    startDate: '2026-02-15',
    endDate: '2026-04-30',
    manager: 'Andrés Peña',
    description:
      'Proyecto cancelado por el cliente. Decidieron postponer la implementación hasta Q3 2026.',
    progress: 15,
    createdAt: '2026-02-10T09:00:00Z',
    milestones: [
      {
        id: 'ms-006-1',
        name: 'Sesión de diagnóstico',
        dueDate: '2026-03-01',
        completedDate: '2026-03-01',
        status: 'completed',
        assignedTo: 'Andrés Peña',
      },
      {
        id: 'ms-006-2',
        name: 'Plan de capacitación personalizado',
        dueDate: '2026-03-31',
        status: 'pending',
        assignedTo: 'Andrés Peña',
      },
    ],
    resources: [
      {
        id: 'res-006-1',
        name: 'Andrés Peña',
        role: 'consultant',
        email: 'a.pena@crm.io',
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      },
    ],
  },
];
