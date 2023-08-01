const autoBind = require("auto-bind");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class LikesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  static _checkAuthentication(request) {
    if (!request.auth.credentials.id) {
      throw new AuthenticationError("Kredensial yang anda berikan salah.");
    }
    return request.auth.credentials.id;
  }

  async postAlbumLikeHandler(request, h) {
    const credentialId = LikesHandler._checkAuthentication(request);
    this._validator.validateAlbumLikePayload(request.params);
    const albumId = request.params.id;

    await this._service.addAlbumLike(credentialId, albumId);

    const response = h.response({
      status: "success",
      message: "Anda berhasil meyukai album tersebut",
    });

    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const credentialId = LikesHandler._checkAuthentication(request);
    this._validator.validateAlbumLikePayload(request.params);
    const albumId = request.params.id;

    await this._service.deleteAlbumLike(credentialId, albumId);

    return {
      status: "success",
      message: "Anda berhasil tidak menyukai album tersebut",
    };
  }

  async getAlbumLikesHandler(request, h) {
    this._validator.validateAlbumLikePayload(request.params);
    const albumId = request.params.id;

    const likesResult = await this._service.getAlbumLikes(albumId);

    if (likesResult.cached === "yes") {
      const response = h.response({
        status: "success",
        data: {
          likes: +likesResult.likes,
        },
      });
      response.header("X-Data-Source", "cache");
      return response;
    }

    return {
      status: "success",
      data: {
        likes: +likesResult.likes,
      },
    };
  }
}

module.exports = LikesHandler;
