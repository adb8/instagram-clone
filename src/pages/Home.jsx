import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";

const Home = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="bg-black w-full h-screen">
      <Sidebar />
    </div>
  );
};

export default Home;
