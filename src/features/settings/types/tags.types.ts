export type TagColor = string;

export type TagEntity = 'CONTACT' | 'DEAL' | 'LEAD' | 'COMPANY';

export interface Tag {
  uid: string;
  name: string;
  color: TagColor;
  entity_types: TagEntity[];
  created_at: string;
}

export interface TagForm {
  name: string;
  color: TagColor;
  entity_types: TagEntity[];
}
