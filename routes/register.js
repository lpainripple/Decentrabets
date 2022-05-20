const express = require('express');
const router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get("/", function (request, response) {
    if (request.session.loggedin == true) {
        console.log(
            `user ${request.session.username} tried to access register page... already logged in`
        );
        response.redirect("/home");
    } else {
        response.render("register.ejs", { message: request.flash("message") });
    }
});


//this function is asyncronous in case an encryption method is used
router.post("/register", async function (request, response) {
    //able to access because of app.use(expres...
    try {
        //const hashedPassword = await bcrypt.hash(request.body.password, 10);
        const username = request.body.username.toLowerCase();
        const email = request.body.email;
        //const password = hashedPassword;
        const password = request.body.password;

        pool.query(
            "INSERT into USERS (user_name, pass, address, email, balance) values ($1, $2, '', $3, 0);",
            [username, password, email],
            (error, results) => {
                if (error) {
                    if (error.code == 23505) {
                        console.log("user already exists...");
                        request.flash("message", "This user already exists");
                        response.redirect("/register");
                        //response.send(`The user ${username} already exists`);
                    } else {
                        throw error;
                    }
                } else {
                    console.log(
                        `The user was added: ${username} and password used: ${password} with the email: ${email}. Response: "${results.response}`
                    );

                    //Redirect to homepage
                    response.redirect("/login");
                }
            }
        );

        //TODO: CREATE WALLET
    } catch (exception) {
        response.redirect("/register");
        console.log(exception);
    }
});

module.exports = router;
