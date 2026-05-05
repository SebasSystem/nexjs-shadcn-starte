export type TagColor = 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange' | 'slate' | 'pink';

export type TagEntity = 'CONTACT' | 'DEAL' | 'LEAD' | 'COMPANY';

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  entities: TagEntity[];
  created_at: string;
}

export interface TagForm {
  name: string;
  color: TagColor;
  entities: TagEntity[];
}
