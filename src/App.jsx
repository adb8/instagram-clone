import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import Home from "./pages/private/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Reels from "./pages/private/Reels";
import Messages from "./pages/private/Messages";
import Profile from "./pages/private/Profile";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route exact path="/auth/login" element={<PublicRoute />}>
            <Route exact path="/auth/login" element={<Login />} />
          </Route>
          <Route exact path="/auth/signup" element={<PublicRoute />}>
            <Route exact path="/auth/signup" element={<Signup />} />
          </Route>
          <Route exact path="/" element={<PrivateRoute />}>
            <Route exact path="/" element={<Home />} />
          </Route>
          <Route exact path="/reels" element={<PrivateRoute />}>
            <Route exact path="/reels" element={<Reels />} />
          </Route>
          <Route exact path="/messages" element={<PrivateRoute />}>
            <Route exact path="/messages" element={<Messages />} />
          </Route>
          <Route exact path="/:emailId" element={<PrivateRoute />}>
            <Route exact path="/:emailId" element={<Profile />} />
          </Route>
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
