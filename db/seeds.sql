INSERT INTO department (name)
VALUES 
("Sales"),
("Engineering"),
("Finance"),
("Legal");

INSERT INTO role (title, salary, department_id)
VALUES
("Lead Sales Person", "90,000", 1),
("Sales Person", "75,000", 1),
("Head Engineer", "125,000", 2),
("Software Egineer", "100,000", 2),
("Head of Finance", "95,000", 3),
("Accountant", "85,000", 3),
("Managing Partner", "250,000", 4),
("Lawyer", "180,000", 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES 
("Tommy", "Joyce", 1),
("James", "Wylde", 2),
("Amanda", "Austen", 3),
("Hailey", "Thomas",4 ),
("Jaden", "Smith", 5),
("Hughe", "Orwell", 6),
("Jane", "Taylor", 7),
("Justin", "Dickens", 8),
("Mika", "Wolfe", 8),
("Sara", "Parker", 4);