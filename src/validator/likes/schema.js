const Joi = require("joi");

const AlbumLikePayloadSchema = Joi.object({
  id: Joi.string().max(50).required(),
});

module.exports = AlbumLikePayloadSchema;
