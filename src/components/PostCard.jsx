import React from "react";
import { useState, useEffect, useRef } from "react";
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
  arrayUnion,
} from "../firebase.js";
import { formatDistanceToNowStrict } from "date-fns";
import {
  _3dotsIcon,
  saveIcon,
  shareIcon,
  commentIcon,
  notificationsIcon,
} from "../assets/images.jsx";
import { getImageSize } from "react-image-size";
import { useAuth } from "../contexts/AuthContext";
import { InView } from "react-intersection-observer";

const PostCard = ({ post, onPostLoaded, pageLoading, onPostLoadFailed }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState({
    media: true,
    author: true,
  });
  const [cancelLoad, setCancelLoad] = useState(false);
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
  const [date, setDate] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const postType = post.postType;
  const postId = post.pid;
  const videoRef = useRef(null);

  useEffect(() => {
    if (!loading.media && !loading.author) {
      onPostLoaded();
    }
    if (cancelLoad) {
      onPostLoadFailed();
    }
  }, [loading.author, loading.media, cancelLoad]);

  useEffect(() => {
    if (!post) setCancelLoad(true);
    const { caption, likes, comments, created, filePath, userId } = post;
    if (!created || !filePath || !userId) {
      setCancelLoad(true);
      return;
    }
    if (caption) setCaption(caption);
    if (likes) {
      setLikesCount(likes.length);
    } else setLikesCount(0);
    if (comments) {
      setCommentsCount(comments.length);
    } else setCommentsCount(0);

    const dateString = new Date(created.seconds * 1000);
    const formattedDateStrict = formatDistanceToNowStrict(dateString);
    const convertToShortFormat = (formattedDate) => {
      const [value, unit] = formattedDate.split(" ");
      const shortUnit = unit.charAt(0);
      if (unit === "seconds") return "now";
      if (unit === "minutes") return `${value}mi`;
      if (unit === "months") return `${value}mo`;
      return `${value}${shortUnit}`;
    };
    const shortFormatStrict = convertToShortFormat(formattedDateStrict);
    setDate(shortFormatStrict);

    const getAuthorInfo = async () => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", userId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const { email, profilePicture, fullName } = doc.data();
          if (!email || !profilePicture) {
            setCancelLoad(true);
            return;
          }
          setAuthor({ email, profilePicture, fullName });
        });
        setLoading((prev) => ({ ...prev, author: false }));
      } catch (error) {
        console.error(error);
        setCancelLoad(true);
      }
    };
    getAuthorInfo();

    const getMediaUrl = async () => {
      try {
        const url = await getDownloadURL(ref(storage, "posts/" + filePath));
        if (postType === "image") {
          const { width, height } = await getImageSize(url);
          setAspectRatio(width / height);
        } else if (postType === "video") {
          const video = document.createElement("video");
          video.src = url;
          video.onloadedmetadata = () => {
            const ratio = video.videoWidth / video.videoHeight;
            setAspectRatio(ratio);
          };
        }
        setMediaUrl(url);
      } catch (error) {
        console.error(error);
        setCancelLoad(true);
      }
    };
    getMediaUrl();
  }, []);

  const postComment = async ({ postId, comment }) => {
    if (!currentUser || !postId || !comment) {
      console.log("Invalid comment data");
      return;
    }
    try {
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
      });
      setUserComment("");
    } catch (error) {
      console.error(error);
      setUserComment("");
    }
  };

  const onMediaLoad = () => {
    setLoading((prev) => ({ ...prev, media: false }));
  };
  const onErrorLoad = () => {
    setCancelLoad(true);
  };
  const handleVideoPlay = (inView) => {
    if (videoRef.current && !pageLoading) {
      if (inView) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  if (cancelLoad) return null;
  return (
    <div className={`w-[470px] ml-auto mr-auto border-b border-gray-800 pb-4 mt-2`}>
      <div className="flex gap-3 items-center py-3">
        {author.profilePicture && (
          <img src={author.profilePicture} alt="" className="rounded-full w-[32px]" />
        )}
        <div className="text-sm">
          <span className="font-semibold">{author.email}</span> •{" "}
          <span className="text-gray-400">{date}</span>
        </div>
        <div className="ml-auto">{_3dotsIcon()}</div>
      </div>
      {mediaUrl && aspectRatio >= 1 && postType == "image" && (
        <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] min-h-[470px] overflow-hidden">
          <img
            src={mediaUrl}
            alt="Media content"
            className="object-cover max-w-[470px]"
            onLoad={onMediaLoad}
            onError={onErrorLoad}
          />
        </div>
      )}
      {mediaUrl && aspectRatio < 1 && postType == "image" && (
        <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] max-h-[580px] overflow-hidden">
          <img
            src={mediaUrl}
            alt="Media content"
            className="object-cover max-h-[580px]"
            onLoad={onMediaLoad}
            onError={onErrorLoad}
          />
        </div>
      )}
      {mediaUrl && aspectRatio >= 1 && postType == "video" && (
        <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] min-h-[470px] overflow-hidden">
          <InView onChange={handleVideoPlay}>
            <video
              onLoadedMetadata={onMediaLoad}
              onError={onErrorLoad}
              ref={videoRef}
              alt="Media content"
              muted
              className="object-cover max-w-[470px]">
              <source src={mediaUrl} type="video/mp4" />
            </video>
          </InView>
        </div>
      )}
      {mediaUrl && aspectRatio < 1 && postType == "video" && (
        <div className="rounded-sm border-[1px] border-gray-800 flex justify-center items-center w-[470px] max-h-[580px] overflow-hidden">
          <InView onChange={handleVideoPlay}>
            <video
              onLoadedMetadata={onMediaLoad}
              onError={onErrorLoad}
              ref={videoRef}
              alt="Media content"
              muted
              className="object-cover max-h-[580px]">
              <source src={mediaUrl} type="video/mp4" />
            </video>
          </InView>
        </div>
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
          <span className="font-semibold">{author.email}</span> {caption}
        </p>
      </div>
      <div className="text-sm pt-1 text-gray-400">
        <p>
          {commentsCount === 0
            ? `View all ${commentsCount} comments`
            : commentsCount === 1
            ? `View ${commentsCount} comment`
            : commentsCount > 1
            ? `View all ${commentsCount} comments`
            : ""}
        </p>
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
