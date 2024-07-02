import express from "express";
import {getSlime, getReslimes, getReplies, getUserTimeline, getReslimesOfMe,getHomeTimeline, getActivity, createSlime} from "../models/statuses.mjs"
import { ObjectId } from "mongodb";

const router = express.Router();

// checks if signed in
function isSignedIn(req){
    return req.session.username !== undefined;
}

// Returns a single slime, specified by the ID parameter. 
// The slime's auther will also be embedded withing the slime.
router.get("/show/:id.json", async (req, res) => {
    if(!isSignedIn(req)) {
        res.status(401);
        res.json({ }); 
        return;
    }
        try{
            new ObjectId(req.params.id)
        }
        catch{
            res.status(400);
            res.json({ });
            return
        }
        let slime_data = await getSlime(req.params.id, req.session.username);
        if(!slime_data) {
            res.status(404);
            res.json({ });
            return
        } 
        // finds user object
        res.status(200);
        res.json(slime_data);
});

// returns an array of slimes that are reslimse of the slime specified by the ID Parameter
router.get("/reslimes/:id.json", async (req, res) => {
    // check if signed in
    if(!isSignedIn(req)) {
        res.status(401);
        res.json({}); 
        return;
    }
    // check if id parameter is provided
    if(!req.params.id) {
        res.status(400);
        res.json({});
        return;
    }
    // validate slime ID
    if (await getSlime(req.params.id, req.session.username) === null) {
        res.status(400);
        res.json({});
        return;
    }
    // grab all reslimes
    let reslimes = await getReslimes(req.params.id, req.session.username, req.query.count);
    res.status(200);
    res.json(reslimes);

});

// returns an array of slimes that are replies to the slime specified by the ID parameter
router.get("/replies/:id.json", async (req, res) => {
    let id = req.params.id;
    // check if signed in
    if(!isSignedIn(req)) {
        res.status(400);
        res.json({}); 
        return;
    }

    // check if id parameter is provided
    if(!id) {
        res.status(400);
        res.json({});
    }

    // validate slime ID
    if (await getSlime(id, req.session.username) === null) {
        res.status(400);
        res.json();
    }

    // grab all reslimes
    let replies = await getReplies(id, req.session.username, req.query.count);
    res.status(200);
    res.json(replies);

});

// Returns a collection of the most recents slimes posted by the user indicated by the screen_name or user_id parameter. 
// If no user data is specified, return the timeline for the authenticated user.
router.get("/user_timeline.json", async (req, res) => {
    if(!isSignedIn(req)) {
        res.status(401);
        res.json({}); 
        return;
    }

    if(req.query.user_id && req.query.screen_name) {
        res.status(400);
        res.json({});
    
    // if user_id is provided
    } else if(req.query.user_id) {
        // query mongo
        let slimes_data = await getUserTimeline(req.query.user_id,req.query.count,req.session.username)
        // check if user doesn't exist
        if (!slimes_data) {
            res.status(400);
            res.json({});
            return;
        }
        // otherwise successful
        res.json(slimes_data);
    // if screen_name is provided
    } else if (req.query.screen_name) {
        // query mongo
        let slimes_data = await getUserTimeline(req.query.screen_name,req.query.count,req.session.username)
        // if username isn't showing up
        if (!slimes_data) {
            res.status(400)
            res.json({ });
            return;
        }

        // otherwise successful
        res.json(slimes_data);
        
    // default behavior
    // neither params are given return authenticated (logged on user)
    } else {
        let slimes_data = await getUserTimeline(req.session.username,req.query.count, req.session.username);
        // should always be successful
        res.json(slimes_data)
    }
});

// Returns a collection of the most recent slimes and reslimes posted by the authenticating user and the users they follow. 
// The home timeline is central to how most users interact with the SlugFest service.
router.get("/home_timeline.json", async (req, res) => {
    if(!isSignedIn(req)) {
        res.status(401);
        res.json({}); 
        return;
    }
    let slimes_data = await getHomeTimeline(req.session.username, req.query.count);
    res.json(slimes_data)
});

// Returns the most recent slimes authored by the authenticating user that have been reslimed by others. 
// This timeline is a subset of the user's timeline.
router.get("/reslimes_of_me.json", async (req,res) => {
    if(!isSignedIn(req)) {
        res.status(401);
        res.json({}); 
        return;
    }

    let slimes_data = await getReslimesOfMe(req.session.username, req.query.count);
    res.json(slimes_data)
});

// Returns the most recent slimes that are in reply to the authenticating user's 
//  slimes or are reslimes of the authenticating user's slimes. 
// This is useful as a list of notifications to the authenticating user.
router.get("/activity.json", async (req, res) => {
    // check if signed in
    if(!isSignedIn(req)) {
        res.status(401);
        res.json();
        return;
    }
    let activity = await getActivity(req.session.username, req.query.count);
    // check if user exists
    if (!activity) {
        res.status(400);
        res.json();
        return;
    }
    // otherwise successful
    res.status(200);
    res.json(activity);
});

router.post("/update", async (req, res) =>{
    if (!isSignedIn(req)) {
        res.status(401);
        res.json();
        return;
    }

    if(!req.params.status){
        res.status(400)
        res.json();
        return
    }
    let posted_slime = await createSlime(req.params.status,req.params.replu_to,req.session.username)
    res.json(posted_slime)
})

export default router;

