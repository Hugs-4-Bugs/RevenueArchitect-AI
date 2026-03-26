
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Task {
  id: string;
  label: string;
  status: TaskStatus;
  category: 'Market' | 'Offer' | 'Build' | 'Sales';
}

export interface Lead {
  id: string;
  company: string;
  contact: string;
  pain_point: string;
  status: 'Cold' | 'Enriched' | 'Contacted' | 'Meeting Set';
}

export interface RevenueProjection {
  month: string;
  amount: number;
}
