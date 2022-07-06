import {Request, Response} from 'express';
import express from "express";
import flash from 'express-flash';
import User from "../config/user";
const pool = require("../config/database");

const router = express.Router();
router
    .use(flash())
    .get("/", function (request:Request, response:Response) {
        let user:User | undefined = request.session.user;
        if (user) {
            response.redirect("/home");
        }
        response.render("login/login.ejs", { message: request.flash("message") });
    })
    .post("/", (request:Request, response:Response) => {
        const username = request.body.username.toLowerCase();
        const password = request.body.password;

        console.log(`attempting to login for user: ${username}...`);

        if (username && password) {
            console.log(`Input - username: ${username} / password: ${password}`);
            console.log(`running query...`);
            pool.query(
                "SELECT LOWER(user_name), pass, balance FROM users where user_name = $1 and pass = $2",
                [username, password],
                (error: any, results: { rows: any[]; rowCount: number; }) => {
                    if (error) {
                        console.log(error.stack);
                        throw error;
                    }
                    console.log(`query returned ${results.rowCount} rows`);
                    results.rows.forEach((element) => {
                        console.log(`Found user: ${element.user_name} in the database`);
                    });
                    if (results.rowCount == 1) {
                        let user:User | undefined = request.session.user;
                        if(!user) user = new User();
                        //Authentication
                        user.username = username;
                        user.balance = results.rows[0].balance;
                        console.log(
                            `session initialized for user ${user.username}... redirecting to home page`
                        );
                        //Redirect to homepage
                        response.redirect("/home");
                    } else {
                        request.flash("message", "Incorrect username or password");
                        response.redirect("/login");
                    }
                }
            );
        } else {
            response.send("Please enter username and password");
            response.end();
        }
    });

module.exports = router;
