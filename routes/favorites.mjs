import express from "express";
import { getUserFavorites } from "../models/favorites.mjs";

const router = express.Router();

// checks if signed in
function isSignedIn(req){
    return req.session.username !== undefined;
}

// gets user's list of favorites based on provided user_id or screen_name
// default is to get current signed in user's favorited
// can request only a certain number back with a count parameter
router.get("/list.json", async (req, res) => {
    // check if signed in
    if(!isSignedIn(req)) {
        res.status(401);
        res.json({
            // must be signed in
        });
        return;
    }

    if(req.query.user_id && req.query.screen_name) {
        res.status(400);
        res.json({ });
    
    // if user_id is provided
    } else if(req.query.user_id) {
        
        // query mongo
        let favorited_slimes = await getUserFavorites(req.query.user_id, req.query.count, req.session.username);

        // check if provided UserID doesn't exist
        if (!favorited_slimes) {
            res.status(400);
            res.json({});
            return;
        }
        // otherwise successful
        res.status(200);
        res.json(favorited_slimes);
    // if screen_name is provided
    } else if (req.query.screen_name) {
        // query mongo
        let favorited_slimes = await getUserFavorites(req.query.screen_name, req.query.count, req.session.username);
        // if username isn't showing up
        if (!favorited_slimes) {
            res.status(400)
            res.json({});
            return;
        }
        // otherwise successful
        res.status(200);
        res.json(favorited_slimes);
        
    // default behavior
    // neither params are given return authenticated (logged on user)
    } else {
        let favorited_slimes = await getUserFavorites(req.session.username, req.query.count, req.session.username);
        // should always be successful
        res.status(200);
        res.json(favorited_slimes);
    }
});
export default router;