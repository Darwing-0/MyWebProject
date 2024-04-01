if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


// Libraries
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const mysql = require('mysql2')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const JWT_SECRET_KEY = 'Darwing'

// //  Huz Code
// creating the sql connection

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: "root",
    password: "admin123",
    database: "PersonalFitnessGen"
})


// Connect to mySQL
connection.connect((err) => {
    if (err) throw err;
    console.log("Successfully connected to SQL");
})



// //  Huz Code



const passport = require('passport')


const flash = require('express-flash')

const methodOverride = require('method-override')

const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const pool = require('./connector')

const app = express()



const initializePassport = require('./passport-config')
const { isUnboundRelationship } = require('neo4j-driver')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// don't forget to add database bellow
// const users = [ ]


// // Huz Code
// Insert the users from the array into the database

// users.forEach((users) => {
//     const {firstname, lastname, password, email} = user;

//     const query = `INSERT INTO users (firstname, lastname, password, email) VALUES (?, ?, ?, ?)`;
//     connection.query(query, [firstname, lastname, password, -email], (err, results))
// })

// // Huz Code

// Define the profiles array at the top of your server file
const profiles = [];




// Routes



app.set('View engine', 'ejs')
//app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

// Password 
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// Check Authentication
// function checkAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next()
//     }

//     res.redirect('/login')
// }

function isAuthenticated(req, res, next) {
    // check if the user is logged in

    if (req.session && req.session.authenticated) {
        return next();

    } else {
        return res.redirect('/login')
    }
}


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    return next()
}



//GET



// Guest
app.get('/guest', (req, res) => {
    // Handle the request for /guest
    res.render('guest.ejs');
});

// Login
// app.get('/', checkAuthenticated, (req, res) => {
//     res.render('index.ejs', { name: req.user.firstName })
// })


// app.get('/', (req, res) => {
//     res.render('index.ejs')
// })

app.get("/", isAuthenticated, (req, res) => {
    // check if the user is authenticated
    if (!req.session.email) {
        res.render('login.ejs')

    } else {
        res.render('index.ejs')
    }
    // res.render('index.ejs')
})

// app.get('/login', checkNotAuthenticated, (req, res) => {
//     res.render('login.ejs')
// })
app.get('/login', (req, res) => {
    // res.render('login.ejs')

    if (req.session.email) {
        return res.render('index.ejs', {firstname:req.session.firstname})

    }
    res.render('login.ejs')
})
// app.get('/index', (req, res) => {
//     res.render('index.ejs')
// })

// app.get('/login', (req, res) => {
//     res.render('login.ejs')
// })

// Register
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

// User information
app.get('/userProfile', (req, res) => {
    res.render('userProfile.ejs');
});

// Contact
app.get('/contact', (req, res) => {
    res.render('contact.ejs');
});

// About Us
app.get('/about', (req, res) => {
    res.render('about.ejs');
});

app.get('/community', (req, res) => {
    res.render('community.ejs')
}) 


// DELETE



// Logout
app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});



// POST


// app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true

// }))

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;


    // check if the user exists in the mysql database

    const sql = 'SELECT * FROM USERS WHERE email = ? AND password = ?';
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("Error querying user data from the database: ", err);
            return res.status(500).send("Internal Server Error");
        }

        if (results.length > 0) {
            const user = results[0]


            req.session.firstname = user.firstname
            req.session.email = user.email
            // User found, login successful
            // return res.send('Login Successful')
            //  res.redirect('/index')
            res.render('index.ejs', { firstname: user.firstname });

        } else {
            // User not found or credentials are incorrect
            return res.status(401).send('Invalid email or password');
        }
    })
})

// app.get("/", (req, res) => {
//     //check if the user is authenticated
//     if(req.session.userId){
//         res.send('Welcome to dashboard!')
//     } else {
//         res.redirect('/login')
//     }
// })


// Route for user registration
app.post('/register', async (req, res) => {

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    //    const hashedPassword = await bcrypt.hash(password, 10);

    const password = req.body.password;


    console.log(firstName);

    // Inset the user data in the database

    const sql = 'INSERT INTO USERS (firstname, lastname, password, email) VALUES (?, ?, ?, ?)';

    connection.query(sql, [firstName, lastName, password, email], (err, result) => {
        if (err) {
            console.error("ERROR inserting user data into database", err);
            return res.status(500).send('Internal Server Error');
        }
        console.log("User data inserted into database", result);
        return res.send('Sign Up Successful')

    })



})


// Calculate
app.post('/calculate', (req, res) => {
    // Retrieve form data from the request
    const { heightFeet, heightInches, weight, age, goals } = req.body;

    // Perform calculations (you can replace this with your actual logic)
    const calories = calculateCalories(heightFeet, heightInches, weight, age, goals);
    const macronutrients = calculateMacronutrients(goals); // Replace with your logic

    // Render the result in a response or send it as JSON
    res.render('result.ejs', { calories, macronutrients });
});

//contact 
app.post('/contact', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    console.log("Gmail User:", process.env.GMAIL_USER); // Log Gmail User
    console.log("Gmail Pass:", process.env.GMAIL_PASS); // Log Gmail Pass

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: 'darwing.delva@gmail.com',
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Email sent:', info.response);
            res.send('Message received! We will get back to you soon. <a href="/">Home Page</a> ')
            //res.redirect('/');;
        }
    });
});


// User information
app.post('/userProfile', (req, res) => {
    // Retrieve information from the form
    // const height = req.body.height;
    // const weight = req.body.weight;
    // const age = req.body.age;
    // const sex = req.body.sex;
    // const goals = req.body.goals;


    const { height, weight, age, sex, goals } = req.body
    const userEmail = req.session.email

    console.log(req.session);
    console.log(req.session.email);
    console.log(req.session.firstname);
    // const user = results[0]
    // console.log(user, "uu");
    // console.log(user.firstname, "fff");
    // req.session.firstname = user.firstname
    // req.session.email = user.email

    // update the user profile in the database

    const sql = 'UPDATE users SET height = ?, weight = ?, age = ?, sex = ?, goals = ? WHERE email = ?';

    connection.query(sql, [height, weight, age, sex, goals, userEmail], (err, results) => {


        if (err) {
            console.error("Error updating user profile in the database", err)
            return res.status(500).send("Internal Server SError")
        }

        // Profile updated successfully

        // res.render('userProfile.ejs')
        // res.send('Profile saved successfully! <a href="/">Home Page</a> ');
        res.render('index.ejs', { firstname: req.session.firstname });

    })


    // res.send('Profile saved successfully! <a href="/">Home Page</a> ');
});

app.post('/community', (req, res) => {
    const {title, content} = req.body

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ') // code to get the current timestamp
    connection.query('INSERT INTO posts (title, content, created_at) VALUES (?, ?, ?)', [title, content, createdAt], (err, result) => {
        if(err) {
            console.error('Error inserting post into database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('Post created successfully');
        res.json({message: "Post created successfully", postId: result.insertId})


    })

})

// Route to fetch all posts
app.get('/posts', (req, res) => {
    connection.query('SELECT * FROM posts ORDER BY created_at ASC', (err, posts) => {
        if(err){
            console.log("Error fetching posts from database:", err)
            res.status(500).json({error: "Internal Server Error"});
            return;
        }
        res.json(posts);
    })
})


app.get('/posts/:postId/comments', (req, res) => {
    const postId = req.params.postId;

    // query
    const sql = `
    SELECT comments.id AS comment_id, comments.content AS comment_content, comments.created_at AS comment_created_at, CONCAT(users.firstname, ' ', users.lastname) AS username
    
    FROM comments 
    JOIN users ON comments.id = users.userID
    WHERE comments.post_id = ?
    `;

    connection.query(sql, [postId], (err, comments) => {
        if(err){
            console.error("Error fetching comments:", err);
            return;
        }
        res.json(comments);
    })
})


// // Route to getch comments for a specific post
app.get('/posts/:postId/comments', (req, res) => {
    const postId = req.params.postId;

    connection.query('SELECT * FROM comments WHERE post_id = ?', [postId], (err, comments) => {
        if(err){
            console.error("Error fetching comments: ", err);
            res.status(500).json({error: "Internal Server Error"});
            return;
        }

        // send the fetch comments 
        res.json(comments);
    })

})

// Route to create a new comment
app.post('/comments', (req, res) => {
    const {postId, content} = req.body;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ') // Current date and time

    connection.query('INSERT INTO comments (post_id, content, created_at) VALUES (?, ?, ?)', [postId, content, createdAt], (err, result) => {

        if(err) {
            console.error('Error inserting comment into the database: ', err)
            res.status(500).json({error: "Internal Server Error"})
            return;
        }

        console.log("Comment Added Successfully");
        res.json({id: result.insertId, postId, content, created_at: createdAt})


    });

    
});

// Output saved profile information
app.get('/userProfile/output', (req, res) => {
    // Retrieve the last saved profile (assuming it's the latest one)
    const savedProfile = profiles[profiles.length - 1];

    // Render a template to display the saved profile information
    res.render('savedProfile.ejs', { profile: savedProfile, successMessage: "data saved" });
});

app.listen(process.env.Port || 3000)
app.listen(process.env.Port).keepAliveTimeout = 61 * 1000
