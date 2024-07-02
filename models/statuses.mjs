import { MongoClient } from "mongodb";
import Dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { getUser } from "./user.mjs";

Dotenv.config();
let client = new MongoClient(`mongodb+srv://${process.env.DB_HOST}/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&tlsCertificateKeyFile=${encodeURIComponent(process.env.CERT_FILE)}`);
const slimes_coll = client.db(process.env.DB_NAME).collection("slimes");

// check whether our slimes is reslimed by the authenticated user
async function checkReslimed(slime_data, authenticatedUser){
    // see if reslime exists
    let reslime = await slimes_coll.findOne({
        reslimed_status_id_str : slime_data._id.toString()
    })
    //find the reslime
    if(slime_data.reslimed_status_id_str){
        reslime = await slimes_coll.findOne({
            reslimed_status_id_str : slime_data.reslimed_status_id_str
        })
    }
    // check to see if this slime belongs to us
    if(reslime){
        let resp = await getUser(reslime.user_id_str);
        if(resp.screen_name.substring(1) === authenticatedUser){
            return true;
        } 
        return false;
    }

    return false;
}
// remove unwanted fields
async function getReslimedData(slime_string, authenticatedUser){
    let reslimed_status_data = await getSlime(slime_string, authenticatedUser);
    delete reslimed_status_data.favorited;
    delete reslimed_status_data.reslimed;
    return reslimed_status_data;
}

// return boolean whether if this slime is favorited
function getFavorited(slime_data, authenticatedUserData){
    if(slime_data.reslimed_status_id_str){
        return authenticatedUserData.favorited_slimes ? authenticatedUserData.favorited_slimes.includes(slime_data.reslimed_status_id_str) : false
    }
   return authenticatedUserData.favorited_slimes ? authenticatedUserData.favorited_slimes.includes(slime_data._id.toString()) : false
}

//create the general slime object
export async function getSlime(slime_id, authenticatedUser){
    let slime_data = await slimes_coll.findOne({
        _id : new ObjectId(slime_id)
    })

    // check if slime doesn't exist 
    if (slime_data === null) {
        return null;
    }

    // get user data
    let user = await getUser(slime_data.user_id_str);
    let authenticatedUserData = await getUser(authenticatedUser);
    let slime_json = {
            "_id": slime_data._id,
            "created_at":  slime_data.created_at,
            "text": slime_data.text,
            "user_id_str": slime_data.user_id_str,
            "reslimed_status_id_str" : slime_data.reslimed_status_id_str,
            "reslimed_status" : slime_data.reslimed_status_id_str ? await getReslimedData(slime_data.reslimed_status_id_str,authenticatedUser): slime_data.reslimed_status_id_str,
            "reply_count": slime_data.reply_count,
            "reslime_count": slime_data.reslime_count,
            "favorite_count": slime_data.favorite_count,
            "entities": slime_data.entities,
            "in_reply_to_status_id_str" : slime_data.in_reply_to_status_id_str,
            "in_reply_to_user_id_str" : slime_data.in_reply_to_user_id_str,
            "id_str": slime_data._id,
            "user": user,
            "reslimed": await checkReslimed(slime_data,authenticatedUser),
            "favorited": getFavorited(slime_data, authenticatedUserData)
    }
    return slime_json;
}

// get slime's reslimes and return array of them
export async function getReslimes(slime_id, authenticatedUser,count) {
    let reslimes = await slimes_coll.find({
        reslimed_status_id_str: slime_id
    }).toArray();    

    let reslime_list = await Promise.all(reslimes.map(async (slime) => {
        return await getSlime(slime._id.toString(), authenticatedUser);
    }));
    // with undefined count it returns the whole thing
    return reslime_list.slice(0, count);
}

// get slime's replies and return array of them
export async function getReplies(slime_id, authenticatedUser, count) {
    let replies = await slimes_coll.find({
        in_reply_to_status_id_str: slime_id
    }).toArray();    

    let replies_list = await Promise.all(replies.map(async (slime) => {
        return await getSlime(slime._id.toString(), authenticatedUser);
    }));
    // with undefined count it returns whole thing
    return replies_list.slice(0, count);
}

// get a list of user slimes
export async function getUserTimeline(identifier, count, authenticatedUser){

    let user = await getUser(identifier); 
    let slimes = await slimes_coll.find({
        user_id_str : user.id_str.toString()    
    }).sort({created_at : -1}).toArray();
    
    let slimes_list = await Promise.all(slimes.map(async (slime) => {
        return await getSlime(slime._id.toString(), authenticatedUser);
    }));
    
    return slimes_list.slice(0, count);
}

export async function getHomeTimeline(identifier,count){
    let user = await getUser(identifier);
    let friends_list = user.friends;
    user.friends.push(user.id_str.toString());
    let slimes = await slimes_coll.find({
        user_id_str :   {
            $in : friends_list
        }
    }).sort({created_at : -1}).toArray();
    let slimes_list = await Promise.all(slimes.map(async (slime) => {
        return await getSlime(slime._id.toString(), identifier);
    }));
    return slimes_list.slice(0, count);
}

// gets all reslimes of an authenticated user's slimes
export async function getReslimesOfMe(identifier, count){
    let user = await getUser(identifier);
    let userSlimes = await slimes_coll.find({
        user_id_str : user.id_str.toString()    
    }).sort({created_at : -1}).toArray();

    let userSlimesId = []
    userSlimes.forEach(e => {
        userSlimesId.push(e._id.toString());
    });

    let reslimesOfMe = await slimes_coll.find({
        reslimed_status_id_str : {
            $in : userSlimesId
        },
        user_id_str : {
            $ne : user.id_str.toString()
        }
    }).sort({created_at : -1}).toArray();

    let slimes_list = await Promise.all(reslimesOfMe.map(async (slime) => {
        return await getSlime(slime._id.toString(), identifier);
    }));
    return slimes_list.slice(0, count);

}

// get all replies to all of a user's slimes
export async function getRepliesOfMe(identifier, count) {
    let user = await getUser(identifier);
    let userSlimes = await slimes_coll.find({
        user_id_str : user.id_str.toString()    
    }).sort({created_at : -1}).toArray();

    let userSlimesId = []
    userSlimes.forEach(e => {
        userSlimesId.push(e._id.toString());
    });

    let repliesOfMe = await slimes_coll.find({
        in_reply_to_status_id_str: {
            $in : userSlimesId
        },
        user_id_str : {
            $ne : user.id_str.toString()
        }
    }).sort({created_at : -1}).toArray();

    let slimes_list = await Promise.all(repliesOfMe.map(async (slime) => {
        return await getSlime(slime._id.toString(), identifier);
    }));

    return slimes_list.slice(0, count);
}

// get all activity for the authenticated user
// return a list of reply slimes and reslimes that 
//  are in response to the authenticated user's slimes
export async function getActivity(identifier, count) {
    let reslimes = await getReslimesOfMe(identifier, count);
    let replies = await getRepliesOfMe(identifier, count);
    let activity = reslimes.concat(replies);
    return activity;
}

export async function createSlime(status, reply_to, authenticatedUser){

    let user = await getUser(authenticatedUser);
    let replyUser = await getUser(reply_to);
    let hashtag = /^#[^ !@#$%^&*(),.?":{}|<>]*$/;
    let url = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    let mention = /^@[^ !@$%^&*(),.?":{}|<>]*$/;
    let hashtags = [];
    let urls = [];
    let mentions = [];

    let status_words = status.split(" ");
    status_words.forEach(async item => {
        if(item.match(hashtag)){
            //is a hashtag
            hashtags.push(hashtag);
        }
        if(item.match(url)){
            //is a url
            urls.push(url);
        }
        if(item.match(mention)){          
            //is a mention
            mentions.push(mention);
        }
    })

    //from chatgpt
    const currentUtcTime = new Date();

    // from chatgpt
    const created_at = currentUtcTime.toISOString();

    const slime = { 
        "created_at": created_at,
        "text": status,
        "user_id_str": user.id_str,
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 0,
        "entities": {
            "hashtags":hashtags,
            "user_mentions":mentions,
            "urls":urls,
            "media":[]
        },
        "in_reply_to_status_id_str" : reply_to,
        "in_reply_to_user_id_str" : replyUser.id_str
    }

    return slime;
}