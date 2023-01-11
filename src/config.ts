import dotenv from "dotenv";
dotenv.config();

export const config = {
  streamUrl: process.env.STREAM_URL,
};
