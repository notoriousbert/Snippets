import React, { isValidElement, useState } from "react";
import { Container, Row, Col, InputGroup, Form, Button } from "react-bootstrap";
import useRouter from "hooks/useRouter";
import { useProvideAuth } from "hooks/useAuth";
import {
  LandingHeader,
  LoadingSpinner,
  AvatarPicker,
  FileUploader,
} from "components";
import { setAuthToken } from "utils/axiosConfig";
import { toast } from "react-toastify";
import axios from "axios";

const initialState = {
  username: "",
  password: "",
  email: "",
  confirmPassword: "",
  isSubmitting: false,
  errorMessage: null,
};

export default function RegisterPage({
  setProfilePicFromApp,
  setCurrentUserFromApp,
  profilePicFromApp,
}) {
  const [data, setData] = useState(initialState);
  const auth = useProvideAuth();
  const router = useRouter();

  const [profileImage, setProfileImage] = useState();
  const [fileName, setFileName] = useState();
  const [fileData, getFileData] = useState({ name: "", path: "" });

  function getRandomProfileUrl() {
    //geneartes random pic in img
    let imgs = [
      "bird.svg",
      "dog.svg",
      "fox.svg",
      "frog.svg",
      "lion.svg",
      "owl.svg",
      "tiger.svg",
      "whale.svg",
    ];
    let img = imgs[Math.floor(Math.random() * imgs.length)];
    return `/${img}`;
  }

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const handleProfileUpload = async (event) => {};

  const handleSignup = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    const formData = new FormData();
    formData.append("userUpload", fileName);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };

    if (data.password !== data.confirmPassword) {
      toast.error(`Error: Password does not match Confirm Password`);
      return;
    }
    const emailFormInput = document.querySelector("#email")
    // if (emailFormInput.checkValidity() === false) {
    //   toast.error('Please enter a vaild email address')
    //   setData({
    //     ...data,
    //     isSubmitting: false,
    //     errorMessage: null,
    //   });
    //   return
    // }

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    try {
      if (fileName) {
        try {
          await axios.post(`/api/upload`, formData, config);
          setFileName(null);
        } catch (error) {
          console.log(error);
          setData({
            ...data,
            isSubmitting: false,
            errorMessage: error ? error.message || error.statusText : null,
          });
        }
      }
      const res = await auth.signup(
        data.username,
        data.password,
        profileImage,
        data.email
      );
      setProfilePicFromApp(profileImage);
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: null,
      });
      setAuthToken(res.token);
      router.push("/");
    } catch (error) {
      console.log(error);
      setData({
        ...data,
        isSubmitting: false,
        errorMessage: error ? error.message || error.statusText : null,
      });
    }
  };

  return (
    <div style={{ overflow: "auto", height: "100vh" }}>
      <LandingHeader />
      <Container className="mb-5">
        <Row className="pt-5 justify-content-center">
          <Form
            noValidate
            validated
            style={{ width: "350px" }}
            onSubmit={handleSignup}
          >
            <h3 className="mb-3">Join Us!</h3>
            <Form.Group controlId="username-register">
              <Form.Label>Username</Form.Label>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Username"
                  aria-describedby="inputGroupPrepend"
                  required
                  value={data.username}
                  onChange={handleInputChange}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group>
              <Form.Label>Choose An Avatar Or Upload Your Own</Form.Label>
            </Form.Group>
            <Form.Group>
              <AvatarPicker setProfileImage={setProfileImage} />
              <div className="registration-page-file-upload">
                <FileUploader
                  fileName={fileName}
                  setFileName={setFileName}
                  setProfileImage={setProfileImage}
                  setProfilePicFromApp={setProfilePicFromApp}
                />
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label htmlFor="Register">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                required
                id="email"
                value={data.email}
                onChange={handleInputChange}
              />
              <Form.Label htmlFor="Register">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                required
                id="inputPasswordRegister"
                value={data.password}
                onChange={handleInputChange}
              />
              <Form.Label htmlFor="Register">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                required
                id="inputPasswordRegisterConfirm"
                value={data.confirmPassword}
                onChange={handleInputChange}
              />
            </Form.Group>
            {data.errorMessage && (
              <span className="form-error text-warning">
                {data.errorMessage}
              </span>
            )}
            <Row className="mr-0">
              <Col>
                Already Registered?
                <Button
                  as="a"
                  variant="link"
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>
              </Col>
              <Button type="submit" disabled={data.isSubmitting}>
                {data.isSubmitting ? <LoadingSpinner /> : "Sign up"}
              </Button>
            </Row>
          </Form>
        </Row>
      </Container>
    </div>
  );
}
