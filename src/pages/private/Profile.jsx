import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'

const Profile = () => {
  return (
    <div className="bg-black w-full h-screen text-white flex">
      <Sidebar />
      Profile
    </div>
  )
}

export default Profile
