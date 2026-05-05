export interface SegmentRule {
  uid: string;
  field: string;
  operator: string;
  value: string | number | string[];
}

export interface Segment {
  uid: string;
  name: string;
  description: string;
  logic: 'AND' | 'OR';
  rules: SegmentRule[];
  total_contacts: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentPayload {
  name: string;
  description: string;
  logic: 'AND' | 'OR';
  rules: Omit<SegmentRule, 'uid'>[];
}

export const SEGMENT_FIELDS: { value: string; label: string }[] = [
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
  { value: 'industry', label: 'Industry' },
  { value: 'company_size', label: 'Company Size' },
  { value: 'job_title', label: 'Job Title' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'tax_id', label: 'Tax ID' },
  { value: 'id_number', label: 'ID Number' },
  { value: 'institution_type', label: 'Institution Type' },
  { value: 'created_at', label: 'Created At' },
  { value: 'updated_at', label: 'Updated At' },
];
