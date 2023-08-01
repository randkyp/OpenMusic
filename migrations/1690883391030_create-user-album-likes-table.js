exports.up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      // we don't really care about the id, let PSQL take care of it
      type: "SERIAL",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  // foreign keys
  pgm.addConstraint("user_album_likes", "fk_user_id_users.id", {
    foreignKeys: {
      columns: "user_id",
      references: "users(id)",
      onDelete: "CASCADE",
    },
  });

  pgm.addConstraint("user_album_likes", "fk_album_id_albums.id", {
    foreignKeys: {
      columns: "album_id",
      references: "albums(id)",
      onDelete: "CASCADE",
    },
  });

  // unique constraint - one user like per album
  pgm.addConstraint("user_album_likes", "u_user_album_likes_user_id_album_id", {
    unique: ["user_id", "album_id"],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("user_album_likes", "u_user_album_likes_user_id_album_id");
  pgm.dropConstraint("user_album_likes", "fk_user_id_users.id");
  pgm.dropConstraint("user_album_likes", "fk_album_id_albums.id");
  pgm.dropTable("user_album_likes");
};
