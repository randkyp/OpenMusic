const Joi = require("joi");

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongPayloadSchema = Joi.object({
  // database schema for song_id is set to varchar(50)
  songId: Joi.string().max(50).required(),
});

module.exports = { PlaylistPayloadSchema, PlaylistSongPayloadSchema };
