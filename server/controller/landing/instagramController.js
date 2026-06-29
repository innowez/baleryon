import asyncHandler from "express-async-handler";
import axios from "axios";

export const getInstagramPosts = asyncHandler(async (req, res) => {
  const IG_USER_ID = process.env.IG_USER_ID;
  const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

  const response = await axios.get(
    `https://graph.instagram.com/${IG_USER_ID}/media`,
    {
      params: {
        fields:
          "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp",
        access_token: ACCESS_TOKEN,
      },
    },
  );

  res.status(200).json({
    posts: response.data.data,
  });
});
