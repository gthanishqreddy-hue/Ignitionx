const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../controllers/auth.controller');
const validate = require('../middleware/validate');

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must include uppercase, lowercase, and number'),
  validate,
], auth.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
], auth.login);

router.post('/logout', auth.logout);
router.post('/refresh-token', auth.refreshToken);
router.post('/forgot-password', [body('email').isEmail(), validate], auth.forgotPassword);
router.put('/reset-password/:token', [
  body('password').isLength({ min: 8 }),
  validate,
], auth.resetPassword);
router.get('/verify-email/:token', auth.verifyEmail);

const { protect } = require('../middleware/auth.middleware');
router.get('/me', protect, auth.getMe);

module.exports = router;
