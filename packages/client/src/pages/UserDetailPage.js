import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Collapse,
  Figure,
} from "react-bootstrap";
import { LoadingSpinner, Post, AvatarPicker, FileUploader } from "components";
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
  profilePicFromApp,
}) {
  const { state } = useProvideAuth();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [fileData, getFileData] = useState({ name: "", path: "" });
  const [validatedCurrent, setValidatedCurrent] = useState(false);
  const [validatedNew, setValidatedNew] = useState(false);
  const [validatedConfirm, setValidatedConfirm] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openProfilePic, setOpenProfilePic] = useState(false);
  const [profileImage, setProfileImage] = useState();
  const [fileName, setFileName] = useState();
  const [newPasswordData, setNewPasswordData] = useState({
    newPassword: "",
    isSubmitting: false,
    errorMessage: null,
  });
  const [newPasswordConfirm, setNewPasswordConfirm] = useState({
    newPasswordConfirm: "",
    isSubmitting: false,
    errorMessage: null,
  });
  const [currentPasswordData, setCurrentPasswordData] = useState({
    currentPassword: "",
    isSubmitting: false,
    errorMessage: null,
  });

  const {
    state: { isAuthenticated },
  } = useRequireAuth();

  const getUser = async () => {
    console.log(uid);
    try {
      const userResponse = await axios.get(`users/${uid}`);
      setUser(userResponse.data);
      setLoading(false);
      setProfileImage(userResponse.data.profile_image);
      if (state.user.username === userResponse.data.username) {
        setProfilePicFromApp(userResponse.data.profile_image);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    isAuthenticated && getUser();
  }, [uid, isAuthenticated]);

  const handleInputChange = (event) => {
    if (event.target.name === "newPassword") {
      setNewPasswordData({
        ...newPasswordData,
        [event.target.name]: event.target.value,
      });
      if (event.target.value.length >= 8 && event.target.value.length <= 20) {
        setValidatedNew(true);
        return;
      }
      setValidatedNew(false);
    } else if (event.target.name === "currentPassword") {
      setCurrentPasswordData({
        ...currentPasswordData,
        [event.target.name]: event.target.value,
      });
      if (event.target.value.length >= 8 && event.target.value.length <= 20) {
        setValidatedCurrent(true);
        return;
      }
      setValidatedCurrent(false);
    } else {
      setNewPasswordConfirm({
        ...newPasswordConfirm,
        [event.target.name]: event.target.value,
      });
      if (event.target.value.length >= 8 && event.target.value.length <= 20) {
        setValidatedConfirm(true);
        return;
      }
      setValidatedConfirm(false);
    }
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;

    if (newPasswordData.newPassword !== newPasswordConfirm.newPasswordConfirm) {
      toast.error(
        `'New Password' and 'Confirm New Password' input fields do not match`
      );
      return;
    }

    // handle invalid or empty form
    if (form.checkValidity() === false) {
      setValidatedNew(false);
      return;
    }

    setNewPasswordData({
      ...newPasswordData,
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
        currentPassword: currentPasswordData.currentPassword,
        newPassword: newPasswordData.newPassword,
        profileImage: profileImage,
      });
      toast.success("Your password has been updated.");
      localStorage.clear();
      history.push("/login");

      // don't forget to update loading state and alert success
    } catch (error) {
      setNewPasswordData({
        ...newPasswordData,
        isSubmitting: false,
        errorMessage: error ? error.message || error.statusText : null,
      });
      toast.error(error.response.data.error);
    }

    setLoading(false);
    setNewPasswordData({
      newPassword: "",
      isSubmitting: false,
      errorMessage: null,
    });
    setOpenPassword(!openPassword);
  };

  const handleProfileUpload = async (event) => {
    console.log("inside of fileUploader handler");
    // setFileName(event.target.files[0]);
    // setProfileImage(`/${event.target.files[0].name}`);
    // console.log(fileName)
    // setProfilePicFromApp(event.target.files[0].name);
    const formData = new FormData();
    formData.append("userUpload", fileName);
    console.log(formData);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    try {
      await axios.post(`upload`, formData, config).then((response) => {
        console.log(response.data);
        getFileData({
          name: response.data.name,
          path: "http://localhost:3000" + response.data.path,
        });
      });
    } catch (error) {}
    setFileName(null);
  };

  const handleUpdateProfilePic = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (fileName) {
      handleProfileUpload();
    }
    // const formData = new FormData();
    // formData.append("userUpload", fileName);
    // console.log(formData);
    // const config = {
    //   headers: {
    //     "content-type": "multipart/form-data",
    //   },
    // };
    // try {
    //   await axios.post(`upload`, formData, config).then((response) => {
    //     console.log(response.data);
    //     getFileData({
    //       name: response.data.name,
    //       path: "http://localhost:3000" + response.data.path,
    //     });
    //   });
    // } catch (error) {}
    // console.log(profileImage)
    // console.log(fileData.name)
    user.profile_image = profileImage;
    setNewPasswordData({
      ...newPasswordData,
      isSubmitting: true,
      errorMessage: null,
    });

    try {
      // write code to call edit user endpoint 'users/:id'
      const {
        user: { uid },
      } = state;
      await axios.put(`users/${uid}`, {
        currentPassword: "",
        newPassword: "",
        profileImage: profileImage,
      });

      // don't forget to update loading state and alert success
    } catch (error) {
      setNewPasswordData({
        ...newPasswordData,
        isSubmitting: false,
        errorMessage: error.message,
      });
    }
    toast.success("Your profile image has been updated");
    setLoading(false);
    setNewPasswordData({
      newPassword: "",
      isSubmitting: false,
      errorMessage: null,
    });
    setOpenProfilePic(!openProfilePic);
    setProfilePicFromApp(profileImage);
    getUser();
  };

  if (!isAuthenticated) {
    return <LoadingSpinner full />;
  }

  if (loading) {
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
            <Container className="mb-4">
              <Figure
                className="bg-border-color my-auto ml-2 p-1 thumbnail mr-4 mb-4 pb-4"
                style={{
                  height: "55px",
                  width: "55px",
                  backgroundColor: "transparent",
                }}
              >
                <Figure.Image
                  onClick={() =>
                    state.user.username === uid &&
                    setOpenProfilePic(!openProfilePic)
                  }
                  src={
                    state.user.username === uid
                      ? profilePicFromApp
                      : profileImage
                  }
                  className="w-95 h-95 rounded img-fluid overflow-hidden"
                />
              </Figure>
            </Container>
            <Card.Title>{uid}</Card.Title>
            <Card.Title>{user.email}</Card.Title>
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
                <h5>Select one of the avatars below, or upload your own!</h5>
                <Form
                  id="profileImage"
                  noValidate
                  // validated={validated}
                  onSubmit={handleUpdateProfilePic}
                >
                  <AvatarPicker
                    setProfileImage={setProfileImage}
                    getUser={getUser}
                    setCurrentUserFromApp={setCurrentUserFromApp}
                    currentUserFromApp={currentUserFromApp}
                    setProfilePicFromApp={setProfilePicFromApp}
                    state={state}
                  />
                  <FileUploader
                    setProfileImage={setProfileImage}
                    getUser={getUser}
                    setCurrentUserFromApp={setCurrentUserFromApp}
                    currentUserFromApp={currentUserFromApp}
                    setProfilePicFromApp={setProfilePicFromApp}
                    state={state}
                    fileName={fileName}
                    getFileData={getFileData}
                    profileImage={profileImage}
                    fileData={fileData}
                    setFileName={setFileName}
                  />
                  <Button type="submit" disabled={newPasswordData.isSubmitting}>
                    {newPasswordData.isSubmitting ? (
                      <LoadingSpinner />
                    ) : (
                      "Update Profile Image"
                    )}
                  </Button>
                </Form>
              </Container>
            </Collapse>
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
                      validated={
                        validatedNew && validatedCurrent && validatedConfirm
                      }
                      onSubmit={handleUpdatePassword}
                    >
                      <Form.Group>
                        <Form.Label htmlFor="password" className="mt-2">
                          Current Password
                        </Form.Label>
                        <Form.Control
                          isInvalid={!validatedCurrent}
                          type="password"
                          name="currentPassword"
                          required
                          value={currentPasswordData.currentPassword}
                          onChange={handleInputChange}
                        />
                        <Form.Label htmlFor="password" className="mt-2">
                          New Password
                        </Form.Label>
                        <Form.Control
                          isInvalid={!validatedNew}
                          type="password"
                          name="newPassword"
                          required
                          value={newPasswordData.newPassword}
                          onChange={handleInputChange}
                        />
                        <Form.Label htmlFor="password" className="mt-2">
                          Confirm New Password
                        </Form.Label>
                        <Form.Control
                          isInvalid={!validatedConfirm}
                          type="password"
                          name="newPasswordConfirm"
                          required
                          value={newPasswordConfirm.newPassword}
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

                      {newPasswordData.errorMessage && (
                        <span className="form-error">
                          {newPasswordData.errorMessage}
                        </span>
                      )}
                      <Button
                        type="submit"
                        disabled={newPasswordData.isSubmitting}
                      >
                        {newPasswordData.isSubmitting ? (
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
            <Post
              key={post._id}
              post={post}
              profilePicFromApp={
                state.user.username === uid ? profilePicFromApp : profileImage
              }
              getPosts={getUser}
              userDetail
              userFromDetailPage={user}
            />
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
