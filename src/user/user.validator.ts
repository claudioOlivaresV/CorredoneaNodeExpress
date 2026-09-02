import { body, param } from 'express-validator';

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
export const userIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('El ID no es lo esperado'),
];

export const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede superar los 100 caracteres'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .isLength({ max: 150 })
    .withMessage('El email no puede superar los 150 caracteres')
    .normalizeEmail(),

  body('role_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El role_id debe ser un número entero positivo')
    .toInt(),
];
export const updatePasswordValidator = [
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres'),
];
