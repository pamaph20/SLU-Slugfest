"use strict";

// data model for intereacting with user accounts
import { MongoClient } from "mongodb";
import argon2 from "argon2";
import { getDB } from "./db.mjs";
import sanitize from "mongo-sanitize";
import { ObjectId } from "mongodb";
import Dotenv from "dotenv";

Dotenv.config();

let client = new MongoClient(`mongodb+srv://${process.env.DB_HOST}/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&tlsCertificateKeyFile=${encodeURIComponent(process.env.CERT_FILE)}`);
const users_coll = client.db(process.env.DB_NAME).collection("users");

// configure the argon2 hash function to best practices
const argon_config = {
    type: argon2.argon2id,
    memoryCost: 15360 // in KiB
};

export async function createUser(username, password) {
    let check_user_existance = await coll.countDocuments({
        username: `${username}`
    });
    if (check_user_existance > 0) {
        return {
            "Error Code" : 404,
            "Message" : `user "${username}" already exists.`
        }
        
    } else {
        const coll = getDB().collection("users");
        // hash the password
        const user_data = {
            username: sanitize(username),
            password: await argon2.hash(password, argon_config)
        };
        const result = await coll.insertOne(user_data);
        return {
            ...user_data,
            _id: result.insertedId
        }
    }
}


export async function validate_user(username, password) {
    const coll =  getDB().collection("users");

    const user = await coll.findOne({
        username: sanitize(username)
    });

    // FIXME: what if user is not found?
    let check_user_existance = await coll.countDocuments({
        username: `${username}`
    });

    // check that that password matches the stored hash
    const verify = await argon2.verify(user.password, password);
    if (verify) {
        return {
            username: user.username,
            _id: user._id
        }
    } else {
        return false;
    }
}

export async function getUser(identifier){
    //possible fix location -- check to make sure things exist
    // check if given with a @
    if (identifier[0] === '@') {
        identifier = identifier.substring(1);
    }
        
    let user_data = await users_coll.findOne({
        username : identifier
    });
    try {
        if(!user_data){
            // last portion returned null - lets search by id instead
                user_data = await users_coll.findOne({
                _id: new ObjectId(identifier)
            })
        }
    } catch (e) {
        // either nothing was provided for indentifier
        // or user doesn't exist at all
        return undefined;
    }
    if(user_data){
        //if it exists
        let user_json = {
            "favorites_count": user_data.favorites_count,
            "followers_count": user_data.followers_count,
            "friends_count": user_data.friends_count,
            "profile_image_url": user_data.profile_image_url,
            "statuses_count": user_data.statuses_count,
            "favorited_slimes": user_data.favorited_slimes,
            "created": user_data.created,
            "description": user_data.description,
            "friends": user_data.friends,
            "id_str": new ObjectId(user_data._id),
            "name": user_data.name,
            "screen_name": `@${user_data.username}`
        }
        return user_json;
    }
    return user_data; 
}
export async function updateDisplayName(display_name, authenticatedUser) {
    let user = getUser(authenticatedUser);
    let result = users_coll.updateOne({username: user.username}, 
        { $set: {
            name: display_name
        }
    });
    return result;
}

// NOT PART OF THE SPEC - deletes users
export async function deleteUser(username, password, authenticatedUser) {
    let password_check = await argon2.hash(password, argon_config);
    if (password_check === user.password) {
        const result = await users_coll.deleteOne({
            username: username
        });
        return result;
    } else {
        return; // non-matching passwords
    }
}

// adds a new user to the users database
export async function registerUser(username, password) {
    const user = {
        _id: new ObjectId(),
        description: "",
        name: "",
        username: sanitize(username),
        email: "",
        created: "",
        followers_count: 0,
        friends_count: 0,
        favorites_count: 0,
        statuses_count: 0,
        profile_image_url: "../public/assets/profile/default_profile_image.jpg",
        favorited_slimes: [],
        friends: [],
        password: await argon2.hash(password, argon_config)
    };

    const result = await users_coll.insertOne(user);
    // return the todo object with an _id field 
    return {
        ...user,
        _id: result.insertedId,
        url: `/statuses/user/get.json?user_id=${result.insertedId}` 
    };
}