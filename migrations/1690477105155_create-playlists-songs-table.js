exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlistId: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    songId: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint("playlist_songs", "fk_playlistId_playlists.id", {
    foreignKeys: {
      columns: "playlistId",
      references: "playlists(id)",
      onDelete: "CASCADE",
    },
  });

  pgm.addConstraint("playlist_songs", "fk_songId_songs.id", {
    foreignKeys: {
      columns: "songId",
      references: "songs(id)",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("playlist_songs", "fk_playlistId_playlists.id");
  pgm.dropConstraint("playlist_songs", "fk_songId_songs.id");
  pgm.dropTable("playlist_songs");
};
