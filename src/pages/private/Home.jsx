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
    if (!currentUser) return;
    if (currentUser?.photoUrl) setProfilePicture(currentUser.photoUrl);
    if (currentUser?.email) setEmail(currentUser.email);
    if (currentUser?.displayName) setDisplayName(currentUser.displayName);
  }, [currentUser]);

  useEffect(() => {
    const getPosts = async () => {
      const posts = [];
      const q = query(collection(db, "posts"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        posts.push(doc.data());
      });
      console.log("Posts length: ", posts.length);
      setPosts(posts);
    };
    getPosts();
  }, []);

  return (
    <div className="bg-black w-full h-screen text-white flex">
      <Sidebar />
      <div className="flex-1 border">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;
