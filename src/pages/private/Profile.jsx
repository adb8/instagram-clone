import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { db, collection, getDocs, query, where } from "../../firebase";
import { gearIcon, postsIcon } from "../../assets/images";
import defaultProfile from "../../assets/images/default-profile.jpg";

const Profile = () => {
  const [profilePicture, setProfilePicture] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { currentUser } = useAuth();
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = currentUser.uid;
      const q = query(collection(db, "users"), where("uid", "==", userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const profilePicture = doc.data().profilePicture;
        const email = doc.data().email;
        const fullName = doc.data().fullName;
        const posts = doc.data().posts;
        const followers = doc.data().followers;
        const following = doc.data().following;
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
          setPostsCount(posts.length);
        } else {
          setPostsCount(0);
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

  return (
    <div className="bg-black w-full h-screen text-white flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[930px] ml-auto mr-auto mt-14">
          <div className="flex items-center gap-[12%] px-14">
            {profilePicture && (
              <img src={profilePicture} className="w-[150px] h-[150px] rounded-full mt-2" />
            )}
            <div className="h-[150px] flex flex-col flex-grow">
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
                  <span className="font-semibold text-base">{postsCount}</span> {postsCount === 1 ? "post" : "posts"}
                </p>
                <p>
                  <span className="font-semibold text-base">{followersCount}</span> {followersCount === 1 ? "follower" : "followers"}
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
                  "linear-gradient(to right, #212121 47%, white 47%, white 53%, #212121 53%)",
              }}
            />
            <div className="ml-auto mr-auto flex gap-1 items-center">
              {postsIcon("white")}
              <p className="font-medium text-sm">POSTS</p>
            </div>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
