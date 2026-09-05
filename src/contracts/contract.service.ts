import { prisma } from '../config/prismaConfig';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/app.errors';
import { Role } from '../constants/roles.enum';
import {
  CreateRentalContractDto,
  RentalContractResponse,
} from './contract.types';

const ACTIVE = 'ACTIVE';
const AVAILABLE = 'AVAILABLE';
const RENTED = 'ARRENDADA';
const PENDING = 'PENDING';

export class ContractsService {
  async create(dto: CreateRentalContractDto): Promise<RentalContractResponse> {
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);

    if (endDate <= startDate) {
      throw new BadRequestError(
        'La fecha de término debe ser posterior a la fecha de inicio',
      );
    }

    const property = await prisma.properties.findUnique({
      where: {
        id: dto.property_id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!property) {
      throw new NotFoundError('Propiedad no valida');
    }

    if (property.status !== AVAILABLE) {
      throw new ConflictError('La propiedad no está disponible para arrendar');
    }

    const tenant = await prisma.users.findUnique({
      where: {
        id: dto.tenant_id,
      },
      include: {
        role: true,
      },
    });

    if (!tenant) {
      throw new NotFoundError('Arrendatario no valido');
    }

    if (!tenant.active) {
      throw new ForbiddenError('Arrendatario no valido');
    }

    if (tenant.role.name !== Role.ARRENDATARIO) {
      throw new BadRequestError('El usuario seleccionado no es valido');
    }

    const activeContract = await prisma.rental_contracts.findFirst({
      where: {
        property_id: dto.property_id,
        status: ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (activeContract) {
      throw new ConflictError('La propiedad ya tiene un contrato activo');
    }

    const contract = await prisma.$transaction(async (tx) => {
      const newContract = await tx.rental_contracts.create({
        data: {
          property_id: dto.property_id,
          tenant_id: dto.tenant_id,
          start_date: startDate,
          end_date: endDate,
          monthly_rent: dto.monthly_rent,
          status: ACTIVE,
        },
      });

      const payments = this.generatePayments(
        newContract.id,
        startDate,
        endDate,
        dto.monthly_rent,
      );

      await tx.payments.createMany({
        data: payments,
      });

      await tx.properties.update({
        where: {
          id: dto.property_id,
        },
        data: {
          status: RENTED,
        },
      });

      return newContract;
    });

    return {
      id: contract.id,
      property_id: contract.property_id,
      tenant_id: contract.tenant_id,
      start_date: contract.start_date,
      end_date: contract.end_date!,
      monthly_rent: Number(contract.monthly_rent),
      status: contract.status,
      created_at: contract.created_at,
    };
  }

  private generatePayments(
    contractId: number,
    startDate: Date,
    endDate: Date,
    monthlyRent: number,
  ) {
    const payments = [];

    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= lastMonth) {
      const year = current.getFullYear();
      const month = current.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const periodStart = startDate > firstDay ? startDate : firstDay;

      const periodEnd = endDate < lastDay ? endDate : lastDay;

      const daysInMonth = lastDay.getDate();

      const contractDays = this.getDaysInclusive(periodStart, periodEnd);

      const amount = Math.round((monthlyRent * contractDays) / daysInMonth);

      payments.push({
        contract_id: contractId,
        due_date: lastDay,
        amount,
        status: PENDING,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return payments;
  }

  private getDaysInclusive(start: Date, end: Date): number {
    const startUTC = Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );

    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

    return Math.floor((endUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1;
  }
}
