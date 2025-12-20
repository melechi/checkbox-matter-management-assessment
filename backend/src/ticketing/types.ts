export interface Matter {
  id: string;
  boardId: string;
  fields: Record<string, FieldValue>;
  cycleTime?: CycleTime;
  sla?: SLAStatus;
  createdAt: string;
  updatedAt: string;
  transitionedFirst: Date,
  transitionedLast: Date
}

export interface FieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: FieldType;
  value: string | number | boolean | Date | CurrencyValue | UserValue | StatusValue | null;
  displayValue?: string;
}

export interface CurrencyValue {
  amount: number;
  currency: string;
}

export interface UserValue {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface StatusValue {
  statusId: string;
  groupName: string;
}

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'currency' | 'boolean' | 'status' | 'user';

export interface CycleTime {
  resolutionTimeMs: number | null;
  resolutionTimeFormatted: string;
  isInProgress: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
}

export const SLA_STATUS_NAMES = {
  IN_PROGRESS: 'In Progress',
  MET: 'Met',
  BREACHED: 'Breached'
} as const;

export type SLAStatus = typeof SLA_STATUS_NAMES[keyof typeof SLA_STATUS_NAMES];

export const MATTER_STATUS_GROUP_NAME = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
} as const;

export type MatterStatusGroupName = typeof MATTER_STATUS_GROUP_NAME[keyof typeof MATTER_STATUS_GROUP_NAME];

export interface MatterListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

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
  metadata?: Record<string, unknown>;
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

export interface StatusGroup {
  id: string;
  name: string;
  sequence: number;
}

export interface CycleTimeHistory {
  id: string;
  ticketId: string;
  statusFieldId: string;
  fromStatusId: string | null;
  toStatusId: string;
  transitionedAt: Date;
}

