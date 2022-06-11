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