import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  smallHomeInstagramLogo,
  largeHomeInstagramIcon,
  homeIcon,
  searchIcon,
  exploreIcon,
  reelsIcon,
  messagesIcon,
  notificationsIcon,
  createIcon,
  threadsIcon,
  moreIcon,
} from "../assets/images";
import { useEffect, useState } from "react";
import defaultProfile from "../assets/images/default-profile.jpg";
import CreateModal from "./CreateModal";
import { db, collection, getDocs, query, where } from "../firebase";

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const [profilePicture, setProfilePicture] = useState(defaultProfile);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = currentUser.uid;
      const q = query(collection(db, "users"), where("uid", "==", userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const profilePicture = doc.data().profilePicture;
        if (profilePicture) {
          setProfilePicture(profilePicture);
        }
      });
    };
    fetchUserData();
  }, [currentUser]);

  return (
    <div className="overflow-hidden h-screen w-[72px] md:w-[245px] bg-[#000000] text-white md:px-[25px] py-[40px] flex flex-col border-r border-[#212121]">
      <CreateModal isOpen={isOpenCreateModal} setOpen={setIsOpenCreateModal} />
      <div className="hidden md:block mb-[50px]">{largeHomeInstagramIcon("white")}</div>
      <div className="mb-[50px] md:hidden mx-auto">{smallHomeInstagramLogo("white")}</div>
      <div className="flex flex-col justify-between flex-grow">
        <ul>
          <SidebarItem icon={homeIcon("white")} text="Home" to="/home" />
          <SidebarItem icon={searchIcon("white")} text="Search" to="/search" />
          <SidebarItem icon={exploreIcon("white")} text="Explore" to="/explore" />
          <SidebarItem icon={reelsIcon("white")} text="Reels" to="/reels" />
          <SidebarItem icon={messagesIcon("white")} text="Messages" to="/messages" />
          <SidebarItem icon={notificationsIcon("white")} text="Notifications" to="/notifications" />
          <SidebarItem
            icon={createIcon("white")}
            text="Create"
            onClick={() => setIsOpenCreateModal(true)}
          />
          {profilePicture && (
            <SidebarItem
              icon={
                <img
                  src={profilePicture}
                  alt="Profile picture"
                  className="w-[24px] h-[24px] rounded-full"
                />
              }
              text="Profile"
              to="/profile"
              noMargin
            />
          )}
        </ul>
        <ul>
          <SidebarItem icon={threadsIcon("white")} text="Threads" to="/threads" />
          <SidebarItem icon={moreIcon("white")} text="More" to="/more" noMargin />
        </ul>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, active, to, noMargin, onClick }) => {
  return (
    <li
      onClick={onClick}
      className={`font-proxima text-md ${noMargin ? "" : "mb-8"}`}>
      <Link to={to ? to : ""} className="flex items-end justify-center md:justify-start">
        <div className="md:mr-4">{icon}</div>
        <p className="md:h-[22px] hidden md:block">{text}</p>
      </Link>
    </li>
  );
};

export default Sidebar;
