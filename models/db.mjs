"use strict";

import { MongoClient } from "mongodb";
import Dotenv from "dotenv";
import debugModule from "debug";

Dotenv.config();

// fancy debug output package (everything will be prefixed with "project3:db")
const debug = debugModule("project3:db");

// connection URL
const uri = `mongodb+srv://${process.env.DB_HOST}/${process.env.DB_NAME}?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&tlsCertificateKeyFile=${encodeURIComponent(process.env.CERT_FILE)}`;

// represent the client
let _client;

/**
 * Connect to the DB for the first time
 * @returns {Promise<MongoClient>} a promise that resolves to the connected client
 */
export async function initDb() {
    if (_client) {
        debug("Trying to init DB again!");
        return _client;
    }
    
    _client = new MongoClient(uri);

    await _client.connect();
};

/**
 * Get the connected DB instance
 * @returns {Promise<Db>} a promise that resolves to the connected db
 */
export function getDB() {
    if (!_client) {
        throw new Error("Db has not been initialized. Please call init first.");
    }

    return _client.db(process.env.DB_NAME);
};

/**
 * Get the connected client instance
 * @returns {Promise<MongoClient>} a promise that resolves to the connected client
 */
export function getClient() {
    if (!_client) {
        throw new Error("Db has not been initialized. Please call init first.");
    }

    return _client;
}

/**
 * Close the connection to the DB
 */
export async function closeDb() {
    if (!_client) {
        throw new Error("Db has not been initialized. Please call init first.");
    }
    await _client.close();
};
