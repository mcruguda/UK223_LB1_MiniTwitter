const ROLE_TABLE = `
CREATE TABLE IF NOT EXISTS \`roles\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`name\` VARCHAR(255) NOT NULL,
    PRIMARY KEY (\`id\`)
);
`

const USER_TABLE = `
CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`username\` VARCHAR(255) NOT NULL UNIQUE,
    \`password\` VARCHAR(255) NOT NULL,
    \`role_id\` INT NOT NULL,
    PRIMARY KEY (\`id\`),
    FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`)
);
`

const POST_TABLE = `
CREATE TABLE IF NOT EXISTS \`posts\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`content\` VARCHAR(255) NOT NULL,
    \`date\` DATE NOT NULL,
    \`user_id\` INT NOT NULL,
    PRIMARY KEY (\`id\`),
    FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
);
`

const COMMENT_TABLE = `
CREATE TABLE IF NOT EXISTS \`comments\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`content\` VARCHAR(255) NOT NULL,
    \`date\` DATE NOT NULL,
    \`comment_id\` INT,
    \`user_id\` INT,
    \`post_id\` INT,
    PRIMARY KEY (\`id\`),
    FOREIGN KEY (\`comment_id\`) REFERENCES comments(\`id\`),
    FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`),
    FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`)
);
`

const LIKE_TABLE = `
CREATE TABLE IF NOT EXISTS \`likes\` (
    \`user_id\` INT NOT NULL,
    \`post_id\` INT NOT NULL,
    \`isPositive\` BOOLEAN,
    PRIMARY KEY (\`post_id\`, \`user_id\`),
    FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`),
    FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
);
`

const CREATE_ROLES = `
INSERT INTO \`roles\`(\`name\`) VALUES ('User'), ('Administrator'), ('Moderator')
`

export {
  USER_TABLE,
  POST_TABLE as TWEET_TABLE,
  ROLE_TABLE,
  COMMENT_TABLE,
  LIKE_TABLE,
  CREATE_ROLES,
}
