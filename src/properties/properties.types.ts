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
  description?: string;
  monthly_rent: number;
  status?: PropertyStatus;
  owner_id?: number;
  agent_id?: number;
}
export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}
