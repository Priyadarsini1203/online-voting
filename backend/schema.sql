CREATE DATABASE IF NOT EXISTS college_vote;
USE college_vote;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(50),
  year VARCHAR(20),
  role ENUM('voter', 'admin') DEFAULT 'voter',
  has_voted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(50) NOT NULL,
  department VARCHAR(50),
  image_url VARCHAR(255),
  votes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  candidate_id INT,
  position VARCHAR(50),
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  election_status ENUM('live', 'stopped') DEFAULT 'stopped',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (id = 1)
);

INSERT IGNORE INTO settings (id, election_status) VALUES (1, 'stopped');

-- Default Admin (Password: admin)
INSERT IGNORE INTO users (student_id, name, password, role) 
VALUES ('admin', 'System Admin', '$2b$10$dCkGYnRDYwXxu6mG7U2D9uUpetUr13drL1Ab9PsRInIm5vPHlVpGe', 'admin');
