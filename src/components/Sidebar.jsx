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
import { db, collection, getDocs, query, where } from "../firebase";

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const [profilePicture, setProfilePicture] = useState("");
  const [active, setActive] = useState("Home");

  useEffect(() => {
    const fetchUserData = async () => {
      const userID = currentUser.uid;
      const q = query(collection(db, "users"), where("uid", "==", userID));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const profilePicture = doc.data().profilePicture;
        if (!profilePicture) {
          setProfilePicture(
            "https://instagram.fbdo9-1.fna.fbcdn.net/v/t51.2885-19/44884218_345707102882519_2446069589734326272_n.jpg?_nc_ht=instagram.fbdo9-1.fna.fbcdn.net&_nc_cat=1&_nc_ohc=Td_IQgWtSGQQ7kNvgF7BlkP&edm=AJgCAUABAAAA&ccb=7-5&ig_cache_key=YW5vbnltb3VzX3Byb2ZpbGVfcGlj.2-ccb7-5&oh=00_AfB4DUM864FC9UJgB_NpyC9GDUd-UrBDZzCdOcYfoYLtjg&oe=662DB10F&_nc_sid=f93d1f"
          );
        } else {
          setProfilePicture(profilePicture);
        }
      });
    };
    fetchUserData();
  }, []);

  const topSidebarItems = [
    { icon: homeIcon("white"), text: "Home", to: "/home" },
    { icon: searchIcon("white"), text: "Search", to: "/search" },
    { icon: exploreIcon("white"), text: "Explore", to: "/explore" },
    { icon: reelsIcon("white"), text: "Reels", to: "/reels" },
    { icon: messagesIcon("white"), text: "Messages", to: "/messages" },
    { icon: notificationsIcon("white"), text: "Notifications", to: "/notifications" },
    { icon: createIcon("white"), text: "Create", to: "/create" },
    {
      icon: <img src={profilePicture} alt="profile" className="w-[24px] h-[24px] rounded-full" />,
      text: "Profile",
      to: "/profile",
    },
  ];
  const bottomSidebarItems = [
    { icon: threadsIcon("white"), text: "Threads", to: "/threads" },
    { icon: moreIcon("white"), text: "More", to: "/more" },
  ];

  return (
    <div className="h-screen w-[72px] md:w-[245px] fixed bg-[#000000] text-white md:px-[25px] py-[40px] flex flex-col border-r border-[#212121]">
      <div className="hidden md:block mb-[50px]">{largeHomeInstagramIcon("white")}</div>
      <div className="mb-[50px] md:hidden mx-auto">{smallHomeInstagramLogo("white")}</div>
      <div className="flex flex-col justify-between flex-grow">
        <ul>
          {topSidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              text={item.text}
              to={item.to}
              active={active == item.text}
              noMargin={index == topSidebarItems.length - 1}
            />
          ))}
        </ul>
        <ul>
          {bottomSidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              text={item.text}
              to={item.to}
              noMargin={index == bottomSidebarItems.length - 1}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, active, to, noMargin }) => {
  return (
    <li
      className={`font-proxima text-md ${noMargin ? "" : "mb-8"} ${
        active && active == true ? "font-bold" : "font-regular"
      }`}>
      <Link to={to} className="flex items-end justify-center md:justify-start">
        <div className="md:mr-4">{icon}</div>
        <p className="md:h-[22px] hidden md:block">{text}</p>
      </Link>
    </li>
  );
};

export default Sidebar;
