import mongoose from 'mongoose';
import app from './app';
import { Server as HTTPServer } from 'http';
import { server as webSocketServer } from 'websocket';
import config from './config';
import adminSeeder from './seeder/adminSeeder';
import startCourtReminderCron from './util/coateReminderCorn';

let server: HTTPServer;

const clients = new Map();
console.log('here are the clients *******>>>>>>>>>', clients);

async function main() {
  try {
    console.log('connecting to mongodb....⏳');
    await mongoose.connect(config.mongoose_uri);

    await adminSeeder();
    startCourtReminderCron();

    // Start Express server
    server = app.listen(config.port, () => {
      console.log(
        `Mr. Amin Lawyer server app listening on port ${config.port}`,
      );
    });

    //initialize web sockets server

    const wss = new webSocketServer({ httpServer: server });
    console.log("websocket========>>>>>>>", wss)

    wss.on('connect', (ws) => {
      console.log('web socket connection established with client');

      ws.on('message', async (data) => {
        try {
        } 
        catch (err: any) {
          console.error(
            'Something went wrong in server or mongoose connection:',
            err,
          );
          throw err;
        }
      });
    });
  } 
  catch (err: any) {
    throw Error('something went wrong in server or mongoose connection');
  }
}
main();

// Global unhandled promise rejection handler
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Gracefully shutting down the server
  if (server) {
    try {
      server.close(() => {
        console.log(
          'Server and MongoDB connection closed due to unhandled rejection.',
        );
        process.exit(1); // Exit the process with an error code
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1); // Exit with error code if shutting down fails
    }
  } else {
    process.exit(1);
  }
});

// Global uncaught exception handler
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  // Gracefully shutting down the server
  if (server) {
    try {
      server.close(() => {
        console.log(
          'Server and MongoDB connection closed due to uncaught exception.',
        );
        process.exit(1); // Exit the process with an error code
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1); // Exit with error code if shutting down fails
    }
  } else {
    process.exit(1);
  }
});
