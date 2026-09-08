import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { ContractController } from '../../contracts/contract.controller';
import { ContractsService } from '../../contracts/contract.service';
import {
  CreateRentalContractDto,
  RentalContractDetailResponse,
  RentalContractResponse,
} from '../../contracts/contract.types';

// ---------------------------------------------------------
// Mocks del servicio
// ---------------------------------------------------------

const createMock =
  jest.fn<(dto: CreateRentalContractDto) => Promise<RentalContractResponse>>();

const getByIdMock =
  jest.fn<(id: number) => Promise<RentalContractDetailResponse[]>>();

const cancelMock = jest.fn<(id: number) => Promise<RentalContractResponse>>();

// Mock parcial del ContractsService
const contractsService = {
  create: createMock,
  getById: getByIdMock,
  cancel: cancelMock,
} as unknown as ContractsService;

// ---------------------------------------------------------
// Tests
// ---------------------------------------------------------

describe('ContractController', () => {
  let controller: ContractController;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
    } as unknown as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    controller = new ContractController(contractsService);
  });

  // -------------------------------------------------------
  // CREATE
  // -------------------------------------------------------

  describe('create', () => {
    it('debe crear un contrato correctamente', async () => {
      const dto: CreateRentalContractDto = {
        property_id: 1,
        tenant_id: 5,
        start_date: '2026-09-15',
        end_date: '2027-08-20',
        monthly_rent: 650000,
      };

      const result: RentalContractResponse = {
        id: 10,
        property_id: 1,
        tenant_id: 5,
        start_date: new Date('2026-09-15'),
        end_date: new Date('2027-08-20'),
        monthly_rent: 650000,
        status: 'ACTIVE',
        created_at: new Date(),
      };

      req.body = dto;

      createMock.mockResolvedValue(result);

      await controller.create(req, res);

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({
        property_id: 1,
        tenant_id: 5,
        start_date: '2026-09-15',
        end_date: '2027-08-20',
        monthly_rent: 650000,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debe enviar solamente los campos esperados al servicio', async () => {
      const dto = {
        property_id: 2,
        tenant_id: 8,
        start_date: '2026-10-01',
        end_date: '2027-09-30',
        monthly_rent: 700000,
        status: 'CANCELLED',
      };

      const result: RentalContractResponse = {
        id: 20,
        property_id: 2,
        tenant_id: 8,
        start_date: new Date('2026-10-01'),
        end_date: new Date('2027-09-30'),
        monthly_rent: 700000,
        status: 'ACTIVE',
        created_at: new Date(),
      };

      req.body = dto;

      createMock.mockResolvedValue(result);

      await controller.create(req, res);

      expect(createMock).toHaveBeenCalledWith({
        property_id: 2,
        tenant_id: 8,
        start_date: '2026-10-01',
        end_date: '2027-09-30',
        monthly_rent: 700000,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debe propagar el error del servicio', async () => {
      const error = new Error('Error al crear contrato');

      req.body = {
        property_id: 1,
        tenant_id: 5,
        start_date: '2026-09-15',
        end_date: '2027-08-20',
        monthly_rent: 650000,
      };

      createMock.mockRejectedValue(error);

      await expect(controller.create(req, res)).rejects.toThrow(
        'Error al crear contrato',
      );

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------
  // GET BY ID
  // -------------------------------------------------------

  describe('getById', () => {
    it('debe obtener los contratos de una propiedad correctamente', async () => {
      const result: RentalContractDetailResponse[] = [
        {
          id: 10,
          start_date: new Date('2026-09-15'),
          end_date: new Date('2027-08-20'),
          monthly_rent: '650000',
          status: 'ACTIVE',

          property: {
            id: 1,
            address: 'Av. Providencia 123',
            description: 'Departamento 2 dormitorios',
            monthly_rent: '650000',
            status: 'ARRENDADA',

            owner: {
              id: 2,
              name: 'Juan Pérez',
              email: 'juan@test.com',
              role: {
                name: 'ARRENDADOR',
              },
            },

            agent: {
              id: 3,
              name: 'Pedro González',
              email: 'pedro@test.com',
              role: {
                name: 'CORREDOR',
              },
            },
          },

          tenant: {
            id: 5,
            name: 'Carlos Soto',
            email: 'carlos@test.com',
            role: {
              name: 'ARRENDATARIO',
            },
          },

          payments: [
            {
              id: 100,
              contract_id: 10,
              due_date: new Date('2026-09-30'),
              amount: '346667',
              paid_at: null,
              status: 'PENDING',
              created_at: new Date(),
            },
          ],
        },
      ];

      req.params = {
        id: '1',
      };

      getByIdMock.mockResolvedValue(result);

      await controller.getById(req, res);

      expect(getByIdMock).toHaveBeenCalledTimes(1);
      expect(getByIdMock).toHaveBeenCalledWith(1);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debe convertir el id de string a number', async () => {
      req.params = {
        id: '25',
      };

      const result: RentalContractDetailResponse[] = [];

      getByIdMock.mockResolvedValue(result);

      await controller.getById(req, res);

      expect(getByIdMock).toHaveBeenCalledWith(25);
      expect(typeof getByIdMock.mock.calls[0][0]).toBe('number');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debe propagar el error del servicio', async () => {
      const error = new Error('Contrato no encontrado');

      req.params = {
        id: '999',
      };

      getByIdMock.mockRejectedValue(error);

      await expect(controller.getById(req, res)).rejects.toThrow(
        'Contrato no encontrado',
      );

      expect(getByIdMock).toHaveBeenCalledWith(999);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------
  // CANCEL
  // -------------------------------------------------------

  describe('cancel', () => {
    it('debe cancelar un contrato correctamente', async () => {
      const result: RentalContractResponse = {
        id: 10,
        property_id: 1,
        tenant_id: 5,
        start_date: new Date('2026-09-15'),
        end_date: new Date('2027-08-20'),
        monthly_rent: 650000,
        status: 'CANCELLED',
        created_at: new Date(),
      };

      req.params = {
        id: '10',
      };

      cancelMock.mockResolvedValue(result);

      await controller.cancel(req, res);

      expect(cancelMock).toHaveBeenCalledTimes(1);
      expect(cancelMock).toHaveBeenCalledWith(10);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debe convertir el id de string a number', async () => {
      req.params = {
        id: '50',
      };

      const result: RentalContractResponse = {
        id: 50,
        property_id: 3,
        tenant_id: 8,
        start_date: new Date('2026-10-01'),
        end_date: new Date('2027-09-30'),
        monthly_rent: 700000,
        status: 'CANCELLED',
        created_at: new Date(),
      };

      cancelMock.mockResolvedValue(result);

      await controller.cancel(req, res);

      expect(cancelMock).toHaveBeenCalledWith(50);
      expect(typeof cancelMock.mock.calls[0][0]).toBe('number');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debe propagar el error del servicio', async () => {
      const error = new Error('Contrato no encontrado');

      req.params = {
        id: '999',
      };

      cancelMock.mockRejectedValue(error);

      await expect(controller.cancel(req, res)).rejects.toThrow(
        'Contrato no encontrado',
      );

      expect(cancelMock).toHaveBeenCalledWith(999);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
