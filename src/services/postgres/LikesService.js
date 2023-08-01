const { Pool } = require("pg");
const NotFoundError = require("../../exceptions/NotFoundError");
const ClientError = require("../../exceptions/ClientError");

class LikesService {
  constructor(albumsService, cacheService) {
    this._pool = new Pool();
    this._albumsService = albumsService;
    this._cacheService = cacheService;
  }

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

    await this._cacheService.del(`omlikes:${albumId}`);
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

    await this._cacheService.del(`omlikes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`omlikes:${albumId}`);
      return { likes: result, cached: "yes" };
    } catch (error) {
      const query = {
        text: `SELECT COUNT(DISTINCT user_id) AS total_album_likes
        FROM user_album_likes WHERE album_id = $1`,
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = +result.rows[0].total_album_likes;

      await this._cacheService.set(`omlikes:${albumId}`, likes);

      return { likes, cached: "no" };
    }
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
