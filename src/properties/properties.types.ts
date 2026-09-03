import { Decimal } from '@prisma/client/runtime/library';

export interface CreatePropertyDto {
  address: string;
  description?: string;
  monthly_rent: number;
  status?: PropertyStatus;
  owner_id?: number;
  agent_id?: number;
}
export interface PropertyResponse {
  id: number;
  address: string;
  description: string | null;
  monthly_rent: number;
  status: string;
  owner_id: number | null;
  agent_id: number | null;
  created_at: Date;
}
export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export interface PropertyFilters {
  status?: string;
  min_price?: number;
  max_price?: number;
  agent_id?: number;
  owner_id?: number;
}

export interface PropertyContractResponse {
  id: number;
  start_date: Date;
  end_date: Date | null;
  status: RentalContractStatus;
}
export interface PropertyDetailResponse extends PropertyResponse {
  contracts: PropertyContractResponse[];
}
export enum RentalContractStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export interface UpdatePropertyDto {
  address?: string;
  description?: string;
  monthly_rent?: number;
  status?: string;
  owner_id?: number;
  agent_id?: number;
}
