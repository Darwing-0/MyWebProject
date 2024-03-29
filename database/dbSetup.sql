CREATE TABLE USERS(
userID int auto_increment,
firstname VARCHAR(100) NOT NULL,
lastname VARCHAR(100) NOT NULL,
password VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
height INT,
weight INT,
age INT,
constraint user_pk primary key(userID)
)

CREATE TABLE GOALS(
goalID int auto_increment,
userID int NOT NULL,
goalType ENUM('lose weight', 'maintain weight', 'gain weight') NOT NULL,
constraint goals_PK primary key(goalID),
constraint user_goals_fk foreign key(userID) references USERS(userID)
)

CREATE TABLE NUTRITIONPLANS(
planID int auto_increment,
userID int NOT NULL,
calorieGoal int NOT NULL,
proteinGoal int NOT NULL,
carbRatio int NOT NULL,
fatRatio int NOT NULL,
constraint nutrition_fk primary key(planID),
constraint user_nutrition_fk foreign key(userID) references USERS(userID)
)

CREATE TABLE WORKOUTROUTINE(
routineID int auto_increment,
goalID int NOT NULL,
routineName varchar(100) NOT NULL,
description varchar(500) NOT NULL,
duration int,
constraint routine_fk primary key(routineID),
constraint goal_routine_fk foreign key(goalID) references GOALS(goalID)
)