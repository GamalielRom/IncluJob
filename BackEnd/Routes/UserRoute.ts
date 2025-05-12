import express from 'express';
import {
  createUsersController,
  getAllUsersController,
  getUserByIDController,
  updateUserByIDController,
  deleteUserByIDController
} from '../Controllers/UserController';
import { validateRequest } from '../Middlewares/validateRequest';
import { body, param } from 'express-validator';

const router = express.Router();

// GET all users
router.get('/', getAllUsersController);

// GET user by ID (con validación opcional)
router.get(
  '/:id',
  [param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer')],
  validateRequest,
  getUserByIDController
);

// POST create user
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('country').notEmpty().withMessage('Country is required'),
    body('role_id').isInt({ gt: 0 }).withMessage('Role ID must be a positive integer')
  ],
  validateRequest,
  createUsersController
);

// PUT update user
router.put(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer'),
    // los campos de update son opcionales pero si vienen, deben ser válidos
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role_id').optional().isInt({ gt: 0 }).withMessage('Role ID must be a positive integer')
  ],
  validateRequest,
  updateUserByIDController
);

// DELETE user
router.delete(
  '/:id',
  [param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer')],
  validateRequest,
  deleteUserByIDController
);

export default router;
