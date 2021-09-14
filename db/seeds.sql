INSERT INTO department (name)
VALUES 
('Marketing'),
('Research'),
('Design');

INSERT INTO role (title, salary, department_id)
VALUES
('Social media manager', 67.4, 1),
('Public relations', 58.9, 1),
('Head engineer', 95.6, 2),
('Software developer', 87.2, 2),
('Quality assurance', 75.5, 3),
('Product designer', 91.4, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Susan', 'Harrison', 4, NULL),
('Kevin', 'Vonschriltz', 4, 1),
('Jeffery', 'Bengford', 2, NULL),
('Katie', 'Simmons', 2, 3),
('Bill', 'Mesnick', 1, NULL),
('Morgan','Creed', 1, 5),
('Natalie', 'McCormick', 5, NULL),
('Conor', 'Hadley', 5, 7),
('Andy', 'Gregson', 3, NULL),
('Cindy', 'Wallace', 3, 9),
('Veronica', 'Evanoff', 6, NULL);