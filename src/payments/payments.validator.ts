import { param } from 'express-validator';

export const paymentIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('El id del pago es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un entero positivo')
    .toInt(),
];
