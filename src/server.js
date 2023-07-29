require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

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

// playlists
const PlaylistsService = require("./services/postgres/PlaylistsService");
const playlists = require("./api/playlists");
const PlaylistsValidator = require("./validator/playlists");

// authentications
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const authentications = require("./api/authentications");
const TokenManager = require("./services/tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");

// error types for onPreResponse
const NotFoundError = require("./exceptions/NotFoundError");
const ClientError = require("./exceptions/ClientError");
const InvariantError = require("./exceptions/InvariantError");
const AuthenticationError = require("./exceptions/AuthenticationError");

const init = async () => {
  const openMusicService = new OpenMusicService();
  const usersService = new UsersService();
  const playlistsService = new PlaylistsService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
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

    // pass along other responses as-is
    // note: boom TS types are... deficient:
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/19443
    // @ts-ignore
    if (!response.isBoom) {
      return h.continue;
    }

    // add custom error status message on Hapi-generated errors and log it
    const error = response;
    // eslint-disable-next-line no-console
    console.error(error);
    // @ts-ignore https://hapi.dev/api/?v=21.3.2#error-transformation
    error.output.payload.status = "error";
    return error;
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
