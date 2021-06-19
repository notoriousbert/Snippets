import React, { useState, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import {
  LandingPage,
  LoginPage,
  PostDetailPage,
  RegisterPage,
  UserDetailPage,
} from "pages";
import { ErrorBoundary, Feed, Header } from "components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useProvideAuth } from "hooks/useAuth";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";

function App() {
  const {
    state: { user },
  } = useProvideAuth();

  const [currentUserFromApp, setCurrentUserFromApp] = useState();
  const [profilePicFromApp, setProfilePicFromApp] = useState()

  useEffect(() => {
    if (user) {
      setProfilePicFromApp(user.profile_image);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ToastContainer />
      {user ? (
        <>
          <Header currentUserFromApp={currentUserFromApp} profilePicFromApp={profilePicFromApp} />
          <Container
            fluid
            style={{
              height: "calc(100vh - 72px)",
              overflow: "auto",
            }}
          >
            <Row>
              <Col xs={0} md={2} xl={3} />
              <Col xs={12} md={8} xl={6}>
                <Switch>
                  <Route
                    exact
                    path="/u/:uid"
                    render={(props) => (
                      <UserDetailPage
                        {...props}
                        setCurrentUserFromApp={setCurrentUserFromApp}
                        currentUserFromApp={currentUserFromApp}
                        setProfilePicFromApp={setProfilePicFromApp}
                      />
                    )}
                  />
                  <Route exact path="/p/:pid" component={PostDetailPage} />
                  <Route
                    exact
                    path="/"
                    render={(props) => <Feed {...props} />}
                  />
                  <Route exact path="/login">
                    <Redirect to="/" />
                  </Route>
                  <Route exact path="/register">
                    <Redirect to="/" />
                  </Route>
                  <Route
                    component={({ location }) => {
                      return (
                        <div
                          style={{
                            padding: "50px",
                            width: "100%",
                            textAlign: "center",
                          }}
                        >
                          The page <code>{location.pathname}</code> could not be
                          found.
                        </div>
                      );
                    }}
                  />
                </Switch>
              </Col>
              <Col xs={0} md={2} xl={3} />
            </Row>
          </Container>
        </>
      ) : (
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" render={(props) => <RegisterPage {...props} setProfilePicFromApp={setProfilePicFromApp}/>} />
          <Route path="/" component={LandingPage} />
        </Switch>
      )}
    </ErrorBoundary>
  );
}

export default App;
