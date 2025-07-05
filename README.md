# Cinema Booking System (Docker-Based Test Project)

This project was created as a test system to explore and validate the use of Docker for containerizing a full-stack web application. It focuses on creating separate containers for the backend, frontend, and database, and ensuring their proper interaction through Docker Compose.

##  Project Structure

- **Frontend** – React-based user interface for booking movie tickets.
- **Backend** – Node.js/Express API that handles business logic and CRUD operations.
- **Database** – Includes configurations for both SQL (PostgreSQL) and NoSQL (MongoDB) setups.

##  Purpose

The primary goal of this project was to:

- Test how different containers (backend, frontend, and database) interact via `docker-compose`.
- Implement and verify full CRUD functionality.
- Experiment with different data persistence methods:
  - **Volume-based persistence** inside container directories.
  - **Cloud-based storage using AWS services** (e.g., S3 for data storage).
