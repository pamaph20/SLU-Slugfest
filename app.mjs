"use strict";

import debugModule from 'debug';
import express from 'express';
import logger from 'morgan';
import session from 'express-session';
import mongoStore from 'connect-mongo';

import { initDb, getClient } from './models/db.mjs';
import apiRouter from './routes/api.mjs';
import favoritesRouter from './routes/favorites.mjs';
import userRouter from "./routes/user.mjs";
import statusesRouter from "./routes/statuses.mjs";

const debug = debugModule('project3:app.mjs');

//require("dotenv").config();
import dotenv from "dotenv"
dotenv.config();

// check that all three db variables are set in .env
console.log(process.env.DB_HOST)
if (!(process.env.DB_HOST && process.env.CERT_FILE && process.env.DB_NAME)) {
    console.error("Missing environment variables for Host, Certificate, and Database");
    process.exit(1);
}

// create the express app
const app = express();
// for testing, we will need to expos the server
export let server;

initDb().then(() => {
    // Create a connection for MongoDB storage of sessions
    const store = mongoStore.create({
        client: getClient(),
        dbName: process.env.DB_NAME,
        touchAfter: 24 * 3600 // time period in seconds
    });

    store.on('error', (err) => {
        console.error(err);
    });

    // secret for cookies
    const secret = "SLU CS332";
    var sess = {
        secret: secret,
        cookie: {},
        store: store,
        resave: false,
        saveUninitialized: false
    };

    // better handling of cookies for production deployments
    if (app.get('env') === 'production') {
        app.set('trust proxy', 1) // trust first proxy
        sess.cookie.secure = true // serve secure cookies
    }

    app.use(logger('dev'));
    app.use(express.json());
    app.use(session(sess));
    app.use(express.static("./public"));

    // set up the api middleware (see routes)
    app.use('/api/statuses', statusesRouter);
    app.use('/api/favorites',favoritesRouter);
    app.use('/api/user',userRouter);
    app.use('/api', apiRouter);

    // start the server
    const port = 3000;
    server = app.listen(port);

    // set up error handlers
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    };

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    };
});

export default app;
