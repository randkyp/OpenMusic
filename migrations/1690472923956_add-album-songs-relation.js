exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint("songs", "fk_albumId_albums.id", {
    foreignKeys: {
      columns: "albumId",
      references: "albums(id)",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("songs", "fk_albumId_albums.id");
};
