const compression = require('compression');
import express from "express";
import {Request, Response} from 'express';
import session from "express-session";
import { SessionData } from "express-session";
const flash = require("express-flash");
const methodOverride = require("method-override");
const ejs = require("ejs");

import User from "./src/config/user";
const login = require("./src/login");
const config = require("./src/config")

const app = express();

app.use(compression())
app.use(express.json());
//allow us to access request variables in the post methods
app.use(express.urlencoded({ extended: true }));
app.use(express.static("node_modules/bootstrap/dist")) // bootstraps static files
app.use(express.static("public"));
app.use(flash());
app.use(methodOverride("_method"));

// setting the view folder for the jade files
app.set("views", "src");
// setting app engine
app.set("view engine", "ejs");

app.use(
    session(config.session)
);

declare module 'express-session' {
    interface SessionData {
        user: User;
    }
}

app.get("/", function (request: Request, response:Response) {
    response.redirect("/login");
});

app.use("/login", login);
//app.use("/register", register);

const port:number = 3300;
app.listen(port, () => {
    console.log(`server started on port: ${port}`);
});
