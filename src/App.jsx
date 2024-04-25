import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import Home from "./pages/private/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import Reels from "./pages/private/Reels";
import Messages from "./pages/private/Messages";
import Profile from "./pages/private/Profile";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/home" element={<PrivateRoute />}>
            <Route exact path="/home" element={<Home />} />
          </Route>
          <Route exact path="/reels" element={<PrivateRoute />}>
            <Route exact path="/reels" element={<Reels />} />
          </Route>
          <Route exact path="/messages" element={<PrivateRoute />}>
            <Route exact path="/messages" element={<Messages />} />
          </Route>
          <Route exact path="/profile" element={<PrivateRoute />}>
            <Route exact path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
