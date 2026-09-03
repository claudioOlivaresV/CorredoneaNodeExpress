import { query, body, param } from 'express-validator';

export const propertyCreateValidator = [
  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isLength({ max: 255 })
    .withMessage('La dirección no puede superar los 255 caracteres'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede superar los 1000 caracteres'),

  body('monthly_rent')
    .notEmpty()
    .withMessage('El arriendo mensual es obligatorio')
    .isFloat({ min: 1 })
    .withMessage('El arriendo mensual debe ser mayor que 0')
    .toFloat(),

  body('owner_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El owner_id debe ser un entero positivo')
    .toInt(),

  body('agent_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El agent_id debe ser un entero positivo')
    .toInt(),
];
export const propertyFiltersValidator = [
  query('status')
    .optional()
    .isString()
    .withMessage('El status debe ser un texto'),

  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .toFloat()
    .withMessage('El precio mínimo debe ser un número mayor o igual a 0'),

  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .toFloat()
    .withMessage('El precio máximo debe ser un número mayor o igual a 0'),

  query('agent_id')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('El agent_id debe ser un entero positivo'),

  query('owner_id')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('El owner_id debe ser un entero positivo'),
];

export const propertyIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
];
export const propertyUpdateValidator = [
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La dirección no puede estar vacía')
    .isLength({ max: 255 })
    .withMessage('La dirección no puede superar los 255 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede superar los 1000 caracteres'),

  body('monthly_rent')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('El arriendo mensual debe ser mayor que 0')
    .toFloat(),

  body('status')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['AVAILABLE', 'ARRENDADA', 'MAINTENANCE', 'INACTIVE'])
    .withMessage('El status no es válido'),

  body('owner_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El owner_id debe ser un entero positivo')
    .toInt(),

  body('agent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El agent_id debe ser un entero positivo')
    .toInt(),
];
