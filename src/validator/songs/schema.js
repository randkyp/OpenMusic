const Joi = require("joi");

const currentYear = new Date().getFullYear();

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  // reviewer suggestion: stricter year validation
  year: Joi.number().integer().min(1900).max(currentYear).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  // database schema for id is set to varchar(50)
  albumId: Joi.string().allow("").max(50),
});

module.exports = { SongPayloadSchema };
