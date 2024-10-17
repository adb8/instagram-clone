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
import { formatDistanceToNow, set } from "date-fns";

const PostCard = ({ post }) => {
  const [caption, setCaption] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState([]);
  const [author, setAuthor] = useState({
    email: "",
    profilePicture: "",
    fullName: "",
  });
  const [date, setDate] = useState("");
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
    setDate(formattedDate);

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
        setMediaUrl(url);
      } catch (error) {
        console.error(error);
        setMediaUrl("FAILED_TO_LOAD");
      }
    };
    getMediaUrl();
  }, []);

  return (
    <div className="w-[470px] border h-[600px]">
      <div>{caption}</div>
      <div>{likesCount}</div>
      <div>{commentsCount}</div>
      <div>
        <img src={mediaUrl} alt="" />
      </div>
      <div>{date}</div>
      <div>
        {author.email} {author.fullName}
      </div>
      <div>
        <img src={author.profilePicture} alt="" />
      </div>
    </div>
  );
};

export default PostCard;
