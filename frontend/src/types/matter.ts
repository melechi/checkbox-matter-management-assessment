export interface Matter {
  id: string;
  boardId: string;
  fields: Record<string, FieldValue>;
  cycleTime?: CycleTime;
  sla?: SLAStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: FieldType;
  value: any;
  displayValue?: string;
}

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'currency' | 'boolean' | 'status' | 'user';

export interface CycleTime {
  resolutionTimeMs: number | null;
  resolutionTimeFormatted: string;
  isInProgress: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export type SLAStatus = 'In Progress' | 'Met' | 'Breached';

export interface MatterListResponse {
  data: Matter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Field {
  id: string;
  accountId: number;
  name: string;
  fieldType: FieldType;
  description?: string;
  systemField: boolean;
  options?: FieldOption[];
  statusOptions?: StatusOption[];
}

export interface FieldOption {
  id: string;
  label: string;
  sequence: number;
}

export interface StatusOption {
  id: string;
  label: string;
  groupId: string;
  groupName: string;
  sequence: number;
}

