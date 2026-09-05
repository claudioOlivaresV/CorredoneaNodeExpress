export interface CreateRentalContractDto {
  property_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  monthly_rent: number;
}

export interface RentalContractResponse {
  id: number;
  property_id: number;
  tenant_id: number;
  start_date: Date;
  end_date: Date;
  monthly_rent: number;
  status: string;
  created_at: Date;
}
