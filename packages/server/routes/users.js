import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models";
import { requireAuth } from "../middleware";

const router = express.Router();

router
  .route("/:id")
  .get(async (request, response) => {
    console.log('this get request aint working')
    const populateQuery = [
      {
        path: "posts",
        populate: [
          { path: "author", select: ["username", "profile_image"] },
          { path: "likes", select: ["username", "profile_image"] },
        ],
      },
    ];

    const user = await User.findOne({ username: request.params.id })
      .populate(populateQuery)
      .exec();
    console.log("found user: " + user);
    if (user) {
      response.json(user.toJSON());
    } else {
      response.status(404).end();
    }
  })
  .put(requireAuth, async (request, response) => {
    const { currentPassword, newPassword, profileImage } = request.body;
    const { id } = request.params;
    const thisUser = await User.findById(id);

    if (newPassword.length > 0 && currentPassword.length > 0) {
      const passwordCorrect = await bcrypt.compare(
        currentPassword,
        thisUser.passwordHash
      );
      console.log("passwordCorrect: " + passwordCorrect);

      if (newPassword.length < 8 || newPassword.length > 20) {
        return response
          .status(400)
          .json({ error: "Password must be 8 - 20 characters long" });
      }

      if (!(thisUser && passwordCorrect)) {
        console.log("invalid password");
        return response.status(401).json({
          error: "invalid password",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      try {
        console.log("inside the put for password " + id);
        const userUpdate = await User.findByIdAndUpdate(
          id,
          {
            passwordHash: hashedPassword,
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
