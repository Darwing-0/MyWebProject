CREATE TABLE USERS(
userID int auto_increment,
firstname VARCHAR(100) NOT NULL,
lastname VARCHAR(100) NOT NULL,
password VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
height INT,
weight INT,
age INT,
sex VARCHAR(100),
goals VARCHAR(100),
constraint user_pk primary key(userID)
);

CREATE TABLE GOALS(
goalID int auto_increment,
userID int NOT NULL,
goalType ENUM('lose weight', 'maintain weight', 'gain weight') NOT NULL,
constraint goals_PK primary key(goalID),
constraint user_goals_fk foreign key(userID) references USERS(userID)
);

CREATE TABLE NUTRITIONPLANS(
planID int auto_increment,
userID int ,
calorieGoal int NOT NULL,
proteinGoal int NOT NULL,
carbRatio int NOT NULL,
fatRatio int NOT NULL,
constraint nutrition_fk primary key(planID),
-- constraint user_nutrition_fk foreign key(userID) references USERS(userID)
);

CREATE TABLE WORKOUTROUTINE(
routineID int auto_increment,
goalID int NOT NULL,
routineName varchar(100) NOT NULL,
description varchar(500) NOT NULL,
duration int,
constraint routine_fk primary key(routineID),
constraint goal_routine_fk foreign key(goalID) references GOALS(goalID)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    user_id INT,  -- Added column to store user ID
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
);



CREATE TABLE posts (
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(255),
 content TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ALTER TABLE comments
-- ADD COLUMN user_id INT,
-- ADD CONSTRAINT fk_user_id
--     FOREIGN KEY (user_id)
--     REFERENCES users(userID);