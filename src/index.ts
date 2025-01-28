import { Message } from "*can.node";
import * as can from "socketcan";

const channel = can.createRawChannel("vcan0", true);

// Log any message
channel.addListener("onMessage", function (msg: Message) {
  console.log(msg);
});

// Reply any message
channel.addListener("onMessage", channel.send, channel);

channel.start();
