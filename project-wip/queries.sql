CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT FALSE
);

INSERT INTO tasks (title, priority)
VALUES ('learn SQL', 'high'),
       ('do a commit', 'low');

SELECT title FROM tasks
WHERE is_completed = FALSE;

UPDATE tasks
SET is_completed = TRUE
WHERE id = 1;

DELETE FROM tasks
WHERE priority = 'low';