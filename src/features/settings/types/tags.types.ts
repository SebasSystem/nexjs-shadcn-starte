export type TagColor = 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange' | 'slate' | 'pink';

export type TagEntity = 'CONTACT' | 'DEAL' | 'LEAD' | 'COMPANY';

export interface Tag {
  id: string;
  nombre: string;
  color: TagColor;
  entidades: TagEntity[];
  creadoEn: string;
}

export interface TagForm {
  nombre: string;
  color: TagColor;
  entidades: TagEntity[];
}
