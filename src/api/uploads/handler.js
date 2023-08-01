const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");

class UploadsHandler {
  constructor(albumsService, service, validator) {
    // to update album table with cover location
    this._albumsService = albumsService;
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);
    if (!request.params.id) {
      throw new ClientError("Album ID tidak boleh kosong.");
    }

    const filename = await this._service.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/uploads/covers/${filename}`;

    // update cover location in db
    this._albumsService.updateAlbumCover(request.params.id, fileLocation);

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
