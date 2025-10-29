CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    googleId VARCHAR(255),
    email VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_google_id UNIQUE (googleId)
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_user_name ON projects(user_id, name);

CREATE TABLE goal_periods (
    period_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_type VARCHAR(20) UNIQUE NOT NULL 
);


CREATE TABLE goals (
    goal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    project_id UUID,
    period_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    target_hours NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_goals_project FOREIGN KEY (project_id) 
        REFERENCES projects(project_id) ON DELETE SET NULL,
    CONSTRAINT fk_goals_period FOREIGN KEY (period_id) 
        REFERENCES goal_periods(period_id) ON DELETE RESTRICT
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_project_id ON goals(project_id);
CREATE INDEX idx_goals_period_id ON goals(period_id);

-- Timelogs table
CREATE TABLE timelogs (
    timelog_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    goal_id UUID,
    start_time TIMESTAMP, -- Null for manual duration-only entries
    end_time TIMESTAMP, -- Null for manual duration-only entries
    duration_minutes INTEGER NOT NULL, -- Always required - calculated or manual
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timelogs_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_timelogs_project FOREIGN KEY (project_id) 
        REFERENCES projects(project_id) ON DELETE SET NULL,
    CONSTRAINT fk_timelogs_goal FOREIGN KEY (goal_id) 
        REFERENCES goals(goal_id) ON DELETE SET NULL,
    CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0),
    CONSTRAINT chk_end_after_start CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_timelogs_user_id ON timelogs(user_id);
CREATE INDEX idx_timelogs_project_id ON timelogs(project_id);
CREATE INDEX idx_timelogs_goal_id ON timelogs(goal_id);
CREATE INDEX idx_timelogs_start_time ON timelogs(start_time);
CREATE INDEX idx_timelogs_user_start ON timelogs(user_id, start_time);
