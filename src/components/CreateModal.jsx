import React from "react";
import { useAuth } from "../contexts/AuthContext";
import ReactModal from "react-modal";
import { useEffect, useState } from "react";

const CreateModal = ({ isOpen, setOpen }) => {
  return (
    <ReactModal isOpen={isOpen}>
      <p>Modal content</p>
      <button
        onClick={() => {
          setOpen(false);
        }}>
        Close
      </button>
    </ReactModal>
  );
};

export default CreateModal;
