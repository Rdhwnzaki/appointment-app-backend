CREATE DATABASE healmity;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    username VARCHAR(255) UNIQUE NOT NULL,
    preferred_timezone VARCHAR(50) NOT NULL
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    creator_id INTEGER REFERENCES users(id),
    start TIMESTAMP NOT NULL,
    end TIMESTAMP NOT NULL
);

CREATE TABLE user_appointments (
    user_id INTEGER REFERENCES users(id),
    appointment_id INTEGER REFERENCES appointments(id),
    PRIMARY KEY (user_id, appointment_id)
);

INSERT INTO "Users" (name, username, preferred_timezone, "createdAt", "updatedAt")
VALUES
    ('Asep', 'asep', 'Asia/Jakarta', NOW(), NOW()),
    ('Agus', 'agus', 'Asia/Jayapura', NOW(), NOW()),
    ('Ujang', 'ujang', 'Pacific/Auckland', NOW(), NOW());