exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("playlists_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.addConstraint("playlists_songs", "fk_playlist_id_playlists.id", {
    foreignKeys: {
      columns: "playlist_id",
      references: "playlists(id)",
      onDelete: "CASCADE",
    },
  });

  pgm.addConstraint("playlists_songs", "fk_song_id_songs.id", {
    foreignKeys: {
      columns: "song_id",
      references: "songs(id)",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("playlists_songs", "fk_playlist_id_playlists.id");
  pgm.dropConstraint("playlists_songs", "fk_song_id_songs.id");
  pgm.dropTable("playlists_songs");
};
