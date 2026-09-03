import { PropertiesService } from '../../properties/properties.service';
import { prisma } from '../../config/prismaConfig';
import { Role } from '../../constants/roles.enum';
import { RentalContractStatus } from '../../properties/properties.types';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/app.errors';

jest.mock('../../config/prismaConfig', () => ({
  prisma: {
    properties: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
    rental_contracts: {
      findFirst: jest.fn(),
    },
  },
}));

type MockedPrismaFunction = jest.Mock<any>;

const mockFindFirst = prisma.properties
  .findFirst as unknown as MockedPrismaFunction;

const mockFindUnique = prisma.properties
  .findUnique as unknown as MockedPrismaFunction;

const mockFindMany = prisma.properties
  .findMany as unknown as MockedPrismaFunction;

const mockCreate = prisma.properties.create as unknown as MockedPrismaFunction;

const mockUpdate = prisma.properties.update as unknown as MockedPrismaFunction;

const mockUserFindUnique = prisma.users
  .findUnique as unknown as MockedPrismaFunction;

const mockContractFindFirst = prisma.rental_contracts
  .findFirst as unknown as MockedPrismaFunction;

const service = new PropertiesService();

const createdAt = new Date('2026-01-01T00:00:00.000Z');

const mockProperty = {
  id: 1,
  address: 'Av. Providencia 123',
  description: 'Departamento de prueba',
  monthly_rent: 500000,
  status: 'AVAILABLE',
  owner_id: 1,
  agent_id: 2,
  created_at: createdAt,
};

const mockOwner = {
  id: 1,
  active: true,
  role: {
    name: Role.ARRENDADOR,
  },
};

const mockAgent = {
  id: 2,
  active: true,
  role: {
    name: Role.CORREDOR,
  },
};

describe('PropertiesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una propiedad correctamente', async () => {
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce(mockOwner)
        .mockResolvedValueOnce(mockAgent);

      mockCreate.mockResolvedValue(mockProperty);

      const result = await service.create({
        address: ' Av. Providencia 123 ',
        description: 'Departamento de prueba',
        monthly_rent: 500000,
        owner_id: 1,
        agent_id: 2,
      });

      expect(result).toEqual({
        id: 1,
        address: 'Av. Providencia 123',
        description: 'Departamento de prueba',
        monthly_rent: 500000,
        status: 'AVAILABLE',
        owner_id: 1,
        agent_id: 2,
        created_at: createdAt,
      });

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          address: 'Av. Providencia 123',
        },
        select: {
          id: true,
        },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          address: 'Av. Providencia 123',
          description: 'Departamento de prueba',
          monthly_rent: 500000,
          owner_id: 1,
          agent_id: 2,
        },
      });
    });

    it('debe crear una propiedad sin owner ni agent', async () => {
      mockFindFirst.mockResolvedValue(null);

      mockCreate.mockResolvedValue({
        ...mockProperty,
        address: 'Av. Apoquindo 456',
        description: undefined,
        owner_id: undefined,
        agent_id: undefined,
      });

      const result = await service.create({
        address: ' Av. Apoquindo 456 ',
        monthly_rent: 400000,
      });

      expect(result.address).toBe('Av. Apoquindo 456');
      expect(result.owner_id).toBeUndefined();
      expect(result.agent_id).toBeUndefined();

      expect(mockUserFindUnique).not.toHaveBeenCalled();

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          address: 'Av. Apoquindo 456',
          description: undefined,
          monthly_rent: 400000,
          owner_id: undefined,
          agent_id: undefined,
        },
      });
    });

    it('debe lanzar ConflictError si la dirección ya existe', async () => {
      mockFindFirst.mockResolvedValue({
        id: 10,
      });

      await expect(
        service.create({
          address: 'Av. Providencia 123',
          monthly_rent: 500000,
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(mockUserFindUnique).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el arriendo es menor o igual a cero', async () => {
      mockFindFirst.mockResolvedValue(null);

      await expect(
        service.create({
          address: 'Nueva dirección 123',
          monthly_rent: 0,
        }),
      ).rejects.toBeInstanceOf(BadRequestError);

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el propietario no existe', async () => {
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockAgent);

      await expect(
        service.create({
          address: 'Nueva dirección 123',
          monthly_rent: 500000,
          owner_id: 99,
          agent_id: 2,
        }),
      ).rejects.toThrow('El propietario no existe');

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el propietario está inactivo', async () => {
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce({
          ...mockOwner,
          active: false,
        })
        .mockResolvedValueOnce(mockAgent);

      await expect(
        service.create({
          address: 'Nueva dirección 123',
          monthly_rent: 500000,
          owner_id: 1,
          agent_id: 2,
        }),
      ).rejects.toThrow('El propietario está inactivo');

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el propietario no tiene rol ARRENDADOR', async () => {
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce({
          ...mockOwner,
          role: {
            name: Role.ARRENDATARIO,
          },
        })
        .mockResolvedValueOnce(mockAgent);

      await expect(
        service.create({
          address: 'Nueva dirección 123',
          monthly_rent: 500000,
          owner_id: 1,
          agent_id: 2,
        }),
      ).rejects.toThrow('El usuario indicado no tiene el rol de arrendador');

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el corredor no existe', async () => {
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce(mockOwner)
        .mockResolvedValueOnce(null);

      await expect(
        service.create({
          address: 'Nueva dirección 123',
          monthly_rent: 500000,
          owner_id: 1,
          agent_id: 99,
        }),
      ).rejects.toThrow('El corredor no existe');

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el corredor está inactivo', async () => {
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce(mockOwner)
        .mockResolvedValueOnce({
          ...mockAgent,
          active: false,
        });

      await expect(
        service.create({
          address: 'Nueva dirección 123',
          monthly_rent: 500000,
          owner_id: 1,
          agent_id: 2,
        }),
      ).rejects.toThrow('El corredor está inactivo');

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el corredor no tiene rol CORREDOR', async () => {
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce(mockOwner)
        .mockResolvedValueOnce({
          ...mockAgent,
          role: {
            name: Role.ARRENDATARIO,
          },
        });

      await expect(
        service.create({
          address: 'Nueva dirección 123',
          monthly_rent: 500000,
          owner_id: 1,
          agent_id: 2,
        }),
      ).rejects.toThrow('El usuario indicado no tiene el rol de corredor');

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('debe obtener todas las propiedades', async () => {
      mockFindMany.mockResolvedValue([mockProperty]);

      const result = await service.getAll();

      expect(result).toEqual([
        {
          id: 1,
          address: 'Av. Providencia 123',
          description: 'Departamento de prueba',
          monthly_rent: 500000,
          status: 'AVAILABLE',
          owner_id: 1,
          agent_id: 2,
          created_at: createdAt,
        },
      ]);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('debe filtrar por status', async () => {
      mockFindMany.mockResolvedValue([]);

      await service.getAll({
        status: 'AVAILABLE',
      });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          status: 'AVAILABLE',
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('debe filtrar por rango mínimo de precio', async () => {
      mockFindMany.mockResolvedValue([]);

      await service.getAll({
        min_price: 300000,
      });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          monthly_rent: {
            gte: 300000,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('debe filtrar por rango máximo de precio', async () => {
      mockFindMany.mockResolvedValue([]);

      await service.getAll({
        max_price: 600000,
      });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          monthly_rent: {
            lte: 600000,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('debe filtrar por rango completo de precio', async () => {
      mockFindMany.mockResolvedValue([]);

      await service.getAll({
        min_price: 300000,
        max_price: 600000,
      });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          monthly_rent: {
            gte: 300000,
            lte: 600000,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('debe filtrar por agent_id', async () => {
      mockFindMany.mockResolvedValue([]);

      await service.getAll({
        agent_id: 5,
      });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          agent_id: 5,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('debe filtrar por owner_id', async () => {
      mockFindMany.mockResolvedValue([]);

      await service.getAll({
        owner_id: 3,
      });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          owner_id: 3,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('debe aplicar todos los filtros juntos', async () => {
      mockFindMany.mockResolvedValue([mockProperty]);

      await service.getAll({
        status: 'AVAILABLE',
        min_price: 300000,
        max_price: 600000,
        agent_id: 2,
        owner_id: 1,
      });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          status: 'AVAILABLE',
          monthly_rent: {
            gte: 300000,
            lte: 600000,
          },
          agent_id: 2,
          owner_id: 1,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('debe convertir Decimal a number', async () => {
      mockFindMany.mockResolvedValue([
        {
          ...mockProperty,
          monthly_rent: {
            toString: () => '550000',
            valueOf: () => 550000,
          },
        },
      ]);

      const result = await service.getAll();

      expect(result[0].monthly_rent).toBe(550000);
    });

    it('debe retornar arreglo vacío cuando no existen propiedades', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('debe obtener una propiedad con sus contratos', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-12-31');

      mockFindUnique.mockResolvedValue({
        ...mockProperty,
        contracts: [
          {
            id: 20,
            start_date: startDate,
            end_date: endDate,
            status: RentalContractStatus.ACTIVE,
            created_at: new Date('2026-01-01'),
          },
          {
            id: 10,
            start_date: new Date('2025-01-01'),
            end_date: new Date('2025-12-31'),
            status: RentalContractStatus.FINISHED,
            created_at: new Date('2025-01-01'),
          },
        ],
      });

      const result = await service.getById(1);

      expect(result).toEqual({
        id: 1,
        address: 'Av. Providencia 123',
        description: 'Departamento de prueba',
        monthly_rent: 500000,
        status: 'AVAILABLE',
        owner_id: 1,
        agent_id: 2,
        created_at: createdAt,
        contracts: [
          {
            id: 20,
            start_date: startDate,
            end_date: endDate,
            status: RentalContractStatus.ACTIVE,
          },
          {
            id: 10,
            start_date: new Date('2025-01-01'),
            end_date: new Date('2025-12-31'),
            status: RentalContractStatus.FINISHED,
          },
        ],
      });

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          contracts: {
            select: {
              id: true,
              start_date: true,
              end_date: true,
              status: true,
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });
    });

    it('debe obtener una propiedad sin contratos', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockProperty,
        description: null,
        owner_id: null,
        agent_id: null,
        contracts: [],
      });

      const result = await service.getById(1);

      expect(result.contracts).toEqual([]);
      expect(result.description).toBeNull();
      expect(result.owner_id).toBeNull();
      expect(result.agent_id).toBeNull();
    });

    it('debe lanzar NotFoundError si la propiedad no existe', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('update', () => {
    it('debe actualizar correctamente todos los campos', async () => {
      const updatedProperty = {
        ...mockProperty,
        address: 'Nueva dirección 456',
        description: 'Nueva descripción',
        monthly_rent: 600000,
        status: 'MAINTENANCE',
        owner_id: 3,
        agent_id: 4,
      };

      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);

      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce({
          id: 3,
          active: true,
          role: {
            name: Role.ARRENDADOR,
          },
        })
        .mockResolvedValueOnce({
          id: 4,
          active: true,
          role: {
            name: Role.CORREDOR,
          },
        });

      mockUpdate.mockResolvedValue(updatedProperty);

      const result = await service.update(1, {
        address: 'Nueva dirección 456',
        description: 'Nueva descripción',
        monthly_rent: 600000,
        status: 'MAINTENANCE',
        owner_id: 3,
        agent_id: 4,
      });

      expect(result).toEqual({
        id: 1,
        address: 'Nueva dirección 456',
        description: 'Nueva descripción',
        monthly_rent: 600000,
        status: 'MAINTENANCE',
        owner_id: 3,
        agent_id: 4,
        created_at: createdAt,
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          address: 'Nueva dirección 456',
          description: 'Nueva descripción',
          monthly_rent: 600000,
          status: 'MAINTENANCE',
          owner_id: 3,
          agent_id: 4,
        },
      });
    });

    it('debe actualizar solamente address', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Dirección antigua',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue(null);

      mockUpdate.mockResolvedValue({
        ...mockProperty,
        address: 'Dirección nueva',
      });

      await service.update(1, {
        address: 'Dirección nueva',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          address: 'Dirección nueva',
        },
      });
    });

    it('debe actualizar solamente description', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue(null);

      mockUpdate.mockResolvedValue({
        ...mockProperty,
        description: 'Nueva descripción',
      });

      await service.update(1, {
        description: 'Nueva descripción',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          description: 'Nueva descripción',
        },
      });
    });

    it('debe actualizar solamente monthly_rent', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue(null);

      mockUpdate.mockResolvedValue({
        ...mockProperty,
        monthly_rent: 700000,
      });

      await service.update(1, {
        monthly_rent: 700000,
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          monthly_rent: 700000,
        },
      });
    });

    it('debe actualizar solamente status', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue(null);

      mockUpdate.mockResolvedValue({
        ...mockProperty,
        status: 'INACTIVE',
      });

      await service.update(1, {
        status: 'inactive',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          status: 'INACTIVE',
        },
      });
    });

    it('debe actualizar solamente owner_id', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique.mockResolvedValueOnce({
        id: 3,
        active: true,
        role: {
          name: Role.ARRENDADOR,
        },
      });

      mockUpdate.mockResolvedValue({
        ...mockProperty,
        owner_id: 3,
      });

      await service.update(1, {
        owner_id: 3,
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          owner_id: 3,
        },
      });
    });

    it('debe actualizar solamente agent_id', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique.mockResolvedValueOnce({
        id: 4,
        active: true,
        role: {
          name: Role.CORREDOR,
        },
      });

      mockUpdate.mockResolvedValue({
        ...mockProperty,
        agent_id: 4,
      });

      await service.update(1, {
        agent_id: 4,
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          agent_id: 4,
        },
      });
    });

    it('debe permitir actualizar address manteniendo la misma dirección', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);

      mockUpdate.mockResolvedValue(mockProperty);

      await service.update(1, {
        address: ' Av. Providencia 123 ',
      });

      expect(mockFindFirst).not.toHaveBeenCalled();

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          address: 'Av. Providencia 123',
        },
      });
    });

    it('debe lanzar NotFoundError si la propiedad no existe', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        service.update(999, {
          address: 'Nueva dirección',
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(mockContractFindFirst).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe lanzar ForbiddenError si tiene contrato activo', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue({
        id: 50,
      });

      await expect(
        service.update(1, {
          address: 'Nueva dirección',
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el propietario no existe', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockUserFindUnique.mockResolvedValueOnce(null);

      await expect(
        service.update(1, {
          owner_id: 99,
        }),
      ).rejects.toThrow('El propietario no existe');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el propietario está inactivo', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);

      mockUserFindUnique.mockResolvedValueOnce({
        id: 3,
        active: false,
        role: {
          name: Role.ARRENDADOR,
        },
      });

      await expect(
        service.update(1, {
          owner_id: 3,
        }),
      ).rejects.toThrow('El propietario está inactivo');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el propietario no tiene rol ARRENDADOR', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);

      mockUserFindUnique.mockResolvedValueOnce({
        id: 3,
        active: true,
        role: {
          name: Role.ARRENDATARIO,
        },
      });

      await expect(
        service.update(1, {
          owner_id: 3,
        }),
      ).rejects.toThrow('El usuario indicado no tiene el rol de arrendador');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el corredor no existe', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);

      mockUserFindUnique.mockResolvedValueOnce(null);

      await expect(
        service.update(1, {
          agent_id: 99,
        }),
      ).rejects.toThrow('El corredor no existe');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el corredor está inactivo', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);

      mockUserFindUnique.mockResolvedValueOnce({
        id: 4,
        active: false,
        role: {
          name: Role.CORREDOR,
        },
      });

      await expect(
        service.update(1, {
          agent_id: 4,
        }),
      ).rejects.toThrow('El corredor está inactivo');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestError si el corredor no tiene rol CORREDOR', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);

      mockUserFindUnique.mockResolvedValueOnce({
        id: 4,
        active: true,
        role: {
          name: Role.ARRENDATARIO,
        },
      });

      await expect(
        service.update(1, {
          agent_id: 4,
        }),
      ).rejects.toThrow('El usuario indicado no tiene el rol de corredor');

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si la nueva dirección ya existe', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue({
        id: 99,
      });

      await expect(
        service.update(1, {
          address: 'Av. Apoquindo 999',
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('debe permitir cambiar la dirección si no existe otra propiedad con esa dirección', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue(null);

      mockUpdate.mockResolvedValue({
        ...mockProperty,
        address: 'Av. Apoquindo 999',
      });

      const result = await service.update(1, {
        address: ' Av. Apoquindo 999 ',
      });

      expect(result.address).toBe('Av. Apoquindo 999');

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          address: 'Av. Apoquindo 999',
          NOT: {
            id: 1,
          },
        },
        select: {
          id: true,
        },
      });
    });

    it('debe validar owner y agent en paralelo al actualizar', async () => {
      mockFindUnique.mockResolvedValue({
        id: 1,
        address: 'Av. Providencia 123',
      });

      mockContractFindFirst.mockResolvedValue(null);
      mockFindFirst.mockResolvedValue(null);

      mockUserFindUnique
        .mockResolvedValueOnce({
          id: 3,
          active: true,
          role: {
            name: Role.ARRENDADOR,
          },
        })
        .mockResolvedValueOnce({
          id: 4,
          active: true,
          role: {
            name: Role.CORREDOR,
          },
        });

      mockUpdate.mockResolvedValue({
        ...mockProperty,
        owner_id: 3,
        agent_id: 4,
      });

      await service.update(1, {
        owner_id: 3,
        agent_id: 4,
      });

      expect(mockUserFindUnique).toHaveBeenCalledTimes(2);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          owner_id: 3,
          agent_id: 4,
        },
      });
    });
  });
});
