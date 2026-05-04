import type {
  AssignmentRule,
  AutomationRule,
  LinkedInProfile,
} from 'src/features/automation/types';

export const MOCK_AUTOMATION_USERS = [
  { id: 'usr-1', name: 'María González' },
  { id: 'usr-2', name: 'Carlos Ramírez' },
  { id: 'usr-3', name: 'Ana Pérez' },
  { id: 'usr-4', name: 'Luis Torres' },
];

export const MOCK_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'LinkedIn → Crear Lead automático',
    description:
      'Cuando se recibe un mensaje en LinkedIn, crea un lead y lo asigna al equipo de Social Media.',
    enabled: true,
    triggerSource: 'linkedin',
    triggerEvent: 'linkedin_message',
    conditionGroups: [],
    actions: [
      {
        id: 'act-1-1',
        sequence: 1,
        type: 'create_lead',
        config: {},
      },
      {
        id: 'act-1-2',
        sequence: 2,
        type: 'assign_owner',
        config: { assignmentRuleId: 'ar-1' },
      },
    ],
    runCount: 47,
    lastRunAt: '2026-04-21T14:30:00Z',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'rule-2',
    name: 'Facebook comentario → Lead geográfico',
    description:
      'Cuando alguien comenta en una publicación, crea un lead con asignación geográfica.',
    enabled: true,
    triggerSource: 'facebook',
    triggerEvent: 'facebook_comment',
    conditionGroups: [],
    actions: [
      {
        id: 'act-2-1',
        sequence: 1,
        type: 'create_lead',
        config: {},
      },
      {
        id: 'act-2-2',
        sequence: 2,
        type: 'assign_owner',
        config: { assignmentRuleId: 'ar-2' },
      },
    ],
    runCount: 23,
    lastRunAt: '2026-04-20T11:15:00Z',
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'rule-3',
    name: 'Lead LinkedIn → Validar y notificar',
    description:
      'Cuando se crea un lead desde LinkedIn, aplica etiqueta de validación y notifica al manager.',
    enabled: true,
    triggerSource: 'crm',
    triggerEvent: 'lead_created',
    conditionGroups: [
      {
        id: 'grp-3-1',
        logic: 'AND',
        conditions: [
          {
            id: 'cond-3-1',
            field: 'source',
            operator: 'equals',
            value: 'LinkedIn',
          },
        ],
      },
    ],
    actions: [
      {
        id: 'act-3-1',
        sequence: 1,
        type: 'apply_tag',
        config: { tag: 'linkedin-pending-validation' },
      },
      {
        id: 'act-3-2',
        sequence: 2,
        type: 'send_notification',
        config: {
          notificationMessage: 'Nuevo lead desde LinkedIn requiere validación de perfil.',
          notifyUserId: 'usr-1',
        },
      },
    ],
    runCount: 89,
    lastRunAt: '2026-04-22T08:00:00Z',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'rule-4',
    name: 'Deal estancado 14 días → Alertar',
    description: 'Si un deal lleva más de 14 días sin avanzar, notifica al rep y al manager.',
    enabled: true,
    triggerSource: 'time',
    triggerEvent: 'lead_stalled',
    triggerConfig: { daysThreshold: 14 },
    conditionGroups: [],
    actions: [
      {
        id: 'act-4-1',
        sequence: 1,
        type: 'send_notification',
        config: {
          notificationMessage: 'Tu deal lleva 14 días estancado. Tomá acción.',
          notifyUserId: 'usr-2',
        },
      },
      {
        id: 'act-4-2',
        sequence: 2,
        type: 'send_notification',
        config: {
          notificationMessage: 'Un deal de tu equipo lleva 14 días sin avanzar.',
          notifyUserId: 'usr-1',
        },
      },
    ],
    runCount: 15,
    lastRunAt: '2026-04-18T09:00:00Z',
    createdAt: '2026-02-10T12:00:00Z',
  },
  {
    id: 'rule-5',
    name: 'Deal perdido → Seguimiento 6 meses',
    description:
      'Cuando se pierde un deal, notifica y crea una actividad de re-contacto a 6 meses.',
    enabled: false,
    triggerSource: 'crm',
    triggerEvent: 'lead_lost',
    conditionGroups: [],
    actions: [
      {
        id: 'act-5-1',
        sequence: 1,
        type: 'send_notification',
        config: {
          notificationMessage: 'Deal marcado como perdido. Se programó seguimiento a 6 meses.',
          notifyUserId: 'usr-1',
        },
      },
      {
        id: 'act-5-2',
        sequence: 2,
        type: 'create_activity',
        config: {
          activityType: 'seguimiento',
          activityNotes: 'Re-contacto post-pérdida: verificar si el cliente cambió de necesidades.',
        },
      },
    ],
    runCount: 31,
    lastRunAt: '2026-03-15T16:45:00Z',
    createdAt: '2026-02-15T14:00:00Z',
  },
];

export const MOCK_ASSIGNMENT_RULES: AssignmentRule[] = [
  {
    id: 'ar-1',
    name: 'Social Media Assignment',
    type: 'round_robin',
    enabled: true,
    description: 'Distribuye leads de redes sociales en rotación entre el equipo.',
    userIds: ['usr-1', 'usr-2', 'usr-3'],
    roundRobinIndex: 2,
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'ar-2',
    name: 'Geographic Assignment',
    type: 'geographic',
    enabled: true,
    description: 'Asigna leads según el país de origen del contacto.',
    userIds: ['usr-1', 'usr-2', 'usr-3'],
    geoMapping: {
      Colombia: ['usr-1'],
      México: ['usr-2'],
      default: ['usr-3'],
    },
    roundRobinIndex: 0,
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'ar-3',
    name: 'Manual Review',
    type: 'manual',
    enabled: false,
    description: 'Leads que requieren asignación manual por el manager.',
    userIds: [],
    roundRobinIndex: 0,
    createdAt: '2026-01-20T11:00:00Z',
  },
];

export const MOCK_LINKEDIN_PROFILES: Record<string, LinkedInProfile> = {
  'opp-linkedin-1': {
    url: 'https://linkedin.com/in/carlos-ruiz',
    title: 'Sales Manager',
    company: 'TechMex',
    location: 'México',
    validationScore: 78,
    validationStatus: 'validated',
    lastChecked: '2026-04-20',
  },
  'opp-linkedin-2': {
    url: 'https://linkedin.com/in/laura-mendez',
    title: 'CEO',
    company: 'Global Industries SA',
    location: 'Colombia',
    validationScore: 45,
    validationStatus: 'review_required',
    lastChecked: '2026-04-19',
  },
  'opp-linkedin-3': {
    url: 'https://linkedin.com/in/ana-perez-tech',
    title: 'CTO',
    company: 'StartupCo',
    location: 'Argentina',
    validationScore: 22,
    validationStatus: 'unvalidated',
    lastChecked: '2026-04-15',
  },
};
