const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const NotFoundError = require("../../exceptions/NotFoundError");

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

    if (!result.rows.length) {
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

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui album. ID tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
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

  async getSongs() {
    const result = await this._pool.query("SELECT * FROM songs");
    // get all songs endpoint only needs to return these values
    return result.rows.map(({ id, title, performer }) => ({
      id,
      title,
      performer,
    }));
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("ID Song tidak ditemukan");
    }

    return result.rows[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    // note: quoting "albumId" is required since by default PostgreSQL changes
    // all column names to lowercase. in the future, just use snake_case for
    // all column names to avoid potential confusion and complications.
    const query = {
      text:
        "UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, " +
        'duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbaruhi song. ID tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Song gagal dihapus. ID tidak ditemukan");
    }
  }
}

module.exports = OpenMusicService;
