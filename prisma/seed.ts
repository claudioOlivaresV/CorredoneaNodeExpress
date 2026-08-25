import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear roles
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrador del sistema',
    },
    {
      name: 'CORREDOR',
      description: 'Corredor de propiedades',
    },
    {
      name: 'ARRENDADOR',
      description: 'Propietario de una propiedad',
    },
    {
      name: 'ARRENDATARIO',
      description: 'Persona que arrienda una propiedad',
    },
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: {
        name: role.name,
      },
      update: {},
      create: role,
    });
  }

  // Buscar rol ADMIN
  const adminRole = await prisma.roles.findUnique({
    where: {
      name: 'ADMIN',
    },
  });

  if (!adminRole) {
    throw new Error('El rol ADMIN no existe');
  }

  // Credenciales desde .env
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son requeridos');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Crear ADMIN
  await prisma.users.upsert({
    where: {
      email,
    },
    update: {
      password: passwordHash,
      role_id: adminRole.id,
    },
    create: {
      name: 'Administrador',
      email,
      password: passwordHash,
      role_id: adminRole.id,
    },
  });

  console.log('Roles creados correctamente');
  console.log('Usuario administrador creado correctamente');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
