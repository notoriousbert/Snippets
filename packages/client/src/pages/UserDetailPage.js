import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Collapse,
  Figure,
} from "react-bootstrap";
import { LoadingSpinner, Post, AvatarPicker } from "components";
import { useProvideAuth } from "hooks/useAuth";
import { useRequireAuth } from "hooks/useRequireAuth";
import axios from "utils/axiosConfig.js";
import { toast } from "react-toastify";

export default function UserDetailPage({
  match: {
    params: { uid },
  },
  history,
  getUserApp,
  setCurrentUserFromApp,
  currentUserFromApp,
  setProfilePicFromApp,
  profilePicFromApp
}) {
  const { state } = useProvideAuth();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openProfilePic, setOpenProfilePic] = useState(false);
  const [profileImage, setProfileImage] = useState();
  const [data, setData] = useState({
    password: "",
    isSubmitting: false,
    errorMessage: null,
  });

  const {
    state: { isAuthenticated },
  } = useRequireAuth();

  const getUser = async () => {
    try {
      const userResponse = await axios.get(`users/${uid}`);
      setUser(userResponse.data);
      setCurrentUserFromApp(userResponse.data)
      setLoading(false);
      setProfilePicFromApp(userResponse.data.profile_image)
      return userResponse.data
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getUser();
    isAuthenticated && getUser();
    if (user) {
      setProfileImage(user.profile_image);
      setProfilePicFromApp(user.profile_image)
    }
  }, [uid, isAuthenticated]);

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
    console.log(event.target.value);
    if (event.target.value.length >= 8 && event.target.value.length <= 20) {
      setValidated(true);
      return;
    }
    setValidated(false);
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;

    // handle invalid or empty form
    if (
      form.checkValidity() === false ||
      data.password.length < 8 ||
      data.password.length > 20
    ) {
      setValidated(false);
      return;
    }

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    try {
      // write code to call edit user endpoint 'users/:id'
      const {
        user: { uid, username },
      } = state;
      console.log(username, uid);
      await axios.put(`users/${uid}`, {
        password: data.password,
        profileImage: profileImage,
      });

      // don't forget to update loading state and alert success
    } catch (error) {
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: error.message,
      });
    }

    toast.success("Your password has been updated.");
    setLoading(false);
    setData({
      password: "",
      isSubmitting: false,
      errorMessage: null,
    });
    setOpenPassword(!openPassword);
  };

  const handleUpdateProfilePic = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    user.profile_image = profileImage;
    setProfilePicFromApp(profileImage)
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    try {
      // write code to call edit user endpoint 'users/:id'
      const {
        user: { uid },
      } = state;
      console.log(uid);
      await axios.put(`users/${uid}`, {
        password: data.password,
        profileImage: user.profile_image,
      });

      // don't forget to update loading state and alert success
    } catch (error) {
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: error.message,
      });
    }
    toast.success("Your profile image has been updated");
    setLoading(false);
    setData({
      password: "",
      isSubmitting: false,
      errorMessage: null,
    });
    setOpenProfilePic(!openProfilePic);
  };

  if (!isAuthenticated) {
    return <LoadingSpinner full />;
  }

  if (loading) {
    console.log(loading);
    return <LoadingSpinner full />;
  }

  return (
    <>
      <Container className="clearfix">
        <Button
          variant="outline-info"
          onClick={() => {
            history.goBack();
          }}
          style={{ border: "none", color: "#E5E1DF" }}
          className="mt-3 mb-3"
        >
          Go Back
        </Button>
        <Card bg="header" className="text-center">
          <Card.Body>
            <Figure
              className="bg-border-color rounded-circle overflow-hidden my-auto ml-2 p-1"
              style={{
                height: "50px",
                width: "50px",
                backgroundColor: "white",
              }}
            >
              <Figure.Image
                onClick={() =>
                  state.user.username === uid &&
                  setOpenProfilePic(!openProfilePic)
                }
                src={user.profile_image}
                className="w-100 h-100"
              />
            </Figure>
            {state.user.username === uid && (
              <div
                className="mb-2 mt-1"
                onClick={() => setOpenProfilePic(!openProfilePic)}
                style={{ cursor: "pointer", color: "#BFBFBF" }}
                aria-expanded={openProfilePic}
              >
                Change Profile Image
              </div>
            )}
            <Collapse in={openProfilePic}>
              <Container animation="false" className="pb-4">
                <Form
                  id="profileImage"
                  noValidate
                  validated={validated}
                  onSubmit={handleUpdateProfilePic}
                >
                  <AvatarPicker
                    setProfileImage={setProfileImage}
                    getUser={getUser}
                    setCurrentUserFromApp={setCurrentUserFromApp}
                    currentUserFromApp={currentUserFromApp}
                    setProfilePicFromApp={setProfilePicFromApp}
                  />
                  <Button type="submit" disabled={data.isSubmitting}>
                    {data.isSubmitting ? (
                      <LoadingSpinner />
                    ) : (
                      "Update Profile Image"
                    )}
                  </Button>
                </Form>
              </Container>
            </Collapse>
            <Card.Title>{uid}</Card.Title>
            {state.user.username === uid && (
              <div
                onClick={() => setOpenPassword(!openPassword)}
                style={{ cursor: "pointer", color: "#BFBFBF" }}
              >
                Edit Password
              </div>
            )}
            <Collapse in={openPassword}>
              <Container animation="false">
                <div className="row justify-content-center p-4">
                  <div className="col text-center">
                    <Form
                      id="password"
                      noValidate
                      validated={validated}
                      onSubmit={handleUpdatePassword}
                    >
                      <Form.Group>
                        <Form.Label htmlFor="password">New Password</Form.Label>
                        <Form.Control
                          isInvalid={!validated}
                          type="password"
                          name="password"
                          required
                          value={data.password}
                          onChange={handleInputChange}
                        />
                        <Form.Control.Feedback
                          type="invalid"
                          className="text-warning"
                        >
                          New Password is required
                        </Form.Control.Feedback>
                        <Form.Text id="passwordHelpBlock" muted>
                          Must be 8-20 characters long.
                        </Form.Text>
                      </Form.Group>

                      {data.errorMessage && (
                        <span className="form-error">{data.errorMessage}</span>
                      )}
                      <Button type="submit" disabled={data.isSubmitting}>
                        {data.isSubmitting ? (
                          <LoadingSpinner />
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </Form>
                  </div>
                </div>
              </Container>
            </Collapse>
          </Card.Body>
        </Card>
      </Container>
      <Container className="pt-3 pb-3">
        {user.posts.length !== 0 ? (
          user.posts.map((post) => (
            <Post key={post._id} post={post} userDetail profilePicFromApp={profilePicFromApp} />
          ))
        ) : (
          <div
            style={{
              marginTop: "75px",
              textAlign: "center",
            }}
          >
            No User Posts
          </div>
        )}
      </Container>
    </>
  );
}
