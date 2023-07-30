const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const NotFoundError = require("../../exceptions/NotFoundError");

// TODO: Split this up into Songs and Albums service
class OpenMusicService {
  constructor() {
    this._pool = new Pool();
  }

  // start of album controllers
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("ID Album tidak ditemukan");
    }

    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui album. ID tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Album gagal dihapus. ID tidak ditemukan");
    }
  }

  // start of song controllers
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

  // optional feature: list songs that match album id given
  async querySongsByAlbumId(albumId) {
    const query = {
      text: "SELECT * FROM songs WHERE album_id = $1",
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = OpenMusicService;
