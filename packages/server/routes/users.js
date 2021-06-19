import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models";

const router = express.Router();

router
  .route("/:id")
  .get(async (request, response) => {
    const populateQuery = [
      {
        path: "posts",
        populate: { path: "author", select: ["username", "profile_image"] },
      },
    ];

    const user = await User.findOne({ username: request.params.id })
      .populate(populateQuery)
      .exec();
    console.log("found user" + user);
    if (user) {
      console.log("found user it worked");
      response.json(user.toJSON());
    } else {
      response.status(404).end();
    }
  })
  .put(async (request, response) => {
    const { password, profileImage } = request.body;
    const { id } = request.params;

    console.log(profileImage);

    const hashedpassword = await bcrypt.hash(password, 12);
    if (password.length > 0) {
      try {
        console.log("inside the put " + id);
        const userUpdate = await User.findByIdAndUpdate(
          id,
          {
            passwordHash: hashedpassword,
          },
          // {
          //   profile_image: profileImage,
          // },
          {
            new: true,
          }
        );

        console.log(userUpdate.toJSON());

        userUpdate.save().then((user) => {
          console.log("this is the put update" + userUpdate.toJSON());
          response.json(userUpdate.toJSON());
        });
      } catch (error) {
        response.status(404).end();
      }
    } else {
      try {
        console.log("inside the put " + id);
        const userUpdate = await User.findByIdAndUpdate(
          id,
          // {
          //   passwordHash: hashedpassword,
          // },
          {
            profile_image: profileImage,
          },
          {
            new: true,
          }
        );

        console.log(userUpdate.toJSON());

        userUpdate.save().then((user) => {
          console.log("this is the put update" + userUpdate.toJSON());
          response.json(userUpdate.toJSON());
        });
      } catch (error) {
        response.status(404).end();
      }
    }
  });

module.exports = router;
