-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create study sessions table
CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    title VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create detection results table
CREATE TABLE detection_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    behaviors JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create focus metrics table
CREATE TABLE focus_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    avg_focus_score FLOAT NOT NULL,
    total_focus_time_minutes INTEGER NOT NULL,
    total_distracted_time_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user goals table
CREATE TABLE user_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL,
    target_value FLOAT NOT NULL,
    current_value FLOAT NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_detection_results_user_session ON detection_results(user_id, session_id);
CREATE INDEX idx_detection_results_timestamp ON detection_results(timestamp);
CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_focus_metrics_user_date ON focus_metrics(user_id, date);

