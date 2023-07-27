require("dotenv").config();

const Hapi = require("@hapi/hapi");

const OpenMusicService = require("./services/postgres/OpenMusicService");

// albums
const albums = require("./api/albums");
const AlbumsValidator = require("./validator/albums");

// songs
const songs = require("./api/songs");
const SongsValidator = require("./validator/songs");

// users
const UsersService = require("./services/postgres/UsersService");
const users = require("./api/users");
const UsersValidator = require("./validator/users");

// error types for onPreResponse
const NotFoundError = require("./exceptions/NotFoundError");
const ClientError = require("./exceptions/ClientError");
const InvariantError = require("./exceptions/InvariantError");
const AuthenticationError = require("./exceptions/AuthenticationError");

const init = async () => {
  const openMusicService = new OpenMusicService();
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: openMusicService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: openMusicService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    // handle defined error conditions
    if (
      response instanceof ClientError ||
      response instanceof NotFoundError ||
      response instanceof InvariantError ||
      response instanceof AuthenticationError
    ) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // log unexpected errors
    if (response instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(response);
      const newResponse = h.response({
        status: "error",
        ...response,
      });
      return newResponse;
    }

    // pass other errors and successful requests as-is
    return h.continue;
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
