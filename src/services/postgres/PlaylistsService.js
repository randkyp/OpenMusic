const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");
// required to check for existence of songId in addPlaylistSong
const OpenMusicService = require("./OpenMusicService");
// instatntiate class so that we can call its methods
const openMusicService = new OpenMusicService();

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async addPlaylistSong(id, songId) {
    // we've verified whether the playlist exists and that the user is auth'd
    // in the handler, so now we verify if the song exists
    await openMusicService.getSongById(songId);

    // if so, insert into playlists_songs table
    // generate playlists_songs primary key/id
    const playlistSongId = `playlistSong-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id",
      values: [playlistSongId, id, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan dalam playlist");
    }
  }

  async getPlaylists(owner) {
    // join with users table to get username in playlist object body
    const query = {
      text: `SELECT playlists.id AS id, playlists.name AS name,
      users.username AS username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistSongs(id) {
    // first, query the playlist
    const queryPlaylist = {
      text: `SELECT playlists.id AS "id", playlists.name AS "name",
      users.username AS "username"
      FROM playlists
      JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };

    const playlistResult = await this._pool.query(queryPlaylist);

    // then query the songs inside that playlist
    const querySongs = {
      text: `SELECT songs.id AS "id", songs.title AS "title",
      songs.performer AS "performer"
      FROM playlists
      JOIN playlists_songs ON playlists_songs.playlist_id = playlists.id
      JOIN songs ON songs.id = playlists_songs.song_id
      WHERE playlists.id = $1;`,
      values: [id],
    };

    const songsResult = await this._pool.query(querySongs);

    // combine
    return {
      ...playlistResult.rows[0],
      songs: songsResult.rows.map((song) => ({
        id: song.id,
        title: song.title,
        performer: song.performer,
      })),
    };
  }

  async deletePlaylist(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist gagal dihapus. ID tidak ditemukan.");
    }
  }

  async deletePlaylistSong(id, songId) {
    const query = {
      text: `DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2
      RETURNING playlist_id`,
      values: [id, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu gagal dihapus. Lagu tidak ditemukan.");
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = PlaylistsService;
