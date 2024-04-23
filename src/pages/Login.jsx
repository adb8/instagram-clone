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

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, currentUser, loginWithGoogle } = useAuth();

  const attemptLogin = async () => {
    const emailLowered = email.toLowerCase();
    if (loading) return;
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await login(emailLowered, password);
      navigate("/home");
    } catch (error) {
      console.error(error);
      setError("Failed to log in. Please try again.");
    }
    setLoading(false);
  };

  const attemptGoogleLogin = async () => {
    if (loading) return;
    try {
      setError("");
      setLoading(true);
      const result = await loginWithGoogle();
      const email = result.user.email;
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        const fullName = result.user.displayName;
        await addDoc(collection(db, "users"), {
          uid: result.user.uid,
          email: email,
          fullName: fullName,
          username: email,
          bio: "",
          created: new Date(),
          profilePicture: result.user.photoURL,
          followers: [],
          following: [],
          posts: [],
        });
      }
      navigate("/home");
    } catch (error) {
      console.error(error);
      setError("Failed to log in. Please try again.");
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
          <div className={`border border-gray-300 w-[340px] mb-2`}>
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
                  className="bg-gray-50 text-xs border border-gray-200 w-[260px] h-[38px] my-2 rounded-sm px-3 outline-none font-proxima font-light block mx-auto placeholder-gray-500"
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="bg-gray-50 text-xs border border-gray-200 w-[260px] h-[38px] my-2 rounded-sm px-3 outline-none font-proxima font-light block mx-auto placeholder-gray-500"
                />
              </div>
              <div className="text-white font-proxima mt-4 mb-6">
                <button
                  onClick={() => {
                    attemptLogin();
                  }}
                  className="bg-[#4cb5f9] font-semibold rounded-lg w-[260px] h-[30px] text-sm block mx-auto">
                  Log in
                </button>
                <button
                  className="mt-2 bg-[#4cb5f9] font-semibold rounded-lg w-[260px] h-[30px] text-sm block mx-auto"
                  onClick={() => {
                    attemptGoogleLogin();
                  }}>
                  Log in with Google
                </button>
              </div>
              {error && (
                <div className="overflow-auto break-words text-red-500 mb-4 font-proxima font-regular text-sm text-center mx-6">
                  <p>{error}</p>
                </div>
              )}
              <div className="mb-4 w-[80%] flex items-center mx-auto">
                <hr className="w-full bg-gray-400" />
                <p className="text-gray-400 text-sm mx-4">OR</p>
                <hr className="w-full bg-gray-400" />
              </div>
              <p className="font-proxima font-light text-xs text-center mb-6">
                <a href="/">Forgot password?</a>
              </p>
            </div>
          </div>
          <div className="border border-gray-300 h-[70px] w-[340px] flex flex-col justify-center items-center">
            <p className="font-proxima font-regular text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#4cb5f9]">
                Sign up
              </Link>
            </p>
          </div>
          <div className="mt-2 w-[340px] h-[100px] flex flex-col justify-center items-center">
            <p className="font-proxima font-regular text-sm mb-4">Get the app</p>
            <div className="flex w-[240px] justify-between">
              {getFromGooglePlayIcon(125)}
              {getFromMicrosoft(105)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
