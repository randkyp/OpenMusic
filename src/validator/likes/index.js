const AlbumLikePayloadSchema = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const LikesValidator = {
  validateAlbumLikePayload: (payload) => {
    const validationResult = AlbumLikePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = LikesValidator;
