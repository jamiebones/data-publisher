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
    const issData = await getISSLocationData(url);
    publishDataToStream(issData);
  }, 5000);
};

const getISSLocationData = async (url) => {
  try {
    const response = await axios.get(url);
    console.log("response is : ", response.data);
    const {
      iss_position: { latitude, longitude },
      timestamp,
    } = response.data;
    console.log("response is : ", response.data);
    return {
      position: { latitude, longitude },
      timestamp,
     
    };
  } catch (error) {
    console.log("error fetching ISS data ", error);
  }
};

const publishDataToStream = async function (issData) {
  // Initialize the client with an Ethereum account
  const {
    position: { latitude, longitude },
    timestamp,
  } = issData;
  await streamr.publish(StreamID, {
    data: {
      position: { latitude, longitude },
      timestamp,
    },
  });
  console.log("stream published ", {
    position: { latitude, longitude },
    timestamp,
  });
};

try {
  start(BASE_URL);
} catch (error) {
  console.log("There was an error ", error);
  clearInterval(interval);
}
