const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class AuthenticationService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: "SELECT id, password FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);

    // username not found
    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial yang anda berikan salah.");
    }

    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    // wrong password
    if (!match) {
      throw new AuthenticationError("Kredensial yang anda berikan salah.s");
    }

    return id;
  }

  async addRefreshToken(token) {
    const query = {
      text: "INSERT INTO authentications VALUES($1)",
      values: [token],
    };

    await this._pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: "SELECT token FROM authentications WHERE token = $1",
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Refresh token tidak valid");
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: "DELETE FROM authentications WHERE token = $1",
      values: [token],
    };

    await this._pool.query(query);
  }
}

module.exports = AuthenticationService;
