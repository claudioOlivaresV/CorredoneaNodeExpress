import { body, param } from 'express-validator';

export const rentalContractCreateValidator = [
  body('property_id')
    .notEmpty()
    .withMessage('La propiedad es obligatoria')
    .isInt({ min: 1 })
    .withMessage('El property_id debe ser un entero positivo')
    .toInt(),

  body('tenant_id')
    .notEmpty()
    .withMessage('El arrendatario es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El tenant_id debe ser un entero positivo')
    .toInt(),

  body('start_date')
    .notEmpty()
    .withMessage('La fecha de inicio es obligatoria')
    .isISO8601()
    .withMessage('La fecha de inicio debe tener un formato válido'),

  body('end_date')
    .notEmpty()
    .withMessage('La fecha de término es obligatoria')
    .isISO8601()
    .withMessage('La fecha de término debe tener un formato válido'),

  body('monthly_rent')
    .notEmpty()
    .withMessage('El arriendo mensual es obligatorio')
    .isFloat({ min: 1 })
    .withMessage('El arriendo mensual debe ser mayor que 0')
    .toFloat(),
];

export const rentalContractIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
];
