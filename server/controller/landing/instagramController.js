
import asyncHandler from "express-async-handler";

const GRAPH_API_VERSION =
  process.env.INSTAGRAM_GRAPH_API_VERSION || "v26.0";

let cachedPosts = [];
let cacheExpiresAt = 0;

export const getInstagramPostsController = asyncHandler(
  async (req, res) => {
    try {
      // Cache Instagram results for 10 minutes.
      if (Date.now() < cacheExpiresAt) {
        return res.status(200).json({
          posts: cachedPosts,
        });
      }

      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

      if (!accessToken) {
        return res.status(500).json({
          message: "Instagram access token is not configured",
        });
      }

      const url = new URL(
        `https://graph.instagram.com/${GRAPH_API_VERSION}/me/media`
      );

      url.searchParams.set(
        "fields",
        [
          "id",
          "caption",
          "media_type",
          "media_url",
          "thumbnail_url",
          "permalink",
          "timestamp",
          "like_count",
          "comments_count",
        ].join(",")
      );

      url.searchParams.set("limit", "6");
      url.searchParams.set("access_token", accessToken);

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        console.error("Instagram API error:", result.error?.message);

        return res.status(502).json({
          message: "Unable to fetch Instagram posts",
        });
      }

      const posts = (result.data || [])
        .map((post) => ({
          id: post.id,
          image:
            post.media_type === "VIDEO"
              ? post.thumbnail_url
              : post.media_url || post.thumbnail_url,
          mediaType: post.media_type,
          permalink: post.permalink,
          caption: post.caption || "",
          timestamp: post.timestamp,
          likes: post.like_count ?? null,
          comments: post.comments_count ?? null,
        }))
        .filter((post) => post.image && post.permalink);

      cachedPosts = posts;
      cacheExpiresAt = Date.now() + 10 * 60 * 1000;

      return res.status(200).json({ posts });
    } catch (error) {
      console.error("Failed to fetch Instagram posts:", error);

      return res.status(500).json({
        message: "Something went wrong fetching Instagram posts",
      });
    }
  }
);
