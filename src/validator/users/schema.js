const Joi = require("joi");

const UserPayloadSchema = Joi.object({
  // reviewer's suggestion: match validation w/ db schema
  username: Joi.string().max(50).required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
