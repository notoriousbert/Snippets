import express, { request, response } from "express";
import { User, Post } from "../models";

const router = express.Router();

router.route("/").get((req, res, next) => {
  res.send("katas endpoint");
});

//Endpoint response of user 'alice'

router.get("/alice", async (request, response) => {
  const user = await User.findOne({ username: "alice" });
  console.log(user)
  try {
    if (user) {
      response.status(200).json(user.toJSON());
    }
  } catch (err) {
    return response.json({ error: err });
  }
});

router.get("/top", async (request, response) => {
  try {
    const posts = await Post.find({});

    const topPosters = posts.reduce((topPosters, post) => {
      if (post.author in topPosters) {
        topPosters[post.author]++;
      } else {
        topPosters[post.author] = 1;
      }
      return topPosters;
    }, {});

    const topThreePosterIds = Object.entries(topPosters)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    let topThreePosters = [];

    for (let poster of topThreePosterIds) {
      const user = await User.findById(poster[0]);
      topThreePosters.push(user);
    }
    response.status(200).json(topThreePosters);
  } catch (err) {
    return response.json({ error: err });
  }
});

module.exports = router;
