import { body } from 'express-validator';

export const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede superar los 100 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('Email inválido')
    .isLength({ max: 150 })
    .withMessage('El email no puede superar los 150 caracteres')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres'),

  body('role_id')
    .notEmpty()
    .withMessage('El rol es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El role_id debe ser un número entero positivo')
    .toInt(),
];
