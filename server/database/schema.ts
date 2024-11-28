const ROLE_TABLE = `
CREATE TABLE IF NOT EXISTS roles (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);
`

const USER_TABLE = `
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (id),
);
`

const POST_TABLE = `
CREATE TABLE IF NOT EXISTS posts (
    id INT NOT NULL AUTO_INCREMENT,
    content VARCHAR(255) NOT NULL,
    date: DATE NOT NULL,
    user_id: INT NOT NULL,
    PRIMARY KEY (id),
);
`

const COMMENT_TABLE = `
CREATE TABLE IF NOT EXISTS comments (
    id INT NOT NULL AUTO_INCREMENT,
    content VARCHAR(255) NOT NULL,
    date: DATE NOT NULL,
    comment_id: INT,
    user_id INT,
    post_id INT,
    PRIMARY KEY (id),
);
`

const LIKE_TABLE = `
CREATE TABLE IF NOT EXISTS likes (
    name VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    comment_id INT,
    PRIMARY KEY (post_id, comment_id, user_id),
);
`

export {
  USER_TABLE,
  POST_TABLE as TWEET_TABLE,
  ROLE_TABLE,
  COMMENT_TABLE,
  LIKE_TABLE,
}
