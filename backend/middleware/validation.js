const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  register: Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{10,14}$/).required(),
    password: Joi.string().min(8).required(),
    passcode: Joi.string().length(4).pattern(/^\d+$/).required(),
    date_of_birth: Joi.date().max('now').required()
  }),

  validateAccount: Joi.object({
    account_number: Joi.string().length(10).pattern(/^\d+$/).required(),
    bank_code: Joi.string().min(3).max(10).required()
  }),

  transfer: Joi.object({
    account_number: Joi.string().length(10).pattern(/^\d+$/).required(),
    bank_code: Joi.string().min(3).max(10).required(),
    account_name: Joi.string().min(2).max(100).required(),
    amount: Joi.number().positive().min(50).max(1000000).required(),
    description: Joi.string().max(255).optional(),
    passcode: Joi.string().length(4).pattern(/^\d+$/).required()
  }),

  internalTransfer: Joi.object({
    recipient_account: Joi.string().length(10).pattern(/^\d+$/).required(),
    amount: Joi.number().positive().min(10).max(1000000).required(),
    description: Joi.string().max(255).optional(),
    passcode: Joi.string().length(4).pattern(/^\d+$/).required()
  }),

  changePasscode: Joi.object({
    old_passcode: Joi.string().length(4).pattern(/^\d+$/).required(),
    new_passcode: Joi.string().length(4).pattern(/^\d+$/).required()
  }),

  updateProfile: Joi.object({
    first_name: Joi.string().min(2).max(50).optional(),
    last_name: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{10,14}$/).optional(),
    address: Joi.string().max(500).optional()
  })
};

module.exports = {
  validateRequest,
  schemas
};
