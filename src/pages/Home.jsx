import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import TopBar from '../components/TopBar'
import ProfileCard from '../components/ProfileCard'
import FriendsCard from '../components/FriendsCard'
import { friends } from '../assets/data'

const Home = () => {
  const {user}=useSelector(state=>state.user);
  const [friendRequest, setFriendRequst] = useState(friends);
  const [suggestedFriends, setSuggestedFriends] = useState(friends);

  return (
    <div className='home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
      <TopBar/>

      <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
        {/* {LEFT} */}
        <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto'>
          <ProfileCard user = {user} />
          <FriendsCard friends={user?.friends}/>
        </div>
        {/* {CENTER} */}
        <div className='flex-1 h-full bg-primary px-4 flex flex-col gap-6 overflow-y-auto'>

        </div>

        {/* {RIGHT} */}
        <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
          {/* FRIEND REQUESTS */}
          <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
            <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
              <span>Friend Request</span>
              <span>{friendRequest?.length}</span>
            </div>
            </div>
          {/* SUGGESTED FRIENDS */}
          <div></div>
        </div>
      </div>
    </div>
  )
}

export default Home
