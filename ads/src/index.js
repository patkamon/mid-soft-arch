const express = require("express");
const amqp = require("amqplib");
const http = require("http");

if (!process.env.RABBIT) {
  throw new Error(
    "Please specify the name of the RabbitMQ host using environment variable RABBIT"
  );
}

const RABBIT = process.env.RABBIT;

//
// Connect to the RabbitMQ server.
//
function connectRabbit() {
  console.log(`Connecting to RabbitMQ server at ${RABBIT}.`);

  return amqp
    .connect(RABBIT) // Connect to the RabbitMQ server.
    .then((connection) => {
      console.log("Connected to RabbitMQ.");

      return connection
        .createChannel() // Create a RabbitMQ messaging channel.
        .then((messageChannel) => {
          return messageChannel
            .assertExchange("viewed", "fanout") // Assert that we have a "viewed" exchange.
            .then(() => {
              return messageChannel;
            });
        });
    });
}

//
// Broadcast the "viewed" message.
//
function broadcastViewedMessage(messageChannel, videoId) {
  console.log(`Publishing message on "viewed" exchange.`);

  const msg = { video: { id: videoId } };
  const jsonMsg = JSON.stringify(msg);
  messageChannel.publish("viewed", "", Buffer.from(jsonMsg)); // Publish message to the "viewed" exchange.
}

//
// Setup event handlers.
//
function setupHandlers(app) {
  app.get("/ads", (req, res) => {
    const mockAds = ["Agoda", "Aws", "Netflix", "Viu", "Youtube Premium"];
    const mockLinks = [
      "https://www.agoda.com/?cid=1844104",
      "https://aws.amazon.com/free/?trk=c4f45c53-585c-4b31-8fbf-d39fbcdc603a&sc_channel=ps&s_kwcid=AL!4422!3!637354294239!e!!g!!aws&ef_id=Cj0KCQiA3eGfBhCeARIsACpJNU9CONXbeh4E2ehEExK6ckrMSirNsZ2tKQ-Ob-VuBo0LCH4v2b4qW9kaAoULEALw_wcB:G:s&s_kwcid=AL!4422!3!637354294239!e!!g!!aws",
      "https://www.netflix.com/th-en/login?nextpage=https%3A%2F%2Fwww.netflix.com%2Fbrowse",
      "https://www.viu.com/ott/th/th",
      "https://www.youtube.com/premium",
    ];

    random_index = Math.floor(Math.random() * 5);
    res.send({
      ads: mockAds[random_index],
      link: mockLinks[random_index],
    });
  });
}

//
// Start the HTTP server.
//
function startHttpServer(messageChannel) {
  return new Promise((resolve) => {
    // Wrap in a promise so we can be notified when the server has started.
    const app = express();
    setupHandlers(app);

    const port = (process.env.PORT && parseInt(process.env.PORT)) || 3000;
    app.listen(port, () => {
      resolve(); // HTTP server is listening, resolve the promise.
    });
  });
}

//
// Application entry point.
//
function main() {
  return connectRabbit() // Connect to RabbitMQ...
    .then((messageChannel) => {
      // then...
      return startHttpServer(messageChannel); // start the HTTP server.
    });
}

main()
  .then(() => console.log("ads online."))
  .catch((err) => {
    console.error("ads failed to start.");
    console.error((err && err.stack) || err);
  });
