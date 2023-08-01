require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const Inert = require("@hapi/inert");
const path = require("path");

// albums
const AlbumsService = require("./services/postgres/AlbumsService");
const albums = require("./api/albums");
const AlbumsValidator = require("./validator/albums");

// songs
const SongsService = require("./services/postgres/SongsService");
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

// exports
const _exports = require("./api/exports");
const ProducerService = require("./services/rabbitmq/ProducerService");
const ExportsValidator = require("./validator/exports");

// uploads
const uploads = require("./api/uploads");
const StorageService = require("./services/storage/StorageService");
const UploadsValidator = require("./validator/uploads");

// error types for onPreResponse
const ClientError = require("./exceptions/ClientError");

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const playlistsService = new PlaylistsService();
  const authenticationsService = new AuthenticationsService();
  const storageService = new StorageService(
    path.resolve(__dirname, "../uploads/covers/")
  );

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
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
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
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
    {
      plugin: _exports,
      options: {
        playlistsService,
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        albumsService,
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    // handle client error and its subclasses (InvariantError, etc)
    if (response instanceof ClientError) {
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
