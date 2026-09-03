import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { PropertiesController } from '../../properties/properties.controller';
import { PropertiesService } from '../../properties/properties.service';
import {
  CreatePropertyDto,
  PropertyDetailResponse,
  PropertyResponse,
  UpdatePropertyDto,
} from '../../properties/properties.types';

describe('PropertiesController', () => {
  let controller: PropertiesController;

  const createMock =
    jest.fn<(dto: CreatePropertyDto) => Promise<PropertyResponse>>();

  const getAllMock =
    jest.fn<
      (filters?: {
        status?: string;
        min_price?: number;
        max_price?: number;
        agent_id?: number;
        owner_id?: number;
      }) => Promise<PropertyResponse[]>
    >();

  const getByIdMock =
    jest.fn<(id: number) => Promise<PropertyDetailResponse>>();

  const updateMock =
    jest.fn<
      (id: number, dto: UpdatePropertyDto) => Promise<PropertyResponse>
    >();

  const propertiesService = {
    create: createMock,
    getAll: getAllMock,
    getById: getByIdMock,
    update: updateMock,
  } as PropertiesService;

  let req: Request;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
    } as unknown as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    controller = new PropertiesController(propertiesService);
  });

  describe('create', () => {
    it('debería crear una propiedad correctamente', async () => {
      const dto: CreatePropertyDto = {
        address: 'Av. Providencia 123',
        description: 'Departamento',
        monthly_rent: 500000,
        owner_id: 10,
        agent_id: 20,
      };

      const result: PropertyResponse = {
        id: 1,
        address: 'Av. Providencia 123',
        description: 'Departamento',
        monthly_rent: 500000,
        status: 'AVAILABLE',
        owner_id: 10,
        agent_id: 20,
        created_at: new Date(),
      };

      req.body = dto;

      createMock.mockResolvedValue(result);

      await controller.create(req, res);

      expect(createMock).toHaveBeenCalledWith(dto);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería crear una propiedad sin campos opcionales', async () => {
      const dto: CreatePropertyDto = {
        address: 'Av. Providencia 123',
        monthly_rent: 500000,
      };

      const result: PropertyResponse = {
        id: 1,
        address: 'Av. Providencia 123',
        description: null,
        monthly_rent: 500000,
        status: 'AVAILABLE',
        owner_id: null,
        agent_id: null,
        created_at: new Date(),
      };

      req.body = dto;

      createMock.mockResolvedValue(result);

      await controller.create(req, res);

      expect(createMock).toHaveBeenCalledWith({
        address: 'Av. Providencia 123',
        description: undefined,
        monthly_rent: 500000,
        owner_id: undefined,
        agent_id: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería propagar el error del servicio', async () => {
      const error = new Error('Error al crear propiedad');

      createMock.mockRejectedValue(error);

      await expect(controller.create(req, res)).rejects.toThrow(error);
    });
  });

  describe('getAll', () => {
    it('debería obtener todas las propiedades sin filtros', async () => {
      const result: PropertyResponse[] = [];

      req.query = {};

      getAllMock.mockResolvedValue(result);

      await controller.getAll(req, res);

      expect(getAllMock).toHaveBeenCalledWith({
        status: undefined,
        min_price: undefined,
        max_price: undefined,
        agent_id: undefined,
        owner_id: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería aplicar todos los filtros', async () => {
      const result: PropertyResponse[] = [];

      req.query = {
        status: 'AVAILABLE',
        min_price: '300000',
        max_price: '700000',
        agent_id: '10',
        owner_id: '20',
      };

      getAllMock.mockResolvedValue(result);

      await controller.getAll(req, res);

      expect(getAllMock).toHaveBeenCalledWith({
        status: 'AVAILABLE',
        min_price: 300000,
        max_price: 700000,
        agent_id: 10,
        owner_id: 20,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería aplicar solamente status', async () => {
      req.query = {
        status: 'ARRENDADA',
      };

      getAllMock.mockResolvedValue([]);

      await controller.getAll(req, res);

      expect(getAllMock).toHaveBeenCalledWith({
        status: 'ARRENDADA',
        min_price: undefined,
        max_price: undefined,
        agent_id: undefined,
        owner_id: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debería aplicar solamente min_price', async () => {
      req.query = {
        min_price: '300000',
      };

      getAllMock.mockResolvedValue([]);

      await controller.getAll(req, res);

      expect(getAllMock).toHaveBeenCalledWith({
        status: undefined,
        min_price: 300000,
        max_price: undefined,
        agent_id: undefined,
        owner_id: undefined,
      });
    });

    it('debería aplicar solamente max_price', async () => {
      req.query = {
        max_price: '700000',
      };

      getAllMock.mockResolvedValue([]);

      await controller.getAll(req, res);

      expect(getAllMock).toHaveBeenCalledWith({
        status: undefined,
        min_price: undefined,
        max_price: 700000,
        agent_id: undefined,
        owner_id: undefined,
      });
    });

    it('debería aplicar solamente agent_id', async () => {
      req.query = {
        agent_id: '10',
      };

      getAllMock.mockResolvedValue([]);

      await controller.getAll(req, res);

      expect(getAllMock).toHaveBeenCalledWith({
        status: undefined,
        min_price: undefined,
        max_price: undefined,
        agent_id: 10,
        owner_id: undefined,
      });
    });

    it('debería aplicar solamente owner_id', async () => {
      req.query = {
        owner_id: '20',
      };

      getAllMock.mockResolvedValue([]);

      await controller.getAll(req, res);

      expect(getAllMock).toHaveBeenCalledWith({
        status: undefined,
        min_price: undefined,
        max_price: undefined,
        agent_id: undefined,
        owner_id: 20,
      });
    });

    it('debería propagar el error del servicio', async () => {
      const error = new Error('Error al obtener propiedades');

      getAllMock.mockRejectedValue(error);

      await expect(controller.getAll(req, res)).rejects.toThrow(error);
    });
  });

  describe('getById', () => {
    it('debería obtener una propiedad por id', async () => {
      const result: PropertyDetailResponse = {
        id: 1,
        address: 'Av. Providencia 123',
        description: 'Departamento',
        monthly_rent: 500000,
        status: 'AVAILABLE',
        owner_id: 10,
        agent_id: 20,
        created_at: new Date(),
        contracts: [],
      };

      req.params = {
        id: '1',
      };

      getByIdMock.mockResolvedValue(result);

      await controller.getById(req, res);

      expect(getByIdMock).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería propagar el error del servicio', async () => {
      const error = new Error('Propiedad no encontrada');

      getByIdMock.mockRejectedValue(error);

      await expect(controller.getById(req, res)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('debería actualizar una propiedad correctamente', async () => {
      const dto: UpdatePropertyDto = {
        address: 'Nueva dirección',
        description: 'Nueva descripción',
        monthly_rent: 600000,
        status: 'AVAILABLE',
        owner_id: 10,
        agent_id: 20,
      };

      const result: PropertyResponse = {
        id: 1,
        address: 'Nueva dirección',
        description: 'Nueva descripción',
        monthly_rent: 600000,
        status: 'AVAILABLE',
        owner_id: 10,
        agent_id: 20,
        created_at: new Date(),
      };

      req.params = {
        id: '1',
      };

      req.body = dto;

      updateMock.mockResolvedValue(result);

      await controller.update(req, res);

      expect(updateMock).toHaveBeenCalledWith(1, dto);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería convertir el id a number', async () => {
      const dto: UpdatePropertyDto = {};

      const result: PropertyResponse = {
        id: 1,
        address: 'Av. Providencia 123',
        description: null,
        monthly_rent: 500000,
        status: 'AVAILABLE',
        owner_id: null,
        agent_id: null,
        created_at: new Date(),
      };

      req.params = {
        id: '1',
      };

      req.body = dto;

      updateMock.mockResolvedValue(result);

      await controller.update(req, res);

      expect(updateMock).toHaveBeenCalledWith(1, dto);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería permitir un DTO vacío', async () => {
      const result: PropertyResponse = {
        id: 1,
        address: 'Av. Providencia 123',
        description: null,
        monthly_rent: 500000,
        status: 'AVAILABLE',
        owner_id: null,
        agent_id: null,
        created_at: new Date(),
      };

      req.params = {
        id: '1',
      };

      req.body = {};

      updateMock.mockResolvedValue(result);

      await controller.update(req, res);

      expect(updateMock).toHaveBeenCalledWith(1, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('debería propagar el error del servicio', async () => {
      const error = new Error('Error al actualizar propiedad');

      updateMock.mockRejectedValue(error);

      await expect(controller.update(req, res)).rejects.toThrow(error);
    });
  });
});
