/**
 * This script is used to clear and reset the MongoDB database being 
 * used for Project 3.  It will populate the database with the same
 * content used as the starter code for Project 2
 * 
 * When running this script, you can choose to enter a password for users
 * by setting CHOOSE_PASSWORD=1 in your .env file.  Otherwise, the password
 * will be set to "password" for all users.
 */

"use strict";

import argon2 from "argon2";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import debugModule from "debug";
import prompt from "prompt-sync";

dotenv.config();

const debug = debugModule("project3:initdb");
const error = debugModule("project3:error");
const input = prompt({ sigint: true });

const argon_config = {
    type: argon2.argon2id,
    memoryCost: 15360
};

// DB connection url
const url = `mongodb+srv://${process.env.DB_HOST}/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&tlsCertificateKeyFile=${encodeURIComponent(process.env.CERT_FILE)}`;

/**
 * This next part is just raw data. Scroll until END DATA
 * to see the remaining code.
 */

const users = [{
        "description": null,
        "name": "Choong-Soo Lee",
        "username": "choongsool",
        "email": "clee@stlawu.edu",
        "created": "2021-10-24T20:46:14.600Z",
        "followers_count": 2,
        "friends_count": 3,
        "favorites_count": 0,
        "statuses_count": 7,
        "profile_image_url": "/assets/profile/choong-soo.png",
        "friends": [
            "6113f86397c33ea86297ce48",
            "6175c4bf394d1cc271633aea",
            "6175c5c6394d1cc271633aeb"
        ],
        "_id": "6175c616394d1cc271633aec"
    },
    {
        "description": "My other computer is a Raspberry Pi",
        "name": "Ed Harcourt",
        "username": "ed",
        "email": "edharcourt@stlawu.edu",
        "created": "2021-10-24T20:40:31.511Z",
        "followers_count": 3,
        "friends_count": 1,
        "favorites_count": 2,
        "statuses_count": 3,
        "profile_image_url": "/assets/profile/ed.png",
        "favorited_slimes": [
            "6175cb4a969d515951edefa9",
            "6175ca53969d515951edefa6"
        ],
        "friends": [
            "6113f86397c33ea86297ce48"
        ],
        "_id": "6175c4bf394d1cc271633aea"
    },
    {
        "username": "kevinaangstadt",
        "email": "kangstadt@stlawu.edu",
        "favorites_count": 2,
        "followers_count": 3,
        "friends_count": 3,
        "profile_image_url": "/assets/profile/kevin.jpeg",
        "statuses_count": 3,
        "favorited_slimes": [
            "611fcaf640148d94e2a469c7",
            "6175c9e3969d515951edefa5"
        ],
        "created": "2021-08-31T16:30:35.111Z",
        "description": "I teach computer science and occasionally write programs.",
        "name": "Kevin Angstadt",
        "friends": [
            "6175c4bf394d1cc271633aea",
            "6175c5c6394d1cc271633aeb",
            "6175c616394d1cc271633aec"
        ],
        "_id": "6113f86397c33ea86297ce48"
    },
    {
        "description": "If your algorithms aren't in Jupyter Notebooks, I'm not talking to you.",
        "name": "Lisa Torrey",
        "username": "ltorrey",
        "email": "ltorrey@stlawu.edu",
        "created": "2021-10-24T20:44:54.755Z",
        "followers_count": 2,
        "friends_count": 3,
        "favorites_count": 1,
        "statuses_count": 1,
        "profile_image_url": "/assets/profile/lisa.jpeg",
        "favorited_slimes": [
            "6175c9e3969d515951edefa5"
        ],
        "friends": [
            "6175c616394d1cc271633aec",
            "6175c4bf394d1cc271633aea",
            "6113f86397c33ea86297ce48"
        ],
        "_id": "6175c5c6394d1cc271633aeb"
    }
];

const slimes = [{
        "_id": "611fcaf640148d94e2a469c7",
        "created_at": "2021-08-20T15:32:06Z",
        "text": "hello world #firstslime",
        "user_id_str": "6113f86397c33ea86297ce48",
        "reply_count": 1,
        "reslime_count": 2,
        "favorite_count": 1,
        "entities": {
            "hashtags": [
                "#firstslime"
            ],
            "user_mentions": [],
            "urls": [],
            "media": []
        }
    },
    {
        "_id": "6175c9a2969d515951edefa4",
        "created_at": "2021-10-24T21:01:22Z",
        "user_id_str": "6175c4bf394d1cc271633aea",
        "reslimed_status_id_str": "611fcaf640148d94e2a469c7",
    },
    {
        "_id": "6175c9e3969d515951edefa5",
        "created_at": "2021-10-24T21:02:27Z",
        "text": "Sabbatical is super nice. Not a care in the world.",
        "user_id_str": "6175c4bf394d1cc271633aea",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 2,
        "entities": {
            "hashtags": [],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    },
    {
        "_id": "6175c92c969d515951edefa3",
        "created_at": "2021-10-24T20:59:24Z",
        "text": "@KevinAAngstadt why am I on here?",
        "user_id_str": "6175c4bf394d1cc271633aea",
        "reply_count": 1,
        "reslime_count": 1,
        "favorite_count": 0,
        "entities": {
            "hashtags": [],
            "user_mentions": [
                "@KevinAAngstadt"
            ],
            "urls": [],
            "media": []
        },
        "in_reply_to_status_id_str": "611fcaf640148d94e2a469c7",
        "in_reply_to_user_id_str": "6113f86397c33ea86297ce48",
    },
    {
        "_id": "6175ca7a969d515951edefa7",
        "created_at": "2021-10-24T21:04:58Z",
        "user_id_str": "6175c5c6394d1cc271633aeb",
        "reslimed_status_id_str": "611fcaf640148d94e2a469c7",
    },
    {
        "_id": "6175ca53969d515951edefa6",
        "created_at": "2021-10-24T21:04:19Z",
        "text": "It's kinda cool that we have our own in-house Twitter clone #CSThoughts",
        "user_id_str": "6175c5c6394d1cc271633aeb",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 1,
        "entities": {
            "hashtags": [
                "#csthoughts"
            ],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    },
    {
        "_id": "6175cb4a969d515951edefa9",
        "created_at": "2021-10-24T21:08:25Z",
        "text": "@ed SlugFest is way better than any other bird-based platforms. That's for sure!",
        "user_id_str": "6113f86397c33ea86297ce48",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 1,
        "entities": {
            "hashtags": [],
            "user_mentions": [
                "@ed"
            ],
            "urls": [],
            "media": []
        },
        "in_reply_to_status_id_str": "6175c92c969d515951edefa3",
        "in_reply_to_user_id_str": "6175c4bf394d1cc271633aea",
    },
    {
        "_id": "6175cb11969d515951edefa8",
        "created_at": "2021-10-24T21:07:29Z",
        "user_id_str": "6113f86397c33ea86297ce48",
        "reslimed_status_id_str": "6175c92c969d515951edefa3",
    },
    {
        "_id": "6175ccbe969d515951edefaa",
        "created_at": "2021-10-24T21:14:38Z",
        "text": "On campus (September 1, 2021 at 09:49AM)",
        "user_id_str": "6175c616394d1cc271633aec",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 0,
        "entities": {
            "hashtags": [],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    },
    {
        "_id": "6175ccc7969d515951edefab",
        "created_at": "2021-10-24T21:14:47Z",
        "text": "Off campus (September 1, 2021 at 04:23PM)",
        "user_id_str": "6175c616394d1cc271633aec",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 0,
        "entities": {
            "hashtags": [],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    },
    {
        "_id": "6175ccd3969d515951edefac",
        "created_at": "2021-10-24T21:14:59Z",
        "text": "On campus (September 2, 2021 at 09:53AM)",
        "user_id_str": "6175c616394d1cc271633aec",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 0,
        "entities": {
            "hashtags": [],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    },
    {
        "_id": "6175ccde969d515951edefad",
        "created_at": "2021-10-24T21:15:10Z",
        "text": "Off campus (September 2, 2021 at 04:35PM)",
        "user_id_str": "6175c616394d1cc271633aec",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 0,
        "entities": {
            "hashtags": [],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    },
    {
        "_id": "6175cce8969d515951edefae",
        "created_at": "2021-10-24T21:15:20Z",
        "text": "On campus (September 3, 2021 at 09:37AM)",
        "user_id_str": "6175c616394d1cc271633aec",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 0,
        "entities": {
            "hashtags": [],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    },
    {
        "_id": "6175ccf1969d515951edefaf",
        "created_at": "2021-10-24T21:15:29Z",
        "text": "Off campus (September 3, 2021 at 02:35PM)",
        "user_id_str": "6175c616394d1cc271633aec",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 0,
        "entities": {
            "hashtags": [],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    },
    {
        "_id": "6175ccfa969d515951edefb0",
        "created_at": "2021-10-24T21:15:38Z",
        "text": "On campus (September 6, 2021 at 09:41AM)",
        "user_id_str": "6175c616394d1cc271633aec",
        "reply_count": 0,
        "reslime_count": 0,
        "favorite_count": 0,
        "entities": {
            "hashtags": [],
            "user_mentions": [],
            "urls": [],
            "media": []
        },
    }
];

////////////////////////////////////////////////////////////////////////////////
// END DATA
////////////////////////////////////////////////////////////////////////////////

/**
 * Delete existing users and add the default users.
 * @param {Db} db the database instance where we should insert the users 
 */
async function populateUsersCollection(db) {
    const col = db.collection("users");

    debug("Clearing exiting users...");
    const res = await col.deleteMany({});
    debug(`Cleared ${res.deletedCount} users.`);

    debug("Inserting users...");

    // loop over the array of user objects
    await Promise.all(users.map(async(usr) => {
        // we need a password for this user
        const password = process.env.CHOOSE_PASS ? input.hide(`Enter a password for ${usr.name} (echo is disabled): `) : "password";

        // turn this password into a cryptographically secure hash
        const hash = await argon2.hash(password, argon_config);

        // the _id field should be an ObjectID
        usr = {...usr,
            _id: new ObjectId(usr._id),
            password: hash
        };

        // Attempt to insert this into the collection
        try {
            await col.insertOne(usr);
            debug(`Inserted ${usr.username}.`);
        } catch (e) {
            error(`ERROR: Failed to insert ${usr.username}.`);
            error(e.message);
            process.exit(500);
        }
    }));

    debug("Inserted all users.");
}

/**
 * Clear and insert default slime data
 * @param {Db} db the database where we should insert all of the slimes
 */
async function populateSlimesCollection(db) {
    const col = db.collection("slimes");

    debug("Clearing existing slimes...");
    const res = await col.deleteMany({});
    debug(`Cleared ${res.deletedCount} slimes.`);

    debug("Inserting slimes...");
    // we need to replace _id with the ObjectID
    const updated_slimes = slimes.map((slime) => {
        return {...slime,
            _id: new ObjectId(slime._id)
        }
    });

    try {
        const insert_results = await col.insertMany(updated_slimes);
        debug(`Inserted ${insert_results.insertedCount} slimes.`);
    } catch (e) {
        error(`ERROR: Failed to insert slimes.`);
        error(e.message);
        process.exit(500);
    }
}

/**
 * Main function to execute the db initialization
 */
async function run() {
    debug("Verifying environment has correct fields...");
    ["DB_HOST", "DB_NAME", "CERT_FILE"].forEach(field => {
        if (!process.env[field]) {
            error(`ERROR: ${field} is missing from the environment. Check your .env configuration!`);
            process.exit(404);
        }
    });
    debug("Connecting to database...");
    const client = new MongoClient(url, {
        connectTimeoutMS: 1000
    });
    await client.connect();
    debug("Connected to database.");

    const db = client.db(process.env.DB_NAME);

    if ((await db.listCollections().toArray()).map(col => col.name).includes("sessions")) {
        debug("Deleting session store...");
        await db.dropCollection("sessions");
        debug("Deleted session store.");
    }

    await populateUsersCollection(db);
    await populateSlimesCollection(db);

    client.close();
}

run();