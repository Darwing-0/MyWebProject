if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Libraries
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mysql = require("mysql2");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET_KEY = "Darwing";

const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "admin123",
  database: "PersonalFitnessGen",
});

// Connect to mySQL
connection.connect((err) => {
  if (err) throw err;
  console.log("Successfully connected to SQL");
});

const passport = require("passport");

const flash = require("express-flash");

const methodOverride = require("method-override");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const pool = require("./connector");

const app = express();

const initializePassport = require("./passport-config");
const { isUnboundRelationship } = require("neo4j-driver");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define the profiles array at the top of your server file
const profiles = [];

app.set("View engine", "ejs");
//app.use(express.urlencoded({ extended: false}))
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Password
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

function isAuthenticated(req, res, next) {
  // check if the user is logged in

  if (req.session && req.session.authenticated) {
    return next();
  } else {
    return res.redirect("/login");
  }
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return next();
}

//GET

// Guest
app.get("/guest", (req, res) => {
  // Handle the request for /guest
  res.render("guest.ejs");
});

app.get("/", isAuthenticated, (req, res) => {
  // check if the user is authenticated
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    res.render("index.ejs");
  }
  // res.render('index.ejs')
});

app.get("/login", (req, res) => {
  // res.render('login.ejs')

  if (req.session.email) {
    return res.render("index.ejs", { firstname: req.session.firstname });
  }
  res.render("login.ejs");
});

// Register
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

// User information
app.get("/userProfile", (req, res) => {
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    res.render("userProfile.ejs");
  }
});

// Contact
app.get("/contact", (req, res) => {
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    res.render("contact.ejs");
  }
});

// About Us
app.get("/about", (req, res) => {
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    res.render("about.ejs");
  }
});

app.get("/community", (req, res) => {
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    res.render("community.ejs");
  }
});
app.get("/goals", (req, res) => {
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    connection.query("SELECT * FROM goals", (err, results) => {
      if (err) {
        console.error("Error fetching goals: ", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.render("goals.ejs", { goals: results });
    });
  }
});

app.get("/workout/create", (req, res) => {
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    res.render("workout.ejs");
  }
});

app.get("/recommendations", (req, res) => {
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    res.render("recommendations.ejs");
  }
});

// Route to render nutrition plan page
app.get("/nutritionPlan", (req, res) => {
  if (!req.session.email) {
    res.render("login.ejs");
  } else {
    // Fetch existing nutrition plans from the database
    const selectQuery = `SELECT * FROM NUTRITIONPLANS`;
    connection.query(selectQuery, (err, results) => {
      if (err) {
        console.error(err);
        res.send("Error fetching nutrition plans");
      } else {
        res.render("nutritionplan.ejs", { plans: results });
      }
    });
  }
});
// DELETE

// Logout
app.delete("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check if the user exists in the mysql database

  const sql = "SELECT * FROM USERS WHERE email = ? AND password = ?";
  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Error querying user data from the database: ", err);
      return res.status(500).send("Internal Server Error");
    }

    if (results.length > 0) {
      const user = results[0];

      req.session.firstname = user.firstname;
      req.session.email = user.email;
      req.session.userID = user.userID;

      res.render("index.ejs", { firstname: user.firstname });
    } else {
      // User not found or credentials are incorrect
      return res.status(401).send("Invalid email or password");
    }
  });
});

// Route for user registration
app.post("/register", async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  //    const hashedPassword = await bcrypt.hash(password, 10);

  const password = req.body.password;

  console.log(firstName);

  // Inset the user data in the database

  const sql =
    "INSERT INTO USERS (firstname, lastname, password, email) VALUES (?, ?, ?, ?)";

  connection.query(
    sql,
    [firstName, lastName, password, email],
    (err, result) => {
      if (err) {
        console.error("ERROR inserting user data into database", err);
        return res.status(500).send("Internal Server Error");
      }
      console.log("User data inserted into database", result);
      return res.send("Sign Up Successful");
    }
  );
});

// Calculate
app.post("/calculate", (req, res) => {
  // Retrieve form data from the request
  const { heightFeet, heightInches, weight, age, goals } = req.body;

  // Perform calculations (you can replace this with your actual logic)
  const calories = calculateCalories(
    heightFeet,
    heightInches,
    weight,
    age,
    goals
  );
  const macronutrients = calculateMacronutrients(goals); // Replace with your logic

  // Render the result in a response or send it as JSON
  res.render("result.ejs", { calories, macronutrients });
});

//contact
app.post("/contact", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  console.log("Gmail User:", process.env.GMAIL_USER); // Log Gmail User
  console.log("Gmail Pass:", process.env.GMAIL_PASS); // Log Gmail Pass

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "darwing.delva@gmail.com",
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("Email sent:", info.response);
      res.send(
        'Message received! We will get back to you soon. <a href="/">Home Page</a> '
      );
      //res.redirect('/');;
    }
  });
});

// User information
app.post("/userProfile", (req, res) => {
  const { height, weight, age, sex, goals } = req.body;
  const userEmail = req.session.email;

  console.log(req.session);
  console.log(req.session.email);
  console.log(req.session.firstname);

  const sql =
    "UPDATE users SET height = ?, weight = ?, age = ?, sex = ?, goals = ? WHERE email = ?";

  connection.query(
    sql,
    [height, weight, age, sex, goals, userEmail],
    (err, results) => {
      if (err) {
        console.error("Error updating user profile in the database", err);
        return res.status(500).send("Internal Server SError");
      }

      res.render("index.ejs", { firstname: req.session.firstname });
    }
  );
});

app.post("/community", (req, res) => {
  const { title, content } = req.body;

  const createdAt = new Date().toISOString().slice(0, 19).replace("T", " "); // code to get the current timestamp
  connection.query(
    "INSERT INTO posts (title, content, created_at) VALUES (?, ?, ?)",
    [title, content, createdAt],
    (err, result) => {
      if (err) {
        console.error("Error inserting post into database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log("Post created successfully");
      res.json({
        message: "Post created successfully",
        postId: result.insertId,
      });
    }
  );
});

// Route to fetch all posts
app.get("/posts", (req, res) => {
  connection.query(
    "SELECT * FROM posts ORDER BY created_at ASC",
    (err, posts) => {
      if (err) {
        console.log("Error fetching posts from database:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(posts);
    }
  );
});

// Route to fetch comments for each post
app.get("/posts/:postId/comments", (req, res) => {
  const postId = req.params.postId;

  connection.query(
    "SELECT * FROM comments WHERE post_id = ?",
    [postId],
    (err, results) => {
      if (err) {
        console.error("Error fetching comments from the database: ", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      console.log("Comments Retrieved Successfully");
      res.json(results);
    }
  );
});

app.post("/comments", (req, res) => {
  const { postId, content } = req.body;
  const createdAt = new Date().toISOString().slice(0, 19).replace("T", " "); // Current date and time

  connection.query(
    "INSERT INTO comments (post_id, content, created_at) VALUES (?, ?, ?)",
    [postId, content, createdAt],
    (err, result) => {
      if (err) {
        console.error("Error inserting comment into the database: ", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      console.log("Comment Added Successfully");
      res.json({ id: result.insertId, postId, content, created_at: createdAt });
    }
  );
});

function getUserIDFromDatabase(username, password) {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT userID FROM users WHERE username = ? AND password = ?",
      [username, password],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length > 0) {
            resolve(results[0].userID);
          } else {
            resolve(null); // User not found or invalid credentials
          }
        }
      }
    );
  });
}

// Route to handle adding a new goal
app.post("/goals", (req, res) => {
  const { goalType } = req.body;
  // Assuming userID is obtained from the logged-in user's session
  const userID = req.session.userID;
  console.log(req.session, "SSSS");

  if (!userID) {
    console.error("User ID not found in session");
    res.status(401).send("Unauthorized");
    return;
  }

  const sql = "INSERT INTO goals (userID, goalType) VALUES (?, ?)";
  connection.query(sql, [userID, goalType], (err, result) => {
    if (err) {
      console.error("Error adding goal: ", err);
      res.status(500).send("Failed to add goal");
      return;
    }
    console.log("Goal added successfully");
    res.redirect("/goals"); // Redirect to goals page after adding goal
  });
});

// Route to handle editing a goal
app.get("/goals/:goalID/edit", (req, res) => {
  const goalID = req.params.goalID;
  // Fetch goal data from the database based on goalID (replace this with your actual function)
  const goalData = fetchGoalData(goalID); // Replace fetchGoalData with your actual function to fetch goal data
  if (!goalData) {
    res.status(404).send("Goal not found");
    return;
  }
  // Render the edit-goal.ejs template and pass the goal data to it
  res.render("edit-goal.ejs", { goal: goalData });
});

// Function to fetch goal data from the database based on goalID
function fetchGoalData(goalID, callback) {
  // Define the SQL query to fetch goal data
  const sql = "SELECT * FROM goals WHERE goalID = ?";
  // Execute the query with the goalID parameter
  connection.query(sql, [goalID], (err, results) => {
    if (err) {
      console.error("Error fetching goal data:", err);
      // If an error occurs, invoke the callback with the error
      callback(err, null);
      return;
    }
    // If data is found, return it
    if (results.length > 0) {
      // Invoke the callback with the retrieved data
      callback(null, results[0]);
    } else {
      // If no data is found for the given goalID, return null
      callback(null, null);
    }
  });
}

// Route to handle deleting a goal
app.get("/goals/:goalID/delete", (req, res) => {
  const goalID = req.params.goalID;

  // Execute SQL DELETE statement to delete the goal from the database
  connection.query(
    "DELETE FROM goals WHERE goalID = ?",
    [goalID],
    (err, result) => {
      if (err) {
        console.error("Error deleting goal from the database:", err);
        res.status(500).send("Error deleting goal");
        return;
      }
      // If deletion is successful, redirect to the goals page
      res.redirect("/goals");
    }
  );
});

// Route to handle the creation of workout routines
app.post("/workout/create", (req, res) => {
  const { goalID, routineName, description, duration } = req.body;

  // Insert the new workout routine into the database
  connection.query(
    "INSERT INTO WORKOUTROUTINE (goalID, routineName, description, duration) VALUES (?, ?, ?, ?)",
    [goalID, routineName, description, duration],
    (err, result) => {
      if (err) {
        console.error("Error creating workout routine:", err);
        res.status(500).send("Error creating workout routine");
        return;
      }
      res.redirect("/"); // Redirect to home page or any other appropriate page
    }
  );
});

// Route to handle form submission and insert data into the database
app.post("/createPlan", (req, res) => {
  const { userID, calorieGoal, proteinGoal, carbRatio, fatRatio } = req.body;
  const insertQuery = `INSERT INTO NUTRITIONPLANS (userID, calorieGoal, proteinGoal, carbRatio, fatRatio) VALUES (?, ?, ?, ?, ?)`;
  connection.query(
    insertQuery,
    [userID, calorieGoal, proteinGoal, carbRatio, fatRatio],
    (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error creating nutrition plan");
      } else {
        console.log("Nutrition plan created");
        res.redirect("/nutritionPlan");
      }
    }
  );
});

// Output saved profile information
app.get("/userProfile/output", (req, res) => {
  // Retrieve the last saved profile (assuming it's the latest one)
  const savedProfile = profiles[profiles.length - 1];

  // Render a template to display the saved profile information
  res.render("savedProfile.ejs", {
    profile: savedProfile,
    successMessage: "data saved",
  });
});

app.set("view engine", "ejs");
app.listen(process.env.Port || 3000);
app.listen(process.env.Port).keepAliveTimeout = 61 * 1000;
