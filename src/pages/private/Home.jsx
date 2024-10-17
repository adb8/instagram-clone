import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../../components/Sidebar";
import PostCard from "../../components/PostCard";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, db } from "../../firebase.js";

const Home = () => {
  const { currentUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      const posts = [];
      const q = query(collection(db, "posts"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        posts.push({
          pid: doc.id,
          ...doc.data(),
        });
      });
      console.log("Posts length: ", posts.length);
      setPosts(posts);
    };
    getPosts();
  }, []);

  return (
    <div className="bg-black w-full h-screen text-white flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {posts.map((post) => (
          <PostCard key={post.pid} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;
