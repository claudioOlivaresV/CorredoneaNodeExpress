import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { requireRole } from '../middleware/require-role.middleware';
import { Role } from '../constants/roles.enum';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import {
  propertyCreateValidator,
  propertyFiltersValidator,
  propertyIdValidator,
  propertyUpdateValidator,
} from './properties.validators';

const propertiesRouter = Router();
const propertiesService = new PropertiesService();

const propertiesController = new PropertiesController(propertiesService);
/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Gestión de propiedades
 */

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Crear una propiedad
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     description: Solo ADMIN y CORREDOR pueden crear propiedades.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - monthly_rent
 *             properties:
 *               address:
 *                 type: string
 *                 example: Av. Providencia 123
 *               description:
 *                 type: string
 *                 example: Departamento de 2 dormitorios
 *               monthly_rent:
 *                 type: number
 *                 example: 650000
 *               owner_id:
 *                 type: integer
 *                 example: 10
 *               agent_id:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       200:
 *         description: Propiedad creada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       409:
 *         description: La propiedad ya existe
 */
propertiesRouter.post(
  '/',
  propertyCreateValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  propertiesController.create,
);
/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Obtener propiedades
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         example: AVAILABLE
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         example: 300000
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         example: 800000
 *       - in: query
 *         name: agent_id
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: owner_id
 *         schema:
 *           type: integer
 *         example: 20
 *     responses:
 *       200:
 *         description: Lista de propiedades
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
propertiesRouter.get(
  '/',
  propertyFiltersValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  propertiesController.getAll,
);
/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Obtener una propiedad por ID
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Propiedad encontrada
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Propiedad no encontrada
 */
propertiesRouter.get(
  '/:id',
  propertyIdValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  propertiesController.getById,
);
/**
 * @swagger
 * /api/properties/{id}:
 *   patch:
 *     summary: Actualizar una propiedad
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 example: Av. Apoquindo 456
 *               description:
 *                 type: string
 *                 example: Departamento remodelado
 *               monthly_rent:
 *                 type: number
 *                 example: 700000
 *               status:
 *                 type: string
 *                 enum:
 *                   - AVAILABLE
 *                   - ARRENDADA
 *                   - MAINTENANCE
 *                   - INACTIVE
 *                 example: AVAILABLE
 *               owner_id:
 *                 type: integer
 *                 example: 10
 *               agent_id:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       200:
 *         description: Propiedad actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos o propiedad con contrato activo
 *       404:
 *         description: Propiedad no encontrada
 */
propertiesRouter.patch(
  '/:id',
  propertyIdValidator,
  propertyUpdateValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  propertiesController.update,
);
export default propertiesRouter;
