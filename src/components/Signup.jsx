import {
  phoneImages,
  loginInstagramIcon,
  getFromGooglePlayIcon,
  getFromMicrosoft,
} from "../assets/images";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, collection, addDoc, query, where, getDocs } from "../firebase";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, currentUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const attemptSignup = async () => {
    const emailLowered = email.toLowerCase();
    if (loading) return;
    if (!email || !password || !fullName || !username) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (username.length > 30) {
      setError("Username must be at most 30 characters long.");
      return;
    }
    if (!/^[a-z0-9]+$/i.test(username)) {
      setError("Username can only contain alphanumeric characters");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError("Username already in use");
        setLoading(false);
        return;
      }
      const q2 = query(collection(db, "users"), where("email", "==", emailLowered));
      const querySnapshot2 = await getDocs(q2);
      if (!querySnapshot2.empty) {
        setError("Email already in use");
        setLoading(false);
        return;
      }
      const userCredential = await signup(emailLowered, password);
      const user = userCredential.user;
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        email: emailLowered,
        fullName: fullName,
        username,
        bio: "",
        created: new Date(),
        profilePicture: "",
        followers: [],
        following: [],
        posts: [],
      });
      navigate("/home");
    } catch (error) {
      console.error(error);
      setError("Failed to sign up. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-[800px] mx-auto grid md:grid-cols-2 h-[100vh]">
        <div className="mx-auto hidden md:flex items-center justify-center py-10">
          {phoneImages(400)}
        </div>
        <div className="flex flex-col justify-center items-center py-10">
          <div
            className={`border border-gray-300 ${
              error ? "h-[450px]" : "h-[410px]"
            } w-[340px] mb-2`}>
            <div className="mb-6 mt-12 mx-auto flex justify-center">
              {loginInstagramIcon("white")}
            </div>
            <div>
              <div>
                <input
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="bg-gray-50 text-xs border border-gray-200 w-[260px] h-[38px] my-2 rounded-sm px-3 outline-none font-proxima font-light block mx-auto"
                />
                <input
                  placeholder="Full name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                  }}
                  className="bg-gray-50 text-xs border border-gray-200 w-[260px] h-[38px] my-2 rounded-sm px-3 outline-none font-proxima font-light block mx-auto"
                />
                <input
                  placeholder="Username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  className="bg-gray-50 text-xs border border-gray-200 w-[260px] h-[38px] my-2 rounded-sm px-3 outline-none font-proxima font-light block mx-auto"
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="bg-gray-50 text-xs border border-gray-200 w-[260px] h-[38px] my-2 rounded-sm px-3 outline-none font-proxima font-light block mx-auto"
                />
              </div>
              <div className="text-white font-proxima">
                <button
                  onClick={() => {
                    attemptSignup();
                  }}
                  className="mt-4 bg-[#4cb5f9] font-semibold rounded-lg w-[260px] h-[30px] text-sm block mx-auto">
                  Sign up
                </button>
                <button className="mt-2 bg-[#4cb5f9] font-semibold rounded-lg w-[260px] h-[30px] text-sm block mx-auto">
                  Sign up with Google
                </button>
              </div>
              <div className="text-red-500 mt-6 font-proxima font-regular text-sm text-center mx-auto">
                {error && <p>{error}</p>}
              </div>
            </div>
          </div>
          <div className="border border-gray-300 h-[70px] w-[340px] flex flex-col justify-center items-center">
            <p className="font-proxima font-regular text-sm">
              Already have an account?{" "}
              <Link to="/" className="text-[#4cb5f9]">
                Log in
              </Link>
            </p>
          </div>
          <div className="mt-2 w-[340px] h-[100px] flex flex-col justify-center items-center">
            <p className="font-proxima font-regular text-sm mb-4">Get the app</p>
            <div className="flex w-[240px] justify-between">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://play.google.com/store/apps/details?id=com.instagram.android&pli=1">
                {getFromGooglePlayIcon(125)}
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://apps.microsoft.com/detail/9nblggh5l9xt?hl=en-US&gl=US">
                {getFromMicrosoft(105)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
