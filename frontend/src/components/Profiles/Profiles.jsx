<style>@import "tailwindcss";
</style>
import React, { useEffect, useState } from 'react';

import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Avatar, Card } from "antd";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import countriesData from "./countries.json";
import PhoneVerification from './PhoneVerification';
import ProfilePictureUpload from './Pfp';


export default function Profile({firstName,lastName,userid}) {
  const [profileData, setProfileData] = useState({
    user:userid,
    bio: '',
    profilepic: null,
    phoneno: '',
    dob: '',
    pincode: '',
    country: '',
    state: '',
    city: '',
    address: '',
    lat: '',
    lng: '',
  });

  const [preview, setPreview] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latLng, setLatLng] = useState(null);

  useEffect(() => {
    if (selectedCountry) {
      const country = countriesData.find((c) => c.name === selectedCountry);
      setStates(country ? country.states : []);
      setSelectedState("");
      setCities([]);
      setSelectedCity("");
      setProfileData({ ...profileData, country: selectedCountry });
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const state = states.find((s) => s.name === selectedState);
      setCities(state ? state.cities : []);
      setSelectedCity("");
      setProfileData({ ...profileData, state: selectedState });
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedCity) {
      const city = cities.find((c) => c.name === selectedCity);
      setProfileData({ ...profileData, city: selectedCity, lat: city.latitude, lng:city.longitude });
    }
  }, [selectedCity]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/farmer-profile/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProfileData(response.data);
        console.log(profileData)
        setIsEditing(true); // Switch to update mode
      } catch (error) {
        console.log("No existing profile found, user can create one.");
      }finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const handlePhoneUpdate = (newPhone) => {
    setProfileData((prev) => ({ ...prev, phoneno: newPhone }));
  };

  const handleChange = (e) => {
    if (e.target.name === 'profilepic') {
      const file = e.target.files[0];
      setProfileData({ ...profileData, profilepic: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } 
    else {
      setProfileData({ ...profileData, [e.target.name]: e.target.value });
      console.log(profileData)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    const formData = new FormData();
    for (let key in profileData) {
      formData.append(key, profileData[key]);
    }
    try {
      if (isEditing) {
        await axios.put('http://127.0.0.1:8000/api/farmer-profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Profile updated successfully!');
      } else {
        await axios.post('http://127.0.0.1:8000/api/farmer-profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Profile created successfully!');
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error('Failed to save profile.');
    }
  };

  return (
    <Card style={{padding:"0px 200px"}}>
      {loading ? <p>Loading profile...</p> : (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900" style={{color:"black"}}>Profile</h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information will be displayed publicly so be careful what you share.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="col-span-full">
              <div className="mt-2 flex items-center gap-x-3">                
                <ProfilePictureUpload 
                name="profilepic"
                onChange={handleChange}
                preview={preview}
                currentImage={profileData.profilepic instanceof File ? null : profileData.profilepic}
                />
                <p className=" font-light text-5xl font-mono text-center" style={{margin:"0px 30px"}} >{firstName} {lastName}</p>
              </div>
            </div>
            

            <div className="col-span-full">
              <label htmlFor="about" className="block text-sm/6 font-medium text-gray-900">
                About
              </label>
              <div className="mt-2">
                <textarea
                  id="about"
                  name="bio"
                  onChange={handleChange}
                  value={isEditing?profileData.bio:null}
                  rows={3}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  defaultValue={''}
                />
              </div>
              <p className="mt-3 text-sm/6 text-gray-600">Write a few sentences about yourself.</p>
            </div>

            

            {/* <div className="col-span-full">
              <label htmlFor="cover-photo" className="block text-sm/6 font-medium text-gray-900">
                Cover photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon aria-hidden="true" style={{marginLeft:"72px"}} className="mx-auto size-12 text-gray-300" />
                  <div className="mt-4 flex text-sm/6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-green-600 hover:text-green-700">
                      <span style={{paddingRight:"5px"}}>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only"  onChange={handleChange}/>
                    </label>
                    <p className="pl-1" >or drag and drop</p>
                  </div>
                  <p className="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12" style={{marginTop:"30px"}}>
          <h2 className="text-base/7 font-semibold text-gray-900" style={{color:"black"}}>Personal Information</h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            

            <div className="sm:col-span-3 sm:col-start-1">
              <label htmlFor="phoneno" className="block text-sm/6 font-medium text-gray-900">
                Phone Number
              </label>
              <div className="mt-2 relative">
                {/* <input
                  style={{height:"35px",padding:"0px 10px"}}
                  id="phoneno"
                  onChange={handleChange}
                  name="phoneno"
                  type="text"  
                  autoComplete="phoneno"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <button style={(profileData.phoneno).length===10?{color:"green",zIndex:"100"}:{color:"grey"}}
                className='cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 '
                disabled={(profileData.phoneno).length!==10}>
                  Verify
                  </button> */}
                  <PhoneVerification phoneno={profileData.phoneno} onPhoneChange={handlePhoneUpdate}/>
              </div>
            </div>

            <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Date of Birth
              </label>
              <div className="mt-2">
                <input
                  style={{height:"35px",padding:"0px 10px"}}
                  id="dob"
                  name="dob"
                  onChange={handleChange}
                  type="date"
                  autoComplete="dob"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
  <label htmlFor="country" className="block text-sm/6 font-medium text-gray-900">
    Country
  </label>
  <div className="mt-2 grid grid-cols-1">
    <select
      style={{height:"35px",padding:"0px 10px"}}
      id="country"
      name="country"
      value={isEditing?profileData.country:selectedCountry}
      onChange={(e) => setSelectedCountry(e.target.value)}
      className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
      <option value="">Select a country</option>
      {/* {countriesData.map((country) => (
        <option key={country.id} value={country.name}>
          {country.name}
        </option>
      ))} */}
      <option key={101} value="India">India</option>
    </select>
    <ChevronDownIcon
      aria-hidden="true"
      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
    />
  </div>
</div>

            <div className="sm:col-span-3">
              <label htmlFor="postal-code" className="block text-sm/6 font-medium text-gray-900">
                ZIP / Postal code
              </label>
              <div className="mt-2">
                <input
                  style={{height:"35px",padding:"0px 10px"}}
                  id="postal-code"
                  name="pincode"
                  type="number"
                  value={isEditing?profileData.pincode:null}
                  onChange={handleChange}
                  autoComplete="postal-code"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
  <label htmlFor="region" className="block text-sm/6 font-medium text-gray-900">
    State
  </label>
  <div className="mt-2 grid grid-cols-1">
    <select
      style={selectedCountry?{height:"35px",padding:"0px 10px"}:{height:"35px",padding:"0px 10px",color:"gray",borderColor:"gray"}}
      id="region"
      name="state"
      value={isEditing?profileData.state:selectedState}
      onChange={(e) => setSelectedState(e.target.value)}
      disabled={!selectedCountry}
      className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">  
      <option value="">Select a state</option>
      {states.map((state) => (
        <option key={state.id} value={state.name}>
          {state.name}
        </option>
      ))}
    </select>
    <ChevronDownIcon
      aria-hidden="true"
      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
    />
  </div>
</div>


<div className="sm:col-span-3">
  <label htmlFor="city" className="block text-sm/6 font-medium text-gray-900">
    Nearest City
  </label>
  <div className="mt-2 grid grid-cols-1">
    <select
      style={selectedState?{height:"35px",padding:"0px 10px"}:{height:"35px",padding:"0px 10px",color:"gray",borderColor:"gray"}}
      id="city"
      name="city"
      value={isEditing?profileData.city:selectedCity}
      onChange={(e) => setSelectedCity(e.target.value)}
      disabled={!selectedState}
      className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
    >
      <option value="">Select a city</option>
      {cities.map((city) => (
        <option key={city.id} value={city.name}>
          {city.name}
        </option>
      ))}
    </select>
    <ChevronDownIcon
      aria-hidden="true"
      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
    />
  </div>
</div>

            
            <div className="col-span-full">
              <label htmlFor="street-address" className="block text-sm/6 font-medium text-gray-900">
                Full address
              </label>
              <div className="mt-2">
                <input
                  style={{height:"35px",padding:"0px 10px"}}
                  id="street-address"
                  name="address"
                  value={isEditing?profileData.address:null}
                  onChange={handleChange}
                  type="text"
                  autoComplete="street-address"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

          </div>
        </div>

        
      </div>

      <div className="flex items-center justify-end gap-x-6" style={{padding:"40px 0px"}}>
        <button type="button" className="cursor-pointer text-sm/6 font-semibold text-gray-900" 
          style={{height:"40px",width:"70px"}}>
          Cancel
        </button>
        <button
          type="submit"
          style={{color:"white",height:"40px",width:"120px"}}
          className="cursor-pointer rounded-md bg-green-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          {isEditing ? 'Update Profile' : 'Create Profile'}
        </button>
      </div>
    </form>
    )}
    </Card>
  )
}
