const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class ExportsHandler {
  constructor(playlistsService, service, validator) {
    // we need this to check for playlist existence and ownership
    this._playlistService = playlistsService;
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistSongsHandler(request, h) {
    // inputs: request.payload.targetEmail, {playlistId} = request.params,
    //         request.auth.credentials.id (requestee user ID from JWT)

    // validates request.payload.targetEmail
    this._validator.validateExportPlaylistSongsPayload(request.payload);

    if (!request.params.playlistId) {
      throw new ClientError("Playlist ID tidak boleh kosong.");
    }

    if (!request.auth.credentials.id) {
      throw new AuthenticationError("Kredensial yang anda berikan salah.");
    }

    const { playlistId } = request.params;
    const userId = request.auth.credentials.id;

    // check if playlist id exists and if playlist is owned by requestee
    await this._playlistService.verifyPlaylistOwner(
      request.params.playlistId,
      userId
    );

    const message = {
      userId,
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage(
      "export:playlists",
      JSON.stringify(message)
    );

    const response = h.response({
      status: "success",
      message: "Permintaan Anda sedang kami proses",
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
