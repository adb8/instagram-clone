import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'

const Reels = () => {
  return (
    <div className="bg-black w-full h-screen text-white flex">
      <Sidebar />
      Reels
    </div>
  )
}

export default Reels
