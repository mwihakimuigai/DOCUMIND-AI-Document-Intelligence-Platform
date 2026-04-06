CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mime_type VARCHAR(120) NOT NULL,
  file_size INT NOT NULL,
  extracted_text LONGTEXT NOT NULL,
  summary TEXT,
  key_points JSON,
  important_sections JSON,
  tags JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
