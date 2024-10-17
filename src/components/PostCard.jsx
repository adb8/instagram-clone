import React from "react";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  db,
  storage,
  getDownloadURL,
  ref,
  doc,
  updateDoc,
  arrayUnion
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
import { useAuth } from "../contexts/AuthContext";

const PostCard = ({ post }) => {
  const { currentUser } = useAuth();
  const [caption, setCaption] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [userComment, setUserComment] = useState("");
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
  const postType = post.postType;
  const postId = post.pid;

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

  const postComment = async ({ postId, comment }) => {
    console.log(currentUser, postId, comment);
    if (!currentUser || !postId || !comment) {
      console.log("Invalid comment data.");
      return;
    }
    console.log("Commenting on post: ", postId, " with comment: ", comment);
    const commentDoc = {
      postId: postId,
      userId: currentUser.uid,
      comment: comment,
      created: new Date(),
      likes: [],
      replies: [],
      loved: false,
      pinned: false,
    };
    const docRef = await addDoc(collection(db, "comments"), commentDoc);
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion(docRef.id),
    })
    console.log("Comment written with ID: ", docRef.id);
    setUserComment("");
  };

  return (
    <div className="w-[470px] ml-auto mr-auto border-b border-gray-800 pb-4 mt-2">
      <div className="flex gap-3 items-center py-3">
        {author && author.profilePicture && author.profilePicture != "FAILED_TO_LOAD" && (
          <img src={author.profilePicture} alt="" className="rounded-full w-[32px]" />
        )}
        <div className="text-sm">
          {author && author.email && author.email != "FAILED_TO_LOAD" && (
            <span className="font-semibold">{author.email}</span>
          )}{" "}
          • <span className="text-gray-400">{date?.strict ? date.strict : ""}</span>
        </div>
        <div className="ml-auto">{_3dotsIcon()}</div>
      </div>
      {mediaUrl && mediaUrl != "FAILED_TO_LOAD" && (
        <>
          {aspectRatio && aspectRatio >= 1 && postType == "image" && (
            <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] min-h-[470px] overflow-hidden">
              <img src={mediaUrl} alt="Media content" className="object-cover max-w-[470px]" />
            </div>
          )}
          {aspectRatio && aspectRatio < 1 && postType == "image" && (
            <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] max-h-[580px] overflow-hidden">
              <img src={mediaUrl} alt="Media content" className="object-cover max-h-[580px]" />
            </div>
          )}
          {aspectRatio && aspectRatio >= 1 && postType == "video" && (
            <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] min-h-[470px] overflow-hidden">
              <video src={mediaUrl} alt="Media content" className="object-cover max-w-[470px]" />
            </div>
          )}
          {aspectRatio && aspectRatio < 1 && postType == "video" && (
            <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] max-h-[580px] overflow-hidden">
              <video src={mediaUrl} alt="Media content" className="object-cover max-h-[580px]" />
            </div>
          )}
        </>
      )}
      <div className="flex gap-4 pt-3">
        <button>{notificationsIcon("white")}</button>
        <button>{commentIcon("white")}</button>
        <button>{shareIcon("white")}</button>
        <button className="ml-auto">{saveIcon("white")}</button>
      </div>
      <div className="pt-2">
        <p className="font-semibold text-sm">{likesCount} likes</p>
      </div>
      <div>
        <p className="text-sm pt-1">
          <span className="font-semibold">
            {author && author.email && author.email != "FAILED_TO_LOAD" ? author.email : ""}
          </span>{" "}
          {caption ? caption : ""}
        </p>
      </div>
      <div className="text-sm pt-1 text-gray-400">
        <p>View all {commentsCount} comments</p>
        <input
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          type="text"
          placeholder="Add a comment..."
          className="text-white bg-transparent outline-none border-none pt-1 w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              postComment({ postId: postId, comment: userComment });
            }
          }}
        />
      </div>
    </div>
  );
};

export default PostCard;
