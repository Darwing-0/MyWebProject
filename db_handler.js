//  functions page that will handle all of the data that gets sent
//  in order to send, retrieve, update, delete or join data from the database.

                                                //USERS

// INSERT handler for USERS table
app.post('/users', (req, res) => {
    const { firstname, lastname, password, email, height, weight, age } = req.body;
    const sql = 'INSERT INTO USERS (firstname, lastname, password, email, height, weight, age) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [firstname, lastname, password, email, height, weight, age], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting user');
        }
        res.status(201).send('User inserted successfully');
    });
});

// GET handler for USERS table
app.get('/users/:userID', (req, res) => {
    const userID = req.params.userID;
    const sql = 'SELECT * FROM USERS WHERE userID = ?';
    connection.query(sql, [userID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving user');
        }
        res.json(result);
    });
});

// DELETE handler for USERS table
app.delete('/users/:userID', (req, res) => {
    const userID = req.params.userID;
    const sql = 'DELETE FROM USERS WHERE userID = ?';
    connection.query(sql, [userID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting user');
        }
        res.send('User deleted successfully');
    });
});

// UPDATE handler for USERS table
app.put('/users/:userID', (req, res) => {
    const userID = req.params.userID;
    const { firstname, lastname, password, email, height, weight, age } = req.body;
    const sql = 'UPDATE USERS SET firstname = ?, lastname = ?, password = ?, email = ?, height = ?, weight = ?, age = ? WHERE userID = ?';
    connection.query(sql, [firstname, lastname, password, email, height, weight, age, userID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating user');
        }
        res.send('User updated successfully');
    });
});

// JOIN handler to get user details along with associated nutrition plans
app.get('/user-nutrition/:userID', (req, res) => {
    const userID = req.params.userID;
    const sql = 'SELECT USERS.*, NUTRITIONPLANS.* FROM USERS INNER JOIN NUTRITIONPLANS ON USERS.userID = NUTRITIONPLANS.userID WHERE USERS.userID = ?';
    connection.query(sql, [userID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving user nutrition plans');
        }
        res.json(result);
    });
});


                                                //GOALS


// INSERT handler for GOALS table
app.post('/goals', (req, res) => {
    const { userID, goalType } = req.body;
    const sql = 'INSERT INTO GOALS (userID, goalType) VALUES (?, ?)';
    connection.query(sql, [userID, goalType], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting goal');
        }
        res.status(201).send('Goal inserted successfully');
    });
});

// GET handler for GOALS table
app.get('/goals/:goalID', (req, res) => {
    const goalID = req.params.goalID;
    const sql = 'SELECT * FROM GOALS WHERE goalID = ?';
    connection.query(sql, [goalID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving goal');
        }
        res.json(result);
    });
});

// DELETE handler for GOALS table
app.delete('/goals/:goalID', (req, res) => {
    const goalID = req.params.goalID;
    const sql = 'DELETE FROM GOALS WHERE goalID = ?';
    connection.query(sql, [goalID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting goal');
        }
        res.send('Goal deleted successfully');
    });
});

// UPDATE handler for GOALS table
app.put('/goals/:goalID', (req, res) => {
    const goalID = req.params.goalID;
    const { userID, goalType } = req.body;
    const sql = 'UPDATE GOALS SET userID = ?, goalType = ? WHERE goalID = ?';
    connection.query(sql, [userID, goalType, goalID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating goal');
        }
        res.send('Goal updated successfully');
    });
});

// JOIN handler to get user's goals along with their names
app.get('/user-goals/:userID', (req, res) => {
    const userID = req.params.userID;
    const sql = 'SELECT GOALS.*, USERS.firstname, USERS.lastname FROM GOALS INNER JOIN USERS ON GOALS.userID = USERS.userID WHERE GOALS.userID = ?';
    connection.query(sql, [userID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving user goals');
        }
        res.json(result);
    });
});

                                                //NUTRITIONPLANS


// INSERT handler for NUTRITIONPLANS table
app.post('/nutrition-plans', (req, res) => {
    const { userID, calorieGoal, proteinGoal, carbRatio, fatRatio } = req.body;
    const sql = 'INSERT INTO NUTRITIONPLANS (userID, calorieGoal, proteinGoal, carbRatio, fatRatio) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [userID, calorieGoal, proteinGoal, carbRatio, fatRatio], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting nutrition plan');
        }
        res.status(201).send('Nutrition plan inserted successfully');
    });
});

// GET handler for NUTRITIONPLANS table
app.get('/nutrition-plans/:planID', (req, res) => {
    const planID = req.params.planID;
    const sql = 'SELECT * FROM NUTRITIONPLANS WHERE planID = ?';
    connection.query(sql, [planID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving nutrition plan');
        }
        res.json(result);
    });
});

// DELETE handler for NUTRITIONPLANS table
app.delete('/nutrition-plans/:planID', (req, res) => {
    const planID = req.params.planID;
    const sql = 'DELETE FROM NUTRITIONPLANS WHERE planID = ?';
    connection.query(sql, [planID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting nutrition plan');
        }
        res.send('Nutrition plan deleted successfully');
    });
});

// UPDATE handler for NUTRITIONPLANS table
app.put('/nutrition-plans/:planID', (req, res) => {
    const planID = req.params.planID;
    const { userID, calorieGoal, proteinGoal, carbRatio, fatRatio } = req.body;
    const sql = 'UPDATE NUTRITIONPLANS SET userID = ?, calorieGoal = ?, proteinGoal = ?, carbRatio = ?, fatRatio = ? WHERE planID = ?';
    connection.query(sql, [userID, calorieGoal, proteinGoal, carbRatio, fatRatio, planID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating nutrition plan');
        }
        res.send('Nutrition plan updated successfully');
    });
});

// JOIN handler to get user's nutrition plan along with their name
app.get('/user-nutrition-plan/:userID', (req, res) => {
    const userID = req.params.userID;
    const sql = 'SELECT NUTRITIONPLANS.*, USERS.firstname, USERS.lastname FROM NUTRITIONPLANS INNER JOIN USERS ON NUTRITIONPLANS.userID = USERS.userID WHERE NUTRITIONPLANS.userID = ?';
    connection.query(sql, [userID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving user nutrition plan');
        }
        res.json(result);
    });
});


                                        //WORKOUTROUTINE

// INSERT handler for WORKOUTROUTINE table
app.post('/workout-routines', (req, res) => {
    const { goalID, routineName, description, duration } = req.body;
    const sql = 'INSERT INTO WORKOUTROUTINE (goalID, routineName, description, duration) VALUES (?, ?, ?, ?)';
    connection.query(sql, [goalID, routineName, description, duration], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting workout routine');
        }
        res.status(201).send('Workout routine inserted successfully');
    });
});

// GET handler for WORKOUTROUTINE table
app.get('/workout-routines/:routineID', (req, res) => {
    const routineID = req.params.routineID;
    const sql = 'SELECT * FROM WORKOUTROUTINE WHERE routineID = ?';
    connection.query(sql, [routineID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving workout routine');
        }
        res.json(result);
    });
});

// DELETE handler for WORKOUTROUTINE table
app.delete('/workout-routines/:routineID', (req, res) => {
    const routineID = req.params.routineID;
    const sql = 'DELETE FROM WORKOUTROUTINE WHERE routineID = ?';
    connection.query(sql, [routineID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting workout routine');
        }
        res.send('Workout routine deleted successfully');
    });
});

// UPDATE handler for WORKOUTROUTINE table
app.put('/workout-routines/:routineID', (req, res) => {
    const routineID = req.params.routineID;
    const { goalID, routineName, description, duration } = req.body;
    const sql = 'UPDATE WORKOUTROUTINE SET goalID = ?, routineName = ?, description = ?, duration = ? WHERE routineID = ?';
    connection.query(sql, [goalID, routineName, description, duration, routineID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating workout routine');
        }
        res.send('Workout routine updated successfully');
    });
});

// JOIN handler to get workout routines for a specific goal along with goal details
app.get('/goal-workout-routines/:goalID', (req, res) => {
    const goalID = req.params.goalID;
    const sql = 'SELECT WORKOUTROUTINE.*, GOALS.goalType FROM WORKOUTROUTINE INNER JOIN GOALS ON WORKOUTROUTINE.goalID = GOALS.goalID WHERE WORKOUTROUTINE.goalID = ?';
    connection.query(sql, [goalID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving goal workout routines');
        }
        res.json(result);
    });
});

