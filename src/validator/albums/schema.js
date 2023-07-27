const Joi = require("joi");

const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  // reviewer suggestion: stricter year validation criteria
  year: Joi.number().integer().min(1900).max(currentYear).required(),
});

module.exports = { AlbumPayloadSchema };
