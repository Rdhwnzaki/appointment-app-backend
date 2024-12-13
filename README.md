# Backend API Documentation

## Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Database Schema](#database-schema)
- [Endpoints](#endpoints)
  - [Authentication](#authentication)
  - [Appointments](#appointments)
- [Setup Instructions](#setup-instructions)
- [Error Handling](#error-handling)

---

## Overview

This is a backend API for managing users and appointments with JWT-based authentication and timezone-aware scheduling. It ensures appointments are created within working hours (8:00 AM - 5:00 PM) and supports time zone conversions for users.

## Technologies Used

- Node.js
- Express
- Sequelize (PostgreSQL ORM)
- PostgreSQL
- JWT (JSON Web Tokens)
- moment-timezone
- cors

---

## Database Schema

### Users Table

| Field              | Type    | Constraints      |
| ------------------ | ------- | ---------------- |
| id                 | Integer | Primary Key      |
| name               | String  | Not Null         |
| username           | String  | Unique, Not Null |
| preferred_timezone | String  | Not Null         |

### Appointments Table

| Field      | Type    | Constraints |
| ---------- | ------- | ----------- |
| id         | Integer | Primary Key |
| title      | String  | Not Null    |
| start      | Date    | Not Null    |
| end        | Date    | Not Null    |
| creator_id | Integer | Foreign Key |

### UserAppointment Table (Pivot Table)

| Field          | Type    | Constraints |
| -------------- | ------- | ----------- |
| user_id        | Integer | Foreign Key |
| appointment_id | Integer | Foreign Key |

---

## Endpoints

### Authentication

#### POST `/login`

- **Description**: Logs in a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "string"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "token": "JWT_TOKEN"
    }
  }
  ```

---

### Appointments

#### GET `/appointments`

- **Description**: Fetches all appointments for the authenticated user, adjusted to their preferred timezone.
- **Headers**:
  - `Authorization: Bearer JWT_TOKEN`
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Appointments fetched successfully",
    "data": [
      {
        "id": 1,
        "title": "string",
        "start": "YYYY-MM-DD HH:mm",
        "end": "YYYY-MM-DD HH:mm",
        "creator_id": 1
      }
    ]
  }
  ```

#### POST `/appointments`

- **Description**: Creates a new appointment and invites users.
- **Headers**:
  - `Authorization: Bearer JWT_TOKEN`
- **Request Body**:
  ```json
  {
    "title": "string",
    "start": "YYYY-MM-DDTHH:mm:ssZ",
    "end": "YYYY-MM-DDTHH:mm:ssZ",
    "invitedUsers": [1, 2]
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Appointment created successfully",
    "data": {
      "id": 1,
      "title": "string",
      "start": "YYYY-MM-DD HH:mm",
      "end": "YYYY-MM-DD HH:mm",
      "creator_id": 1
    }
  }
  ```

---

## Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up PostgreSQL**:

   - Ensure PostgreSQL is installed and running.
   - Create a database named `healmity`.

4. **Configure Sequelize**:

   - Update the database connection string in the Sequelize initialization:
     ```js
     const sequelize = new Sequelize(
       "postgres://postgres:postgres@localhost:5432/healmity"
     );
     ```

5. **Run the Server**:

   ```bash
   node server.js
   ```

6. **Access the API**:
   - API runs on `http://localhost:5000` by default.

---

## Error Handling

- **Authentication Errors**:
  - `403`: No token provided.
  - `401`: Invalid token.
- **Validation Errors**:
  - `400`: Invalid input or scheduling outside working hours.
- **Resource Errors**:
  - `404`: User not found.
  - `500`: Internal server errors.

---

## Notes

- Time zone handling is managed with **moment-timezone**.
- JWT secret key is hardcoded for development purposes. Use environment variables in production.
- Add proper validations using libraries like **Joi** or **express-validator** for better input handling.
