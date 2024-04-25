import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../../components/Sidebar";

const Home = () => {
  return (
    <div className="bg-black w-full h-screen text-white flex">
      <Sidebar />
      Home
    </div>
  );
};

export default Home;
