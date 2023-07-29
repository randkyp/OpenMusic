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
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id",
      values: [playlistSongId, id, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan dalam playlist");
    }
  }

  async getPlaylists(owner) {
    /* returns the list of playlists created by that particular user:
    "playlists": [
      {
        "id": "playlist-xxx",
        "name": "nama playlist 1",
        "username": dicoding
      },
      {
        "id": "playlist-yyy",
        "name": "nama playlist 2",
        "username": dicoding
      }
    ] 
    
    */
    // join with users table to get username in playlist object body
    const query = {
      text: `SELECT playlists.id AS id, playlists.name AS name,
      users.username AS username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    // TODO: tweak results mapping to match expected object shape, get data into db first
    console.dir(result.rows, { depth: null, colors: true });
    return result.rows;
  }

  async getPlaylistSongs(id) {
    /* returns a single playlist and its linked songs -- don't return genre etc
      "playlist": {
        "id": "playlist-xxx",
        "name": "playlist title",
        "username": "dicoding",
        "songs": [
          {
            "id": "song-xxx",
            "title": "Track 01",
            "performer": "Unknown Artist",
          },
          {
            "id": "song-yyy",
            "title": "Track 02",
            "performer": "Unknown Artist"
          }
        ]
      }
    */
    const query = {
      text: `SELECT playlists.id AS playlist_id, playlists.name AS name,
      users.username AS username, songs.id AS id, songs.title AS title,
      songs.performer AS performer
      FROM playlists
      JOIN users ON users.id = playlists.owner
      JOIN playlist_songs ON playlist_songs."playlistId" = playlists.id
      JOIN songs ON songs.id = playlist_songs."songId"
      WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu playlist tidak ditemukan");
    }

    // TODO: tweak results mapping to match expected object shape, get data into db first
    console.dir(result.rows, { depth: null, colors: true });
    return result.rows;
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
      text: `DELETE FROM playlist_songs WHERE "playlistId" = $1
      AND "songId" = $2 RETURNING "playlistId"`,
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
