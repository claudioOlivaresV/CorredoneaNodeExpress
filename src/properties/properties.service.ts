import { prisma } from '../config/prismaConfig';
import { JwtService } from '../services/jwt.service';
import {
  CreatePropertyDto,
  PropertyDetailResponse,
  PropertyFilters,
  PropertyResponse,
  RentalContractStatus,
  UpdatePropertyDto,
} from './properties.types';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/app.errors';
import { Role } from '../constants/roles.enum';

export class PropertiesService {
  constructor() {}

  async create(dto: CreatePropertyDto): Promise<PropertyResponse> {
    // ---------------------------------------------------------
    // VALIDAR DIRECCIÓN DUPLICADA
    // ---------------------------------------------------------

    const address = dto.address.trim();

    const existingProperty = await prisma.properties.findFirst({
      where: {
        address,
      },
      select: {
        id: true,
      },
    });

    if (existingProperty) {
      throw new ConflictError(
        'Ya existe una propiedad registrada con esa dirección',
      );
    }

    // ---------------------------------------------------------
    // VALIDAR ARRIENDO
    // ---------------------------------------------------------

    if (dto.monthly_rent <= 0) {
      throw new BadRequestError('El arriendo mensual debe ser mayor que 0');
    }

    // ---------------------------------------------------------
    // VALIDAR OWNER Y AGENT EN PARALELO
    // ---------------------------------------------------------

    const [owner, agent] = await Promise.all([
      dto.owner_id !== undefined
        ? prisma.users.findUnique({
            where: {
              id: dto.owner_id,
            },
            select: {
              id: true,
              active: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          })
        : null,

      dto.agent_id !== undefined
        ? prisma.users.findUnique({
            where: {
              id: dto.agent_id,
            },
            select: {
              id: true,
              active: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          })
        : null,
    ]);

    // ---------------------------------------------------------
    // VALIDAR OWNER
    // ---------------------------------------------------------

    if (dto.owner_id !== undefined) {
      if (!owner) {
        throw new BadRequestError('El propietario no existe');
      }

      if (!owner.active) {
        throw new BadRequestError('El propietario está inactivo');
      }
      console.log('Propietario válido:', owner);
      console.log('Rol del propietario:', owner.role.name);

      if (owner.role.name !== Role.ARRENDADOR) {
        throw new BadRequestError(
          'El usuario indicado no tiene el rol de arrendador',
        );
      }
    }

    // ---------------------------------------------------------
    // VALIDAR AGENT
    // ---------------------------------------------------------

    if (dto.agent_id !== undefined) {
      if (!agent) {
        throw new BadRequestError('El corredor no existe');
      }

      if (!agent.active) {
        throw new BadRequestError('El corredor está inactivo');
      }

      if (agent.role.name !== Role.CORREDOR) {
        throw new BadRequestError(
          'El usuario indicado no tiene el rol de corredor',
        );
      }
    }

    // ---------------------------------------------------------
    // CREAR PROPIEDAD
    // ---------------------------------------------------------

    const property = await prisma.properties.create({
      data: {
        address,
        description: dto.description,
        monthly_rent: dto.monthly_rent,
        owner_id: dto.owner_id,
        agent_id: dto.agent_id,
      },
    });

    return {
      id: property.id,
      address: property.address,
      description: property.description,
      monthly_rent: Number(property.monthly_rent),
      status: property.status,
      owner_id: property.owner_id,
      agent_id: property.agent_id,
      created_at: property.created_at,
    };
  }
  async getAll(filters: PropertyFilters = {}): Promise<PropertyResponse[]> {
    const { status, min_price, max_price, agent_id, owner_id } = filters;

    const normalizedStatus = status?.toUpperCase();

    const properties = await prisma.properties.findMany({
      where: {
        ...(normalizedStatus && {
          status: normalizedStatus,
        }),

        ...(min_price !== undefined || max_price !== undefined
          ? {
              monthly_rent: {
                ...(min_price !== undefined && {
                  gte: min_price,
                }),

                ...(max_price !== undefined && {
                  lte: max_price,
                }),
              },
            }
          : {}),

        ...(agent_id !== undefined && {
          agent_id,
        }),

        ...(owner_id !== undefined && {
          owner_id,
        }),
      },

      orderBy: {
        created_at: 'desc',
      },
    });

    return properties.map((property) => ({
      id: property.id,
      address: property.address,
      description: property.description,
      monthly_rent: Number(property.monthly_rent),
      status: property.status,
      owner_id: property.owner_id,
      agent_id: property.agent_id,
      created_at: property.created_at,
    }));
  }
  async getById(id: number): Promise<PropertyDetailResponse> {
    const property = await prisma.properties.findUnique({
      where: {
        id,
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

    if (!property) {
      throw new NotFoundError('Propiedad no encontrada');
    }

    return {
      id: property.id,
      address: property.address,
      description: property.description,
      monthly_rent: Number(property.monthly_rent),
      status: property.status,
      owner_id: property.owner_id,
      agent_id: property.agent_id,
      created_at: property.created_at,

      contracts: property.contracts.map((contract) => ({
        id: contract.id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        status: contract.status as RentalContractStatus,
      })),
    };
  }

  async update(id: number, dto: UpdatePropertyDto): Promise<PropertyResponse> {
    // 1. Verificar que la propiedad exista
    const property = await prisma.properties.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        address: true,
      },
    });

    if (!property) {
      throw new NotFoundError('Propiedad no encontrada');
    }

    // 2. Consultas independientes en paralelo
    const [activeContract, owner, agent] = await Promise.all([
      prisma.rental_contracts.findFirst({
        where: {
          property_id: id,
          status: RentalContractStatus.ACTIVE,
        },
        select: {
          id: true,
        },
      }),

      dto.owner_id !== undefined
        ? prisma.users.findUnique({
            where: {
              id: dto.owner_id,
            },
            select: {
              id: true,
              active: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          })
        : null,

      dto.agent_id !== undefined
        ? prisma.users.findUnique({
            where: {
              id: dto.agent_id,
            },
            select: {
              id: true,
              active: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          })
        : null,
    ]);

    // 3. No permitir modificar propiedad con contrato activo
    if (activeContract) {
      throw new ForbiddenError(
        'No se puede modificar una propiedad que tiene un contrato activo',
      );
    }

    // 4. Validar propietario
    if (dto.owner_id !== undefined) {
      if (!owner) {
        throw new BadRequestError('El propietario no existe');
      }

      if (!owner.active) {
        throw new BadRequestError('El propietario está inactivo');
      }

      if (owner.role.name !== Role.ARRENDADOR) {
        throw new BadRequestError(
          'El usuario indicado no tiene el rol de arrendador',
        );
      }
    }

    // 5. Validar corredor
    if (dto.agent_id !== undefined) {
      if (!agent) {
        throw new BadRequestError('El corredor no existe');
      }

      if (!agent.active) {
        throw new BadRequestError('El corredor está inactivo');
      }

      if (agent.role.name !== Role.CORREDOR) {
        throw new BadRequestError(
          'El usuario indicado no tiene el rol de corredor',
        );
      }
    }

    // 6. Validar dirección solamente si viene en el update
    if (dto.address !== undefined) {
      const address = dto.address.trim();

      if (address !== property.address) {
        const existingProperty = await prisma.properties.findFirst({
          where: {
            address,
            NOT: {
              id,
            },
          },
          select: {
            id: true,
          },
        });

        if (existingProperty) {
          throw new ConflictError(
            'Ya existe una propiedad registrada con esa dirección',
          );
        }
      }
    }

    // 7. Actualizar
    const updatedProperty = await prisma.properties.update({
      where: {
        id,
      },
      data: {
        ...(dto.address !== undefined && {
          address: dto.address.trim(),
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.monthly_rent !== undefined && {
          monthly_rent: dto.monthly_rent,
        }),

        ...(dto.status !== undefined && {
          status: dto.status.toUpperCase(),
        }),

        ...(dto.owner_id !== undefined && {
          owner_id: dto.owner_id,
        }),

        ...(dto.agent_id !== undefined && {
          agent_id: dto.agent_id,
        }),
      },
    });

    return {
      id: updatedProperty.id,
      address: updatedProperty.address,
      description: updatedProperty.description,
      monthly_rent: Number(updatedProperty.monthly_rent),
      status: updatedProperty.status,
      owner_id: updatedProperty.owner_id,
      agent_id: updatedProperty.agent_id,
      created_at: updatedProperty.created_at,
    };
  }
}
