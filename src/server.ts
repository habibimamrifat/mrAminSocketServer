import mongoose from 'mongoose';
import app from './app';
import { Server as HTTPServer } from 'http';
import { server as webSocketServer } from 'websocket';
import config from './config';
import adminSeeder from './seeder/adminSeeder';
import startCourtReminderCron from './util/coateReminderCorn';
import { MessageModel } from './modules/message/message.model';
import { connection as WSConnection } from 'websocket'; // needed for type

let server: HTTPServer;

const clients = new Map<WSConnection, { user: string; rooms: Set<string> }>();
console.log('here are the clients *******>>>>>>>>>', clients);

async function main() {
  try {
    console.log('connecting to mongodb....⏳');
    await mongoose.connect(config.mongoose_uri);

    await adminSeeder();
    startCourtReminderCron();

    // Start Express server first
    server = app.listen(config.port, () => {
      console.log(
        `Mr. Amin Lawyer server app listening on port ${config.port}`,
      );
    });

    // Now initialize WebSocket server
    const wss = new webSocketServer({ httpServer: server });
    console.log('WebSocket initialized.');

wss.on('connect', (ws) => {
  console.log('New client connected', ws);

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      const { type, sender, recipient, content } = message;

      if (type === 'join') {
        const room = [sender, recipient].sort().join('-');
        clients.set(ws, { user: sender, rooms: new Set([room]) });
        console.log(`${sender} joined room: ${room}`);
      } else if (type === 'message' && content) {
        const newMessage = new MessageModel({ sender, recipient, content });
        await newMessage.save();

        const room = [sender, recipient].sort().join('-');
        const messageData = { sender, recipient, content };

        // ✅ loop through your clients map instead
        for (const [client, info] of clients.entries()) {
          if (info.rooms.has(room)) {
            client.sendUTF(JSON.stringify({ type: 'message', data: messageData }));
          }
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
  
});

  } catch (err: any) {
    console.error('Error during server startup:', err);
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
