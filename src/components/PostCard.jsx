import React from "react";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  db,
  storage,
  getDownloadURL,
  ref,
} from "../firebase.js";
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import {
  _3dotsIcon,
  saveIcon,
  shareIcon,
  commentIcon,
  notificationsIcon,
} from "../assets/images.jsx";
import { getImageSize } from "react-image-size";

const PostCard = ({ post }) => {
  const [caption, setCaption] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [author, setAuthor] = useState({
    email: "",
    profilePicture: "",
    fullName: "",
  });
  const [date, setDate] = useState({
    normal: "",
    strict: "",
  });
  const [mediaUrl, setMediaUrl] = useState("");

  useEffect(() => {
    const { caption, likes, comments, created, filePath, userId } = post;
    if (caption) setCaption(caption);
    if (likes) {
      const likesCount = likes.length;
      setLikesCount(likesCount);
    } else setLikesCount(0);
    if (comments) {
      const commentsCount = comments.length;
      setCommentsCount(commentsCount);
    } else setCommentsCount(0);

    const date = new Date(created.seconds * 1000);
    const formattedDate = formatDistanceToNow(date, { addSuffix: true });
    const formattedDateStrict = formatDistanceToNowStrict(date);
    const convertToShortFormat = (formattedDate) => {
      const [value, unit] = formattedDate.split(" ");
      const shortUnit = unit.charAt(0);
      if (unit === "seconds") return "now";
      if (unit === "minutes") return `${value}mi`;
      if (unit === "months") return `${value}mo`;
      return `${value}${shortUnit}`;
    };
    const shortFormatStrict = convertToShortFormat(formattedDateStrict);
    setDate({
      normal: formattedDate,
      strict: shortFormatStrict,
    });

    const getAuthorInfo = async () => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", userId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const { email, profilePicture, fullName } = doc.data();
          setAuthor({ email, profilePicture, fullName });
        });
      } catch (error) {
        console.error(error);
        setAuthor({
          email: "FAILED_TO_LOAD",
          profilePicture: "FAILED_TO_LOAD",
          fullName: "FAILED_TO_LOAD",
        });
      }
    };
    getAuthorInfo();

    const getMediaUrl = async () => {
      try {
        const url = await getDownloadURL(ref(storage, "posts/" + filePath));
        const { width, height } = await getImageSize(url);
        setAspectRatio(width / height);
        setMediaUrl(url);
      } catch (error) {
        console.error(error);
        setMediaUrl("FAILED_TO_LOAD");
      }
    };
    getMediaUrl();
  }, []);

  return (
    <div className="w-[470px] ml-auto mr-auto border-b border-gray-800 pb-4 mt-2">
      <div className="flex gap-3 items-center py-3">
        <img src={author.profilePicture} alt="" className="rounded-full w-[32px]" />
        <div className="text-sm">
          <span className="ont-semibold">{author.email}</span> •{" "}
          <span className="text-gray-400">{date.strict}</span>
        </div>
        <div className="ml-auto">{_3dotsIcon()}</div>
      </div>
      {aspectRatio && aspectRatio > 1 && (
        <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] min-h-[470px] overflow-hidden">
          <img src={mediaUrl} alt="Media content" className="object-cover max-w-[470px]" />
        </div>
      )}
      {aspectRatio && aspectRatio < 1 && (
        <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] max-h-[580px] overflow-hidden">
          <img src={mediaUrl} alt="Media content" className="object-cover max-h-[580px]" />
        </div>
      )}
      <div className="flex gap-4 pt-3">
        <button>{notificationsIcon("white")}</button>
        <button>{commentIcon("white")}</button>
        <button>{shareIcon("white")}</button>
        <button className="ml-auto">{saveIcon("white")}</button>
      </div>
      <div className="pt-2">
        <p className="font-semibold text-sm">120{likesCount} likes</p>
      </div>
      <div>
        <p className="text-sm pt-1">
          <span className="font-semibold">{author.email}</span> {caption}
        </p>
      </div>
      <div className="text-sm pt-1.5 text-gray-400">
        <p>View all {commentsCount} comments</p>
        <input
          type="text"
          placeholder="Add a comment..."
          className="bg-transparent outline-none border-none pt-1 w-full"
        />
      </div>
    </div>
  );
};

export default PostCard;
