import express from "express";
import {getUser, updateDisplayName, registerUser, deleteUser} from "../models/user.mjs"

const router = express.Router();


// checks if signed in
function isSignedIn(req){
    return req.session.username !== undefined;
}

// Returns information about a user specified by the user_id or screen_name parameter. 
// If no parameter is specified, return the authenticated user.
router.get("/get.json", async (req,res) => {
    if(!isSignedIn(req)) {
        res.status(401);
        res.json({
            //"message": "must be signed in to get information"
        }); 
        return;
    }
    // check if both are provide and return error message
    if(req.query.user_id && req.query.screen_name) {
        res.status(400);
        res.json();
    
    // if user_id is provided
    } else if(req.query.user_id) {
        
        // query mongo
        let user_data = await getUser(req.query.user_id)

        // check if user doesn't exist
        if (!user_data) {
            res.status(400);
            res.json();
            return;
        }

        // otherwise successful
        res.json(user_data);
        

    // if screen_name is provided
    } else if (req.query.screen_name) {
        
        // query mongo
        let screen_data = await getUser(req.query.screen_name)
    
        // if username isn't showing up
        if (!screen_data) {
            res.status(400)
            res.json();
            return;
        }

        // otherwise successful
        res.json(screen_data);
        
    // default behavior
    // neither params are given return authenticated (logged on user)
    } else {
        let user_data = await getUser(req.session.username);

        // should always be successful
        res.json(user_data);
    }
});
// Allows a user to create a new SlugFest user. 
// When creating a user, duplicate screen names are not allowed.
// Returns the created user when successful. 
// Returns a string describing the failure condition when unsuccessful.
router.post("/create.json", async (req, res) => {
    let check = await getUser(req.query.username)
    if (!check) {  
        let user = await registerUser(req.query.username, req.query.password);
        res.status(200);
        res.json(user);
        return;
    }

    // user already exists
    res.status(401);
    res.json({
        "message": "Username already taken."
    });
});

// NOT PART OF SPEC - delete users
router.delete("/delete.json", async (req, res) => {
    if(!isSignedIn(req)) {
        res.status(401);
        res.json();
        return;
    }

    let user = deleteUser(req.query.username, req.query.password, req.session.username);
    
    if (!user) {
        res.status(400);
        res.json({
            "message": "Incorrect username or password - cannot delete account"
        })
    }
});

// Update the "display name" for the authenticating user as specified by the display_name parameter.
// Returns the user object with the updated information upon success
router.put("/display-name.json", async (req, res) => {
    if (!isSignedIn(req)) {
        res.status(401);
        res.json();
        return;
    }
    return updateDisplayName(req.query.display_name, req.session.username);
});


export default router;