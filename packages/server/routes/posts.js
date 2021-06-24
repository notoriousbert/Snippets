import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import keys from "../config/keys";
import { User, Post } from "../models";
import { requireAuth } from "../middleware";

router.get("/", async (request, response) => {
  const populateQuery = [
    { path: "author", select: ["username", "profile_image"] },
    {
      path: "comments",
      populate: { path: "author", select: ["username", "profile_image"] },
    },
    {
      path: "likes",
      select: ["username"],
    },
  ];
  const posts = await Post.find({})
    .sort({ created: -1 })
    .populate(populateQuery)
    .exec();

  response.json(posts.map((post) => post.toJSON()));
});

router.post("/", requireAuth, async (request, response, next) => {
  const { text } = request.body;
  const { user } = request;

  const post = new Post({
    text: text,
    author: user._id,
  });

  try {
    const savedPost = await post.save();
    user.posts = user.posts.concat(savedPost._id);

    await user.save();

    response.json(savedPost.toJSON());
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (request, response) => {
  const populateQuery = [
    { path: "author", select: ["username", "profile_image"] },
    {
      path: "comments",
      populate: { path: "author", select: ["username", "profile_image"] },
    },
    {
      path: "likes",
      select: ["username"],
    },
  ];
  const post = await Post.findById(request.params.id)
    .populate(populateQuery)
    .exec();
  if (post) {
    response.json(post.toJSON());
  } else {
    response.status(404).end();
  }
});

router.delete("/:id", requireAuth, async (request, response, next) => {
  const { user } = request;
  const { id } = request.params;
  const post = await Post.findById(id);
  console.log(post);
  console.log(user);

  if (!post) {
    return response.status(422).json({ error: "Cannot find post" });
  }
  if (post.author._id.toString() === user._id.toJSON()) {
    try {
      const removedPost = await post.remove();

      const userUpdate = await User.updateOne(
        { _id: user._id },
        { $pull: { posts: id } }
      );

      response.json(removedPost);
    } catch (err) {
      next(err);
    }
  }
});

router.all("/like/:postId", requireAuth, async (request, response) => {
  //   const { postId } = request.params;
  //   const { user } = request;

  //   const newLike = { _id: user.id, username: user.username }

  //   const populateQuery = [
  //     {
  //       path: "likes",
  //       select: ["username"],
  //     },
  //   ];
  //   const post = await Post.findOne({ _id: postId })
  //     .populate(populateQuery)
  //     .exec();

  //   if (!post) {
  //     return response.status(422).json({ error: "Cannot find post" });
  //   }
  //   try {
  //     console.log('HERES THat user: ' + user)

  //     post.likes.some(uniqueLike => {
  //       console.log(typeof user.id)
  //       console.log(typeof uniqueLike._id)
  //       uniqueLike._id === user.id
  //     })
  //     console.log("Heres the post:" + post);
  //     if (post.likes.some(uniqueLike => uniqueLike._id.toString() === user.id)) {
  //       console.log('made it bby')
  //       const result = await post.updateOne({
  //         $pull: { likes: { $elemMatch: { _id: user.id } } },
  //       });
  //       console.log('likes subtracted ' + post)

  //       response.json(post);
  //     } else {
  //       const result = await post.updateOne({
  //         $push: { likes: user.id },
  //       });
  //       console.log("likes added:" + post);
  //       response.json(post);
  //     }
  //   } catch (err) {
  //     return response.status(422).json({ error: err });
  //   }
  // });

  const { postId } = request.params;
  const { user } = request;

  console.log(user)

  const post = await Post.findOne({ _id: postId });

  

  if (!post) {
    return response.status(422).json({ error: "Cannot find post" });
  }
  try {
    if (post.likes.includes(user.id)) {
      const result = await post.updateOne({
        $pull: { likes: user.id },
      });
      const userUpdate = await user.updateOne(
        { $pull: { postLikes: postId } }
      );

      response.json(result);
    } else {
      const result = await post.updateOne({
        $push: { likes: user.id },
      });
      const userUpdate = await user.updateOne(
        { $push: { postLikes: postId } }
      );

      response.json(result);
    }
    console.log(user)
  } catch (err) {
    return response.status(422).json({ error: err });
  }
});

router.put("/comments", async (request, response, next) => {
  const { text, userId, postId } = request.body;
  const comment = {
    text: text,
    author: userId,
  };
  const populateQuery = [
    { path: "comments.author", select: ["username", "profile_image"] },
  ];
  Post.findByIdAndUpdate(
    postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate(populateQuery)
    .exec((err, result) => {
      if (err) {
        next(err);
      } else {
        response.json(result);
      }
    });
});

module.exports = router;
