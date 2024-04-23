import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div>
      <button
        onClick={() => {
          logout();
        }}>
        Logout
      </button>
    </div>
  );
};

export default Home;
