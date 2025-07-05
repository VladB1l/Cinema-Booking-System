CREATE TABLE IF NOT EXISTS viewers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    order_id INT
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    show_date DATE NOT NULL,
    seat_number INT NOT NULL,
    show_time TIME NOT NULL,
    movie_title VARCHAR(100) NOT NULL,
    movie_poster BYTEA
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    viewer_id INT REFERENCES viewers(id) ON DELETE CASCADE,
    ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO viewers (full_name, age, gender, order_id) VALUES
('John Doe', 25, 'male', 1),
('Jane Smith', 30, 'female', 2),
('Alex Johnson', 22, 'other', 3),
('Emily Davis', 27, 'female', 4),
('Chris Brown', 35, 'male', 5),
('Patricia Wilson', 28, 'female', 6),
('Michael Taylor', 32, 'male', 7),
('Sophia Martinez', 24, 'female', 8),
('James Anderson', 29, 'male', 9),
('Linda White', 26, 'female', 10);


INSERT INTO tickets (show_date, seat_number, show_time, movie_title, movie_poster) VALUES
('2024-12-18', 1, '18:30', 'The Matrix', pg_read_binary_file('/images/matrix.png')),
('2024-12-18', 2, '18:30', 'The Matrix', pg_read_binary_file('/images/matrix.png')),
('2024-12-18', 3, '20:00', 'Inception', pg_read_binary_file('/images/inception.png')),
('2024-12-19', 4, '20:00', 'Inception', pg_read_binary_file('/images/inception.png')),
('2024-12-19', 5, '19:00', 'Avatar', pg_read_binary_file('/images/avatar.png')),
('2024-12-20', 6, '19:00', 'Avatar', pg_read_binary_file('/images/avatar.png')),
('2024-12-20', 7, '21:00', 'Real Steel', pg_read_binary_file('/images/steel.png')),
('2024-12-21', 8, '21:00', 'Real Steel', pg_read_binary_file('/images/steel.png')),
('2024-12-21', 9, '18:30', 'Interstellar', pg_read_binary_file('/images/interstellar.png')),
('2024-12-22', 10, '18:30', 'Interstellar', pg_read_binary_file('/images/interstellar.png')),
('2024-12-22', 11, '20:00', 'The Matrix', pg_read_binary_file('/images/matrix.png')),
('2024-12-22', 12, '21:00', 'The Matrix', pg_read_binary_file('/images/matrix.png')),
('2024-12-23', 13, '19:30', 'Inception', pg_read_binary_file('/images/inception.png')),
('2024-12-23', 14, '21:00', 'Inception', pg_read_binary_file('/images/inception.png')),
('2024-12-24', 15, '20:00', 'Avatar', pg_read_binary_file('/images/avatar.png')),
('2024-12-24', 16, '21:30', 'Avatar', pg_read_binary_file('/images/avatar.png')),
('2024-12-25', 17, '19:00', 'Real Steel', pg_read_binary_file('/images/steel.png')),
('2024-12-25', 18, '20:30', 'Real Steel', pg_read_binary_file('/images/steel.png')),
('2024-12-26', 19, '19:30', 'Interstellar', pg_read_binary_file('/images/interstellar.png')),
('2024-12-26', 20, '21:00', 'Interstellar', pg_read_binary_file('/images/interstellar.png')),
('2024-12-27', 21, '20:00', 'The Matrix', pg_read_binary_file('/images/matrix.png')),
('2024-12-27', 22, '21:30', 'The Matrix', pg_read_binary_file('/images/matrix.png')),
('2024-12-28', 23, '19:00', 'Inception', pg_read_binary_file('/images/inception.png')),
('2024-12-28', 24, '20:30', 'Inception', pg_read_binary_file('/images/inception.png')),
('2024-12-29', 25, '19:30', 'Avatar', pg_read_binary_file('/images/avatar.png')),
('2024-12-29', 26, '21:00', 'Avatar', pg_read_binary_file('/images/avatar.png')),
('2024-12-30', 27, '18:30', 'Real Steel', pg_read_binary_file('/images/steel.png')),
('2024-12-30', 28, '20:00', 'Real Steel', pg_read_binary_file('/images/steel.png')),
('2024-12-31', 29, '18:30', 'Interstellar', pg_read_binary_file('/images/interstellar.png')),
('2024-12-31', 30, '20:00', 'Interstellar', pg_read_binary_file('/images/interstellar.png'));



INSERT INTO orders (viewer_id, ticket_id, order_date) VALUES
(1, 1, '2024-12-15 10:00:00'),
(2, 2, '2024-12-15 11:00:00'),
(3, 3, '2024-12-15 12:00:00'),
(4, 4, '2024-12-15 13:00:00'),
(5, 5, '2024-12-15 14:00:00'),
(6, 6, '2024-12-15 15:00:00'),
(7, 7, '2024-12-15 16:00:00'),
(8, 8, '2024-12-15 17:00:00'),
(9, 9, '2024-12-15 18:00:00'),
(10, 10, '2024-12-15 19:00:00');

