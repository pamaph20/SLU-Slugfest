"use strict";

import express from "express";
import {validate_user} from "../models/user.mjs"

const router = express.Router();


// checks if signed in
function isSignedIn(req){
    return req.session.username !== undefined;
}


//Login Endpoint
router.post("/login", async (req, res) => { 
    const verification = await validate_user(req.body.username, req.body.password);
    if(verification){ 
        //validated user!
        req.session.username = req.body.username;
        req.session._id = verification._id
        res.status(200);
        res.json({
            "username": verification.username,
            "message": "Welcome to slugfest!"
        })
    }
    //user validation failed
    else {
        res.status(401);
        res.json({
            message: "Invalid username or password, please try again."
        })
    } 
});

//Logout Endpoint
router.get("/logout", async (req,res) => {
    if (!isSignedIn(req)) {
        res.status(401);
        res.json({
            //"message": "must be signed in to logout"
        });
        return
    }
    res.status(200);
    req.session.destroy();
    res.json({
        "message": "Goodbye!"
    });
});

export default router;