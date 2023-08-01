const { Pool } = require("pg");
const NotFoundError = require("../../exceptions/NotFoundError");
const ClientError = require("../../exceptions/ClientError");
// required to check existence of album
const AlbumsService = require("./AlbumsService");

class LikesService {
  constructor() {
    this._pool = new Pool();
    this._albumsService = new AlbumsService();
  }

  // TODO: caching
  async addAlbumLike(userId, albumId) {
    // query whether album exists (throws error when it's not found)
    await this._albumsService.getAlbumById(albumId);

    // query whether an user has liked a particular album first
    await this.getAlbumUserLike(userId, albumId);

    const query = {
      text: "INSERT INTO user_album_likes (user_id, album_id) VALUES ($1, $2)",
      values: [userId, albumId],
    };

    await this._pool.query(query);
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: `DELETE FROM user_album_likes WHERE user_id = $1 and album_id = $2
      RETURNING id`,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Anda belum meyukai album tersebut");
    }
  }

  async getAlbumLikes(albumId) {
    const query = {
      text: `SELECT COUNT(DISTINCT user_id) AS total_album_likes
      FROM user_album_likes WHERE album_id = $1`,
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].total_album_likes;
  }

  async getAlbumUserLike(userId, albumId) {
    const query = {
      text: `SELECT id FROM user_album_likes
      WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new ClientError("Anda telah menyukai album tersebut");
    }
  }
}

module.exports = LikesService;
