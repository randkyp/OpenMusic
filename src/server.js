require("dotenv").config();

const Hapi = require("@hapi/hapi");

const OpenMusicService = require("./services/postgres/OpenMusicService");

const albums = require("./api/albums");
const songs = require("./api/songs");
const AlbumsValidator = require("./validator/albums");
const SongsValidator = require("./validator/songs");

const NotFoundError = require("./exceptions/NotFoundError");
const ClientError = require("./exceptions/ClientError");
const InvariantError = require("./exceptions/InvariantError");

const init = async () => {
  const openMusicService = new OpenMusicService();

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
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    // handle defined error conditions
    if (
      response instanceof ClientError ||
      response instanceof NotFoundError ||
      response instanceof InvariantError
    ) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
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
