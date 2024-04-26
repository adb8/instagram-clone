import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import ReactModal from "react-modal";
import { photosVideosIcon, closeIcon, backIcon, sharedIcon } from "../assets/images";
import defaultProfile from "../assets/images/default-profile.jpg";
import { db, collection, getDocs, query, where, addDoc } from "../firebase";
import { storage, ref, uploadBytes } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import autosize from "autosize";
import { TailSpin } from "react-loader-spinner";

const CreateModal = ({ isOpen, setOpen }) => {
  const fileInput = useRef(null);
  const [modalState, setModalState] = useState("upload");
  const [selectedFile, setSelectedFile] = useState();
  const captionRef = useRef("");
  const { currentUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(defaultProfile);
  const [username, setUsername] = useState("Instagram user");

  useEffect(() => {
    const fetchUserData = async () => {
      const userID = currentUser.uid;
      const q = query(collection(db, "users"), where("uid", "==", userID));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const profilePicture = doc.data().profilePicture;
        const username = doc.data().username;
        if (profilePicture) {
          setProfilePicture(profilePicture);
        }
        if (username) {
          setUsername(username);
        } else {
        }
      });
    };
    fetchUserData();
    autosize(document.querySelectorAll("textarea"));
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm"];
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log("File size exceeds 10MB limit.");
      return;
    }
    if (validTypes.includes(file.type)) {
      console.log("Selected file:", file.name);
      setSelectedFile(file);
      setModalState("crop");
    } else {
      console.log("Invalid file type. Please select an image, gif, or video.");
    }
  };

  const uploadPost = async () => {
    if (!currentUser || !selectedFile || modalState != "share") {
      console.log("Invalid post data.");
      return;
    }
    try {
      setModalState("loading");
      const userID = currentUser.uid;
      const caption = captionRef.current;
      const postType = selectedFile.type.startsWith("image/") ? "image" : "video";
      const fileID = uuidv4();
      const fileExtension = selectedFile.name.split(".").pop();
      const filePath = `${fileID}.${fileExtension}`;
      const storageRef = ref(storage, "posts/" + filePath);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      console.log("Uploaded a blob or file!", snapshot);

      const post = {
        userID: userID,
        filePath: filePath,
        postType: postType,
        caption: caption,
        created: new Date(),
        tags: [],
        likes: [],
        comments: [],
      };
      const docRef = await addDoc(collection(db, "posts"), post);
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error(error);
    }
    setSelectedFile(null);
    captionRef.current = "";
    setModalState("shared");
  };

  return (
    <ReactModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={true}
      overlayClassName="ReactModal__Overlay"
      className={`${
        modalState === "share" ? "w-[820px]" : "w-[475px]"
      } h-[520px] bg-[#262626] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl outline-none`}>
      {modalState === "upload" && (
        <div>
          <input
            type="file"
            ref={fileInput}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div className="flex items-center justify-center h-[45px] border-b border-[#353535]">
            <p className="text-[#f5f5f5] font-semibold mt-1">Create new post</p>
            <div className="absolute right-0 mx-4 cursor-pointer">
              {closeIcon("white", () => setOpen(false))}
            </div>
          </div>
          <div className="h-[475px] w-full flex flex-col justify-center items-center">
            {photosVideosIcon("white")}
            <p className="text-[#f5f5f5] text-xl my-4">Drag photos and videos here</p>
            <button
              className="bg-[#0095f6] font-semibold rounded-lg w-[170px] h-[32px] text-sm text-[#f5f5f5]"
              onClick={() => {
                fileInput.current.click();
              }}>
              Select from computer
            </button>
          </div>
        </div>
      )}
      {modalState === "crop" && (
        <div>
          <div className="flex items-center justify-center h-[45px] border-b border-[#353535]">
            <p className="text-[#f5f5f5] font-semibold mt-1">Crop</p>
            <p
              className="text-[#0094f2] absolute right-0 mx-4 font-semibold text-sm cursor-pointer mt-1"
              onClick={() => {
                setModalState("share");
              }}>
              Next
            </p>
            <div className="absolute left-0 mx-4 cursor-pointer">
              {backIcon("white", () => {
                setModalState("upload");
                setSelectedFile(null);
              })}
            </div>
          </div>
          <div className="h-[475px] w-full flex flex-col justify-center items-center">
            {selectedFile && selectedFile.type.startsWith("image/") && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected"
                className="w-full h-full object-cover rounded-b-xl"
              />
            )}
            {selectedFile && selectedFile.type.startsWith("video/") && (
              <video
                loop
                autoPlay
                src={URL.createObjectURL(selectedFile)}
                className="w-full h-full object-cover rounded-b-xl"
              />
            )}
          </div>
        </div>
      )}
      {modalState === "share" && (
        <div>
          <div className="flex items-center justify-center h-[45px] border-b border-[#353535]">
            <p className="text-[#f5f5f5] font-semibold mt-1">
              {selectedFile.type.startsWith("image/") ? "New post" : "New reel"}
            </p>
            <p
              className="text-[#0094f2] absolute right-0 mx-4 font-semibold text-sm cursor-pointer mt-1"
              onClick={() => {
                uploadPost();
              }}>
              Share
            </p>
            <div className="absolute left-0 mx-4 cursor-pointer">
              {backIcon("white", () => {
                setModalState("crop");
              })}
            </div>
          </div>
          <div className="flex">
            <div className="h-[475px] w-[475px] flex flex-col justify-center items-center">
              {selectedFile && selectedFile.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected"
                  className="w-full h-full object-cover rounded-bl-xl border-r border-[#353535]"
                />
              )}
              {selectedFile && selectedFile.type.startsWith("video/") && (
                <video
                  loop
                  autoPlay
                  src={URL.createObjectURL(selectedFile)}
                  className="w-full h-full object-cover rounded-bl-xl border-r border-[#353535]"
                />
              )}
            </div>
            <div className="w-[345px] flex flex-col h-full">
              <div className="flex items-center p-4">
                <img
                  src={profilePicture}
                  alt="profile"
                  className="w-[28px] h-[28px] rounded-full mr-3"
                />
                <p className="text-[#f5f5f5] font-semibold text-sm">{username}</p>
              </div>
              <textarea
                type="text"
                defaultValue={captionRef.current}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    captionRef.current = e.target.value;
                  }
                }}
                className="bg-transparent overflow-hidden outline-none flex-grow resize-none text-[#f5f5f5] px-4 w-full placeholder:text-[#686868]"
                placeholder="Write a caption..."
              />
            </div>
          </div>
        </div>
      )}
      {modalState === "loading" && (
        <div>
          <div className="flex items-center justify-center h-[45px] border-b border-[#353535]">
            <p className="text-[#f5f5f5] font-semibold mt-1">Sharing</p>
          </div>
          <div className="h-[475px] w-full flex flex-col justify-center items-center">
            <TailSpin
              visible={true}
              height="80"
              width="80"
              color="#ffffff"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        </div>
      )}
      {modalState === "shared" && (
        <div>
          <input
            type="file"
            ref={fileInput}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div className="flex items-center justify-center h-[45px] border-b border-[#353535]">
            <p className="text-[#f5f5f5] font-semibold mt-1">Post shared</p>
            <div className="absolute right-0 mx-4 cursor-pointer">
              {closeIcon("white", () => {
                setModalState("upload");
                setOpen(false);
              })}
            </div>
          </div>
          <div className="h-[475px] w-full flex flex-col justify-center items-center">
            <div className="w-[100px]">{sharedIcon()}</div>
            <p className="text-[#f5f5f5] text-xl my-4">Your post has been shared.</p>
          </div>
        </div>
      )}
    </ReactModal>
  );
};

export default CreateModal;
