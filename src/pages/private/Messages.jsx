import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'

const Messages = () => {
  return (
    <div className="bg-black w-full h-screen text-white flex">
      <Sidebar />
      Messages
    </div>
  )
}

export default Messages
