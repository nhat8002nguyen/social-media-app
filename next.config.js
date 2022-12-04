/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "localhost",
      "gamek.mediacdn.vn",
      "cdn.pixabay.com",
      "genk.mediacdn.vn",
      "s3.go2joy.vn",
      "cf.bstatic.com",
      "pix10.agoda.net",
      "chupanhnoithat.vn",
      "d2e5ushqwiltxm.cloudfront.net",
      "res.cloudinary.com",
      "asset.cloudinary.com",
    ],
  },
};

module.exports = nextConfig;
