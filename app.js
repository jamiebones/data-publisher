import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import StreamrClient from "streamr-client";

const { Private_Key, StreamID, BASE_URL } = process.env;

const streamr = new StreamrClient({
  auth: {
    privateKey: Private_Key,
  },
});

let interval;
const start = async (url) => {
  interval = setInterval(async () => {
    const { timestamp, latitude, longitude } = await getISSLocationData(url);
    publishDataToStream(timestamp, latitude, longitude);
  }, 2000);
};

const getISSLocationData = async (url) => {
  try {
    const response = await axios.get(url);
    const {
      iss_position: { latitude, longitude },
      message,
      timestamp,
    } = response.data;
    console.log("response ", timestamp, latitude, longitude, message);
    if (message == "success") {
      return {
        timestamp,
        latitude,
        longitude,
      };
    }
  } catch (error) {
    console.log("error fetching ISS data ", error);
  }
};

const publishDataToStream = async function (timestamp, latitude, longitude) {
  // Initialize the client with an Ethereum account

  await streamr.publish(StreamID, {
    data: {
      position: { latitude, longitude },
      timestamp,
    },
  });
  console.log("stream published ", { latitude, longitude, timestamp });
};

try {
  start(BASE_URL);
} catch (error) {
  console.log("There was an error ", error);
  clearInterval(interval);
}
