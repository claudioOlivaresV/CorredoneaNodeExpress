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
export interface RentalContractDetailResponse {
  id: number;
  start_date: Date;
  end_date: Date | null;
  monthly_rent: string;
  status: string;

  property: {
    id: number;
    address: string;
    description: string | null;
    monthly_rent: string;
    status: string;

    owner: {
      id: number;
      name: string;
      email: string;
      role: {
        name: string;
      };
    } | null;

    agent: {
      id: number;
      name: string;
      email: string;
      role: {
        name: string;
      };
    } | null;
  };

  tenant: {
    id: number;
    name: string;
    email: string;
    role: {
      name: string;
    };
  };

  payments: {
    id: number;
    contract_id: number;
    due_date: Date;
    amount: string;
    paid_at: Date | null;
    status: string;
    created_at: Date;
  }[];
}
