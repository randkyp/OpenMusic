const Joi = require("joi");

const ExportPlaylistSongsPayloadSchema = Joi.object({
  // joi.email() checks for valid TLDs by default
  targetEmail: Joi.string().email().required(),
});

module.exports = ExportPlaylistSongsPayloadSchema;
