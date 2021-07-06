import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "utils/axiosConfig.js";
import { Post } from "components";
import LoadingSpinner from "components/LoadingSpinner";
import { useProvideAuth } from "hooks/useAuth";
import { toast } from "react-toastify";
import Fuse from "fuse.js";
import { queries } from "@testing-library/dom";
import { UserDetailPage } from "pages";

const initialState = {
  postText: "",
  isSubmitting: false,
  errorMessage: null,
};

const initialStateForSearch = {
  searchText: "",
  isSubmitting: false,
  errorMessage: null,
};

export default function Feed(props) {
  const {
    state: { user },
  } = useProvideAuth();
  const { state } = useProvideAuth();
  const [queryEntered, setQueryEntered] = useState(false);
  const [posts, setPosts] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState(false);
  const [searchData, setSearchData] = useState(initialStateForSearch);
  const [data, setData] = useState(initialState);
  const [validated, setValidated] = useState(false);

  const handleInputChange = (event) => {
    console.log(props)
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const handleSearchInput = (event) => {
    const query = event.target.value.toLowerCase();

    const fuse = new Fuse(posts, {
      keys: ["text", "author.username"],
    });

    const finalResult = [];
    const result = fuse.search(query);

    if (result.length && query.length) {
      result.forEach((item) => {
        finalResult.push(item.item);
      });
      setFilteredPosts(finalResult);
    } else if (result.length === 0 && query.length) {
      setFilteredPosts([]);
    } else {
      setFilteredPosts(posts);
    }

    setQueryEntered(true);
    setSearchData({
      ...searchData,
      [event.target.name]: event.target.value,
    });
  };

  const handlePostSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      toast.error("Post text is required");
      setValidated(true);
      return;
    }

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    axios
      .post("/posts", {
        text: data.postText,
        author: user.username,
      })
      .then(
        (res) => {
          setData(initialState);
          setPosts((posts) => [
            {
              ...res.data,
              author: {
                username: user.username,
                profile_image: user.profile_image,
              },
            },
            ...posts,
          ]);
          setValidated(false);
        },
        (error) => {
          setData({
            ...data,
            isSubmitting: false,
            errorMessage: error.message,
          });
        }
      );
  };

  const getPosts = async () => {
    try {
      const allPosts = await axios.get("posts");
      setPosts(allPosts.data);
      setPostLoading(false);
      filteredPosts.map((post) => {
        if (post) {
          console.log(post)
        }
        return null;
      })
    } catch (err) {
      console.error(err.message);
      setPostLoading(false);
      setPostError(true);
    }
  };

  const getUser = async () => {
    try {
      const userResponse = await axios.get(`users/${user.username}`);
      if (state.user.username === userResponse.data.username) {
        props.setProfilePicFromApp(userResponse.data.profile_image);
      }
    } catch (err) {
      console.error(err.message);
    }
  
  }

  useEffect(() => {
    getPosts();
    getUser()
  }, []);

  return (
    <>
      <Container className="pt-3 pb-3 clearfix">
        <h4>Share a Snip</h4>
        <Form noValidate validated={validated} onSubmit={handlePostSubmit}>
          <Form.Control
            as="textarea"
            rows={3}
            maxLength="120"
            name="postText"
            placeholder="What's on your mind?"
            aria-describedby="post-form"
            size="lg"
            required
            value={data.postText}
            onChange={handleInputChange}
          />

          {data.errorMessage && (
            <span className="form-error">{data.errorMessage}</span>
          )}
          <Button
            className="float-right mt-3"
            type="submit"
            disabled={data.isSubmitting}
          >
            {data.isSubmitting ? <LoadingSpinner /> : "Post"}
          </Button>
        </Form>
      </Container>

      {!postLoading ? (
        <Container className="pt-3 pb-3">
          <h6>Recent Snips</h6>
          <Form noValidate validated={validated}>
            <Form.Control
              as="textarea"
              rows={1}
              maxLength="50"
              name="searchText"
              placeholder="Search Posts"
              aria-describedby="post-form"
              size="sm"
              required
              value={searchData.searchText}
              onChange={handleSearchInput}
            />
          </Form>
          {postError && "Error fetching posts"}
          {posts && queryEntered
            ? filteredPosts.map((post) => {
                if (post) {
                  return <Post key={post._id} profilePicFromApp={state.user.username === post.author.username && props.profilePicFromApp}  post={post} />;
                }
                return null;
              })
            : posts.map((post) => {
                if (post) {
                  return (
                    <Post key={post._id} profilePicFromApp={state.user.username === post.author.username && props.profilePicFromApp} post={post} getPosts={getPosts} />
                  );
                }
                return null;
              })}
        </Container>
      ) : (
        <LoadingSpinner full />
      )}
    </>
  );
}
