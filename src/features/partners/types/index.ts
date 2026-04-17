export type PartnerType = 'distributor' | 'reseller' | 'ally';
export type PartnerStatus = 'active' | 'inactive' | 'prospect';
export type PartnerOpportunityStatus = 'pending' | 'approved' | 'rejected' | 'converted' | 'lost';
export type MaterialType = 'deck' | 'training' | 'product_sheet' | 'guide' | 'contract_template';

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contactName: string;
  contactEmail: string;
  phone?: string;
  region: string;
  registeredOpportunities: number;
  convertedDeals: number;
  joinedDate: string;
  notes?: string;
}

export interface PartnerOpportunity {
  id: string;
  partnerId: string;
  partnerName: string;
  clientName: string;
  clientEmail?: string;
  product: string;
  estimatedValue: number;
  currency: 'USD' | 'COP' | 'MXN';
  status: PartnerOpportunityStatus;
  registeredDate: string;
  notes?: string;
  assignedToInternal?: string;
}

export interface PortalMaterial {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  downloadCount: number;
}
