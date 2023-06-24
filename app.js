import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import StreamrClient from "streamr-client";

const { Private_Key, StreamID, BASE_URL, BASE_URL2 } = process.env;

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
  }, 1000);
};

const getISSLocationData = async (url) => {
  try {
    const response = await axios.get(url);
    const {
      name,
      id,
      latitude,
      longitude,
      altitude,
      velocity,
      visibility,
      footprint,
      timestamp,
      daynum,
      solar_lat,
      solar_lon,
      units,
    } = response.data;
    console.log("response is : ", response.data);
    return {
      name,
      id,
      latitude,
      longitude,
      altitude,
      velocity,
      visibility,
      footprint,
      timestamp,
      daynum,
      solar_lat,
      solar_lon,
      units,
    };
  } catch (error) {
    console.log("error fetching ISS data ", error);
  }
};

const publishDataToStream = async function (issData) {
  // Initialize the client with an Ethereum account
  const {
    name,
    id,
    latitude,
    longitude,
    altitude,
    velocity,
    visibility,
    footprint,
    timestamp,
    daynum,
    solar_lat,
    solar_lon,
    units,
  } = issData;
  await streamr.publish(StreamID, {
    data: {
      name,
      id,
      position: { latitude, longitude },
      altitude,
      timestamp,
      velocity,
      visibility,
      footprint,
      daynum,
      solar_lat,
      solar_lon,
      units,
    },
  });
  console.log("stream published ", {
    name,
    id,
    position: { latitude, longitude },
    altitude,
    timestamp,
    velocity,
    visibility,
    footprint,
    daynum,
    solar_lat,
    solar_lon,
    units,
  });
};

try {
  start(BASE_URL2);
} catch (error) {
  console.log("There was an error ", error);
  clearInterval(interval);
}
