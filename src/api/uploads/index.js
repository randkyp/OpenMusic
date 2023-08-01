const UploadsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "uploads",
  version: "1.0.0",
  register: async (server, { albumsService, service, validator }) => {
    const uploadsHandler = new UploadsHandler(
      albumsService,
      service,
      validator
    );
    server.route(routes(uploadsHandler));
  },
};
