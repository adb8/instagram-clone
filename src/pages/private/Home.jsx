import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../../components/Sidebar";
import PostCard from "../../components/PostCard";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, db } from "../../firebase.js";
import { loadingIcon } from "../../assets/images.jsx";

const Home = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(0);
  const [postsDataRetrieved, setPostsDataRetrieved] = useState(false);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const posts = [];
        const q = query(collection(db, "posts"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          posts.push({
            pid: doc.id,
            ...doc.data(),
          });
        });
        console.log("Posts length: ", posts.length);
        setPosts(posts);
        setPostsDataRetrieved(true);
      } catch (error) {
        console.error(error);
        setPosts([]);
        setPostsDataRetrieved(true);
      }
    };
    getPosts();
  }, []);

  useEffect(() => {
    if (postsDataRetrieved && postsLoaded >= posts.length) {
      document.getElementById("loading-screen").style.display = "none";
      console.log("All posts successfully loaded.");
    }
  }, [postsLoaded, postsDataRetrieved]);

  return (
    <div className="bg-black w-full h-screen text-white flex">
      <div
        className="fixed inset-0 bg-black bg-opacity-100 flex w-full h-screen justify-center items-center z-50"
        id="loading-screen">
        {loadingIcon()}
      </div>
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {posts.map((post) => (
          <PostCard
            key={post.pid}
            post={post}
            pageLoading={postsLoaded < posts.length}
            onPostLoadFailed={() => {
              setPostsLoaded((prev) => {
                console.log("Post failed to load, proceeding to next post...");
                return prev + 1;
              });
            }}
            onPostLoaded={() => {
              setPostsLoaded((prev) => {
                console.log("Posts loaded: ", prev + 1, " out of ", posts.length);
                return prev + 1;
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
