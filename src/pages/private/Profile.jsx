import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  db,
  collection,
  getDocs,
  query,
  where,
  getDownloadURL,
  ref,
  storage,
  getDoc,
  doc,
} from "../../firebase";
import { gearIcon, postsIcon, loadingIcon } from "../../assets/images";
import defaultProfile from "../../assets/images/default-profile.jpg";

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [mediaUrls, setMediaUrls] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsLoaded, setPostsLoaded] = useState(0);
  const [postsDataRetrieved, setPostsDataRetrieved] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = currentUser.uid;
      const q = query(collection(db, "users"), where("uid", "==", userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((document) => {
        const profilePicture = document.data().profilePicture;
        const email = document.data().email;
        const fullName = document.data().fullName;
        let posts = document.data().posts;
        const followers = document.data().followers;
        const following = document.data().following;
        if (profilePicture) {
          setProfilePicture(profilePicture);
        } else {
          setProfilePicture(defaultProfile);
        }
        if (email) {
          setEmail(email);
        }
        if (fullName) {
          setFullName(fullName);
        }
        if (posts) {
          setPosts(posts);
          setPostsDataRetrieved(true);
          const mediaUrls = [];
          posts.forEach(async (pid, index) => {
            try {
              const docRef = doc(db, "posts", pid);
              const docSnap = await getDoc(docRef);
              const filePath = docSnap.data().filePath;
              const storageRef = ref(storage, "posts/" + filePath);
              const mediaUrl = await getDownloadURL(storageRef);
              console.log("Media URL: ", mediaUrl);
              mediaUrls.push(mediaUrl);
              if (mediaUrls.length === posts.length || index === posts.length - 1) {
                setMediaUrls(mediaUrls);
              }
            } catch (error) {
              console.error(error);
            }
          });
        } else {
          setMediaUrls([]);
          setPosts([]);
          setPostsDataRetrieved(true);
        }
        if (followers) {
          setFollowersCount(followers.length);
        } else {
          setFollowersCount(0);
        }
        if (following) {
          setFollowingCount(following.length);
        } else {
          setFollowingCount(0);
        }
      });
    };
    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    if (postsDataRetrieved && postsLoaded >= posts.length && profilePicture && email) {
      document.getElementById("loading-screen").style.display = "none";
      console.log("All data successfully loaded.");
    }
  }, [postsLoaded, postsDataRetrieved, profilePicture, email]);

  return (
    <div className="bg-black w-full h-screen text-white flex">
      <div
        className="fixed inset-0 bg-black bg-opacity-100 flex w-full h-screen justify-center items-center z-50"
        id="loading-screen">
        {loadingIcon()}
      </div>
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[930px] ml-auto mr-auto mt-14">
          <div className="flex items-center gap-[12%] px-14">
            {profilePicture && (
              <img src={profilePicture} className="w-[150px] h-[150px] rounded-full" />
            )}
            <div className="flex flex-col flex-grow mb-3">
              <div className="flex items-center gap-5">
                <p className="text-xl font-medium">{email}</p>
                <div className="flex gap-2 items-center">
                  <button className="bg-[#373639] rounded-lg w-[115px] h-[32px] text-sm font-semibold">
                    Edit profile
                  </button>
                  <button className="bg-[#373639] rounded-lg w-[115px] h-[32px] text-sm font-semibold">
                    View archive
                  </button>
                  <div>{gearIcon("white")}</div>
                </div>
              </div>
              <div className="flex items-center gap-10 mt-6 font-regular">
                <p>
                  <span className="font-semibold text-base">{posts.length}</span>{" "}
                  {posts.length === 1 ? "post" : "posts"}
                </p>
                <p>
                  <span className="font-semibold text-base">{followersCount}</span>{" "}
                  {followersCount === 1 ? "follower" : "followers"}
                </p>
                <p>
                  <span className="font-semibold text-base">{followingCount}</span> following
                </p>
              </div>
              <div className="mt-8">
                <p className="font-semibold text-sm">{fullName}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <hr
              className="w-full border-0 h-[1px] bg-gradient-to-r from-[#212121] to-[#212121] mt-12 mb-4"
              style={{
                background:
                  "linear-gradient(to right, #212121 46.8%, white 46.8%, white 53.2%, #212121 53.2%)",
              }}
            />
            <div className="ml-auto mr-auto flex gap-1.5 items-center mb-4">
              {postsIcon("white")}
              <p className="font-medium text-[13px]">POSTS</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {mediaUrls &&
              mediaUrls.map((mediaUrl) => (
                <div className="rect-img-container">
                  <img
                    src={mediaUrl}
                    alt="Post"
                    className="rect-img object-cover"
                    onLoad={() => {
                      setPostsLoaded((prev) => {
                        console.log("Posts loaded: ", prev + 1, " out of ", mediaUrls.length);
                        return prev + 1;
                      });
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
