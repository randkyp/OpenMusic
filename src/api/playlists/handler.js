const autoBind = require("auto-bind");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class PlaylistsHandler {
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

  async postPlaylistHandler(request, h) {
    const credentialId = PlaylistsHandler._checkAuthentication(request);
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;

    const playlistId = await this._service.addPlaylist(name, credentialId);

    const response = h.response({
      status: "success",
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const credentialId = PlaylistsHandler._checkAuthentication(request);

    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: "success",
      data: {
        playlist: [...playlists],
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const credentialId = PlaylistsHandler._checkAuthentication(request);
    const { id } = request.params;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylist(id);

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  }

  async postPlaylistSongHandler(request, h) {
    const credentialId = PlaylistsHandler._checkAuthentication(request);
    const { id } = request.params;
    await this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.addPlaylistSong(id, songId);

    const response = h.response({
      status: "success",
      message: "Song berhasil ditambahkan dalam playlist",
    });

    response.code(201);
    return response;
  }

  async getPlaylistSongsByIdHandler(request) {
    const credentialId = PlaylistsHandler._checkAuthentication(request);
    const { id } = request.params;

    await this._service.verifyPlaylistOwner(id, credentialId);
    const result = await this._service.getPlaylistSongs(id);

    // TODO: match output object shape to desired result
    return {
      status: "success",
      data: {
        playlist: {
          id: result.playlist.playlist_id,
          name: result.playlist.name,
          username: result.playlist.username,
          songs: [...result.playlist.songs],
        },
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    const credentialId = PlaylistsHandler._checkAuthentication(request);
    const { id } = request.params;
    await this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistSong(id, songId);

    return {
      status: "success",
      message: "Lagu berhasil dihapus dari playlist.",
    };
  }
}

module.exports = PlaylistsHandler;
