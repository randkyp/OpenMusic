exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint("users", "uniq_users_username", {
    unique: "username",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("users", "uniq_users_username");
};
