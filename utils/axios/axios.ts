import axios from "axios";

export const hasuraAxios = axios.create({
  baseURL: "https://refined-baboon-56.hasura.app/api/rest/v1",
  headers: {
    common: {
      "x-hasura-admin-secret":
        "viWASZFfXH6vUouDpheBH9pZDiwlDTwuvBmk6QVEeBumgPq0xCCZ7IJuT563uR3Z",
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
