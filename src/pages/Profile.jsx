import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar';

const Profile = () => {
  const {id} = useParams();
  const dispatch = useDispatch();
  const {user} = useSelector((state)=> state.user);
  const {userInfo, setUserInfo} = useState(null)
  const {posts} = useSelector((state)=> state.posts);
  const [loading, setLoading] = useState(false);

  return (
    <>
     <div className='home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg'>
          <TopBar />
     </div>
    </>
  )
}

export default Profile
