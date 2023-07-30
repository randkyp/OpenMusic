exports.up = (pgm) => {
  pgm.addConstraint("songs", "fk_album_id_albums.id", {
    foreignKeys: {
      columns: "album_id",
      references: "albums(id)",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("songs", "fk_album_id_albums.id");
};
