import { prisma } from '../config/prismaConfig';
import { JwtService } from '../services/jwt.service';
import { CreatePropertyDto, PropertyResponse } from './properties.types';
import { BadRequestError, ConflictError } from '../errors/app.errors';
import { Role } from '../constants/roles.enum';

export class PropertiesService {
  constructor() {}

  async create(dto: CreatePropertyDto): Promise<any> {
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
        'Ya exisƒte una propiedad registrada con esa dirección',
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

    return property;
  }
}
