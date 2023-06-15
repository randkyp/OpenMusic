const Joi = require("joi");

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  // database schema for id is set to varchar(50)
  albumId: Joi.string().allow("").max(50),
});

module.exports = { SongPayloadSchema };
