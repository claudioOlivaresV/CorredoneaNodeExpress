import { describe, expect, it, jest, beforeEach } from '@jest/globals';

import { prisma } from '../../config/prismaConfig';
import { Role } from '../../constants/roles.enum';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/app.errors';
import { ContractsService } from '../../contracts/contract.service';

jest.mock('../../config/prismaConfig', () => ({
  prisma: {
    properties: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },

    users: {
      findUnique: jest.fn(),
    },

    rental_contracts: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },

    payments: {
      createMany: jest.fn(),
    },

    $transaction: jest.fn(),
  },
}));

type MockedPrismaFunction = jest.Mock<any>;

const mockPropertyFindUnique = prisma.properties
  .findUnique as unknown as MockedPrismaFunction;

const mockPropertyUpdate = prisma.properties
  .update as unknown as MockedPrismaFunction;

const mockUserFindUnique = prisma.users
  .findUnique as unknown as MockedPrismaFunction;

const mockContractFindFirst = prisma.rental_contracts
  .findFirst as unknown as MockedPrismaFunction;

const mockContractFindUnique = prisma.rental_contracts
  .findUnique as unknown as MockedPrismaFunction;

const mockContractFindMany = prisma.rental_contracts
  .findMany as unknown as MockedPrismaFunction;

const mockContractCreate = prisma.rental_contracts
  .create as unknown as MockedPrismaFunction;

const mockContractUpdate = prisma.rental_contracts
  .update as unknown as MockedPrismaFunction;

const mockPaymentsCreateMany = prisma.payments
  .createMany as unknown as MockedPrismaFunction;

const mockTransaction = prisma.$transaction as unknown as MockedPrismaFunction;

const service = new ContractsService();

const createdAt = new Date('2026-09-01T00:00:00.000Z');

const startDate = new Date('2026-09-01T00:00:00.000Z');
const endDate = new Date('2026-12-20T00:00:00.000Z');

const mockProperty = {
  id: 1,
  status: 'AVAILABLE',
};

const mockTenant = {
  id: 5,
  name: 'Juan Pérez',
  email: 'juan@test.com',
  active: true,
  role: {
    name: Role.ARRENDATARIO,
  },
};

const mockContract = {
  id: 10,
  property_id: 1,
  tenant_id: 5,
  start_date: startDate,
  end_date: endDate,
  monthly_rent: 600000,
  status: 'ACTIVE',
  created_at: createdAt,
};

describe('ContractsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe lanzar BadRequestError si la fecha de término es anterior o igual a la fecha de inicio', async () => {
      await expect(
        service.create({
          property_id: 1,
          tenant_id: 5,
          start_date: '2026-10-01',
          end_date: '2026-10-01',
          monthly_rent: 600000,
        }),
      ).rejects.toBeInstanceOf(BadRequestError);

      expect(mockPropertyFindUnique).not.toHaveBeenCalled();
      expect(mockUserFindUnique).not.toHaveBeenCalled();
      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundError si la propiedad no existe', async () => {
      mockPropertyFindUnique.mockResolvedValue(null);

      await expect(
        service.create({
          property_id: 999,
          tenant_id: 5,
          start_date: '2026-09-01',
          end_date: '2026-12-20',
          monthly_rent: 600000,
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(mockUserFindUnique).not.toHaveBeenCalled();
      expect(mockContractFindFirst).not.toHaveBeenCalled();
      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si la propiedad no está disponible', async () => {
      mockPropertyFindUnique.mockResolvedValue({
        id: 1,
        status: 'ARRENDADA',
      });

      await expect(
        service.create({
          property_id: 1,
          tenant_id: 5,
          start_date: '2026-09-01',
          end_date: '2026-12-20',
          monthly_rent: 600000,
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(mockUserFindUnique).not.toHaveBeenCalled();
      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundError si el arrendatario no existe', async () => {
      mockPropertyFindUnique.mockResolvedValue(mockProperty);

      mockUserFindUnique.mockResolvedValue(null);

      await expect(
        service.create({
          property_id: 1,
          tenant_id: 999,
          start_date: '2026-09-01',
          end_date: '2026-12-20',
          monthly_rent: 600000,
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(mockContractFindFirst).not.toHaveBeenCalled();
      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('debe lanzar ForbiddenError si el arrendatario está inactivo', async () => {
      mockPropertyFindUnique.mockResolvedValue(mockProperty);

      mockUserFindUnique.mockResolvedValue({
        ...mockTenant,
        active: false,
      });

      await expect(
        service.create({
          property_id: 1,
          tenant_id: 5,
          start_date: '2026-09-01',
          end_date: '2026-12-20',
          monthly_rent: 600000,
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);

      expect(mockContractFindFirst).not.toHaveBeenCalled();
      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el usuario no tiene rol ARRENDATARIO', async () => {
      mockPropertyFindUnique.mockResolvedValue(mockProperty);

      mockUserFindUnique.mockResolvedValue({
        ...mockTenant,
        role: {
          name: Role.CORREDOR,
        },
      });

      await expect(
        service.create({
          property_id: 1,
          tenant_id: 5,
          start_date: '2026-09-01',
          end_date: '2026-12-20',
          monthly_rent: 600000,
        }),
      ).rejects.toBeInstanceOf(BadRequestError);

      expect(mockContractFindFirst).not.toHaveBeenCalled();
      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('debe propagar el error de la transacción', async () => {
      mockPropertyFindUnique.mockResolvedValue(mockProperty);
      mockUserFindUnique.mockResolvedValue(mockTenant);
      mockContractFindFirst.mockResolvedValue(null);

      mockTransaction.mockRejectedValue(new Error('Error de base de datos'));

      await expect(
        service.create({
          property_id: 1,
          tenant_id: 5,
          start_date: '2026-09-01',
          end_date: '2026-12-20',
          monthly_rent: 600000,
        }),
      ).rejects.toThrow('Error de base de datos');
    });
  });

  describe('getById', () => {
    it('debe obtener todos los contratos de una propiedad con sus relaciones', async () => {
      const paymentDate = new Date('2026-09-30T00:00:00.000Z');
      const paymentCreatedAt = new Date('2026-09-01T00:00:00.000Z');

      mockContractFindMany.mockResolvedValue([
        {
          id: 10,
          start_date: new Date('2026-09-01'),
          end_date: new Date('2026-12-20'),
          monthly_rent: {
            toString: () => '600000',
          },
          status: 'ACTIVE',

          property: {
            id: 1,
            address: 'Av. Providencia 123',
            description: 'Departamento de prueba',
            monthly_rent: {
              toString: () => '700000',
            },
            status: 'ARRENDADA',

            owner: {
              id: 2,
              name: 'Pedro Propietario',
              email: 'pedro@test.com',
              role: {
                name: Role.ARRENDADOR,
              },
            },

            agent: {
              id: 3,
              name: 'Ana Corredora',
              email: 'ana@test.com',
              role: {
                name: Role.CORREDOR,
              },
            },
          },

          tenant: {
            id: 5,
            name: 'Juan Pérez',
            email: 'juan@test.com',
            role: {
              name: Role.ARRENDATARIO,
            },
          },

          payments: [
            {
              id: 1,
              contract_id: 10,
              due_date: paymentDate,
              amount: {
                toString: () => '600000',
              },
              paid_at: null,
              status: 'PENDING',
              created_at: paymentCreatedAt,
            },
          ],
        },
      ]);

      const result = await service.getById(1);

      expect(result).toEqual([
        {
          id: 10,
          start_date: new Date('2026-09-01'),
          end_date: new Date('2026-12-20'),
          monthly_rent: '600000',
          status: 'ACTIVE',

          property: {
            id: 1,
            address: 'Av. Providencia 123',
            description: 'Departamento de prueba',
            monthly_rent: '700000',
            status: 'ARRENDADA',

            owner: {
              id: 2,
              name: 'Pedro Propietario',
              email: 'pedro@test.com',
              role: {
                name: Role.ARRENDADOR,
              },
            },

            agent: {
              id: 3,
              name: 'Ana Corredora',
              email: 'ana@test.com',
              role: {
                name: Role.CORREDOR,
              },
            },
          },

          tenant: {
            id: 5,
            name: 'Juan Pérez',
            email: 'juan@test.com',
            role: {
              name: Role.ARRENDATARIO,
            },
          },

          payments: [
            {
              id: 1,
              contract_id: 10,
              due_date: paymentDate,
              amount: '600000',
              paid_at: null,
              status: 'PENDING',
              created_at: paymentCreatedAt,
            },
          ],
        },
      ]);

      expect(mockContractFindMany).toHaveBeenCalledWith({
        where: {
          property_id: 1,
        },
        select: expect.any(Object),
      });
    });

    it('debe obtener contratos con owner null y agent null', async () => {
      mockContractFindMany.mockResolvedValue([
        {
          id: 10,
          start_date: new Date('2026-09-01'),
          end_date: null,
          monthly_rent: {
            toString: () => '600000',
          },
          status: 'ACTIVE',

          property: {
            id: 1,
            address: 'Av. Providencia 123',
            description: null,
            monthly_rent: {
              toString: () => '600000',
            },
            status: 'ARRENDADA',

            owner: null,
            agent: null,
          },

          tenant: {
            id: 5,
            name: 'Juan Pérez',
            email: 'juan@test.com',
            role: {
              name: Role.ARRENDATARIO,
            },
          },

          payments: [],
        },
      ]);

      const result = await service.getById(1);

      expect(result[0].property.owner).toBeNull();
      expect(result[0].property.agent).toBeNull();
      expect(result[0].property.description).toBeNull();
      expect(result[0].end_date).toBeNull();
      expect(result[0].payments).toEqual([]);
    });

    it('debe convertir los Decimal a string', async () => {
      mockContractFindMany.mockResolvedValue([
        {
          id: 10,
          start_date: startDate,
          end_date: endDate,
          monthly_rent: {
            toString: () => '650000',
          },
          status: 'ACTIVE',

          property: {
            id: 1,
            address: 'Av. Providencia 123',
            description: null,
            monthly_rent: {
              toString: () => '700000',
            },
            status: 'ARRENDADA',

            owner: null,
            agent: null,
          },

          tenant: {
            id: 5,
            name: 'Juan Pérez',
            email: 'juan@test.com',
            role: {
              name: Role.ARRENDATARIO,
            },
          },

          payments: [
            {
              id: 1,
              contract_id: 10,
              due_date: new Date('2026-09-30'),
              amount: {
                toString: () => '650000',
              },
              paid_at: null,
              status: 'PENDING',
              created_at: createdAt,
            },
          ],
        },
      ]);

      const result = await service.getById(1);

      expect(result[0].monthly_rent).toBe('650000');
      expect(result[0].property.monthly_rent).toBe('700000');
      expect(result[0].payments[0].amount).toBe('650000');
    });

    it('debe obtener múltiples contratos de la misma propiedad', async () => {
      mockContractFindMany.mockResolvedValue([
        {
          id: 10,
          start_date: new Date('2026-01-01'),
          end_date: new Date('2026-06-30'),
          monthly_rent: {
            toString: () => '500000',
          },
          status: 'CANCELLED',

          property: {
            id: 1,
            address: 'Av. Providencia 123',
            description: 'Departamento',
            monthly_rent: {
              toString: () => '500000',
            },
            status: 'AVAILABLE',
            owner: null,
            agent: null,
          },

          tenant: {
            id: 5,
            name: 'Juan',
            email: 'juan@test.com',
            role: {
              name: Role.ARRENDATARIO,
            },
          },

          payments: [],
        },

        {
          id: 11,
          start_date: new Date('2026-07-01'),
          end_date: new Date('2026-12-31'),
          monthly_rent: {
            toString: () => '550000',
          },
          status: 'ACTIVE',

          property: {
            id: 1,
            address: 'Av. Providencia 123',
            description: 'Departamento',
            monthly_rent: {
              toString: () => '550000',
            },
            status: 'ARRENDADA',
            owner: null,
            agent: null,
          },

          tenant: {
            id: 6,
            name: 'Pedro',
            email: 'pedro@test.com',
            role: {
              name: Role.ARRENDATARIO,
            },
          },

          payments: [],
        },
      ]);

      const result = await service.getById(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(10);
      expect(result[1].id).toBe(11);
    });

    it('debe lanzar NotFoundError si la propiedad no tiene contratos', async () => {
      mockContractFindMany.mockResolvedValue([]);

      await expect(service.getById(1)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('cancel', () => {
    it('debe lanzar NotFoundError si el contrato no existe', async () => {
      mockContractFindUnique.mockResolvedValue(null);

      await expect(service.cancel(999)).rejects.toBeInstanceOf(NotFoundError);

      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si el contrato ya está cancelado', async () => {
      mockContractFindUnique.mockResolvedValue({
        ...mockContract,
        status: 'CANCELLED',
      });

      await expect(service.cancel(10)).rejects.toBeInstanceOf(ConflictError);

      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('debe propagar el error si falla la transacción', async () => {
      mockContractFindUnique.mockResolvedValue(mockContract);

      mockTransaction.mockRejectedValue(
        new Error('Error actualizando contrato'),
      );

      await expect(service.cancel(10)).rejects.toThrow(
        'Error actualizando contrato',
      );
    });
  });
});
