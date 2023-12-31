const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async getSongs(queryParams) {
    const { title, performer } = queryParams;
    let query;

    if (title && performer) {
      query = {
        text:
          "SELECT id, title, performer FROM songs WHERE title ILIKE $1 " +
          "AND performer ILIKE $2",
        values: [`%${title}%`, `%${performer}%`],
      };
    } else if (title) {
      query = {
        text: "SELECT id, title, performer FROM songs WHERE title ILIKE $1",
        values: [`%${title}%`],
      };
    } else if (performer) {
      query = {
        text: "SELECT id, title, performer FROM songs WHERE performer ILIKE $1",
        values: [`%${performer}%`],
      };
    } else {
      // no query params, return all songs
      query = "SELECT id, title, performer FROM songs";
    }

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("ID Song tidak ditemukan");
    }

    return result.rows[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const query = {
      text: `UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, 
      duration = $5, album_id = $6 WHERE id = $7 RETURNING id`,
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbaruhi song. ID tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Song gagal dihapus. ID tidak ditemukan");
    }
  }
}

module.exports = SongsService;
