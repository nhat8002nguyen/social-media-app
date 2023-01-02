import axios from "axios";

export const hasuraAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HASURA_BASE_ENDPOINT,
  headers: {
    common: {
      "x-hasura-admin-secret": process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET,
    },
  },
  timeout: 10000,
});

export const cloudinaryAxios = axios.create({
  baseURL: "https://api.cloudinary.com/v1_1",
  headers: {
    common: {
      "Content-Type": "multipart/form-data",
    },
  },
  timeout: 10000,
});
