import React, { useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { TbSocial } from 'react-icons/tb'
import {BsShare} from 'react-icons/bs'
import TextInput from '../components/TextInput'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Loading from '../components/Loading'
import CustomButton from '../components/CustomButton'
import { BgImage } from '../assets'
import { apiRequest } from '../utils'
import { UserLogin } from '../redux/userSlice'

const Login = () => {
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting]= useState(false);
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors }, } = useForm({ mode: "onChange" })

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        url: "/auth/login",
        data: data,
        method: "POST",
      });

      if (res?.status === "failed") {
        setErrMsg("Invalid ID or Password");
        return;
      } else {
        setErrMsg(res);
        const newData = { token: res?.token, ...res?.user };
        dispatch(UserLogin(newData));
        window.location.replace("/");
      }
    } catch (error) {
      console.log(error);
      setErrMsg("An error occurred while logging in.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
 
  return (
    <div className='bg-bgColor w-full h-[100vh] flex items-center justify-center p-6'>
      <div className='w-full md:w-2/3 h-fit lg:h-full 2xl:h-5/6 py-8 lg:py-0 flex bg-primary rounded-xl overflow-hidden shadow-xl'>
        {/* {LEFT} */}
        <div className='w-full lg:w1/2 h-full p-10 2xl:px-20 flex flex-col justify-center'>
          <div className='w-full flex gap-2 items-center mb-6'>
            <div className='p-2 bg-[#065ad8] rounded text-white'>
              <TbSocial />
            </div>
            <span className='text-2xl text-[#065ad8]'>
              Social Buzz
            </span>
          </div>

          <p className='text-ascent-1 text-base font-semibold'>Login to your account</p>
          <span className='text-sm mt-2 text-ascent-2'>Welcome back</span>

          <form className='py-8 flex flex-col gap-5'
          onSubmit={handleSubmit(onSubmit)}>

            <TextInput
              name="email" placeholder="email@example.com"
              label="Email Address"
              type="email"
              register={register("email", {
                required: "Email Address is required!"
              })}
              styles="w-full rounded-full"
              labelStyle='ml-2'
              error={errors.email ? errors.email.message : ""}
            />

            <TextInput
              name="password" placeholder="Password"
              label="Password"

              type="password"

              register={register("password", {
                required: "Password is required"
              })}

              styles="w-full rounded-full"
              labelStyle='ml-2'
              error={errors.password ? errors.password.message : ""}
            />

            <Link
              to="/reset-password"
              className='text-sm text-right text-blue fon-semibold'
            >Forgot Password ?</Link>

            {
              errMsg?.message && (
                <span role='alert'
                className={`text-sm 
                ${errMsg?.status == "failed" 
                ? "text-[#f64949fe]" 
                : "text-[#2ba150fe]"}
                 mt-0.5`}>

                  {errMsg?.message}</span>
              )
            }

            {
              isSubmitting ? <Loading/> : <CustomButton 
              type="submit" 
              containerStyles={`inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`} 
              title="Login"/>
            }

          </form>

            <p className='text-ascent-2 text-sm text-center'>
              Don't have an account?
              <Link to='/register'
              className='text-[#065ad8] font-semibold ml-2 cursor-pointer'>
              Create Account
              </Link>
            </p>
        </div>

        {/* {RIGHT} */}
        <div className='hidden w-1/2 h-full lg:flex flex-col items-center justify-center bg-blue'>
          <div className='relative w-full flex items-center justify-center'>
              <img 
                src={BgImage}
                alt='Bg Image'
                className='w-48 2xl:w-64 h-48 2xl:h-64 rounded-full object-cover'
              />

              {/* <div className='absolute flex items-center gap-1 bg-white right-10 top-10 py-2 px-5 rounded-full'>
                <BsShare size={14}/>
                <span className='text-xs font-medium'>Share</span>
              </div> */}
          </div>

            <div className='mt-16 text-center'>
              <p className='text-white text-base'>
                Connect with friends
              </p>
              <span className='text-sm text-white/80'>
                Share memories with friends and the world
              </span>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Login
