import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import ProfilePictureUpload from './Pfp';
import PhoneVerification from './PhoneVerification';
import countriesData from "./countries.json";
import { Card } from 'antd';

const ProfileForm = ({ initialData, onSubmit, loading, firstName, lastName, submitLabel,can }) => {
  const [formData, setFormData] = useState(initialData);
  const [preview, setPreview] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(initialData.country || '');
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(initialData.state || '');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(initialData.city || '');

  useEffect(() => {
    if (selectedCountry) {
      const country = countriesData.find((c) => c.name === selectedCountry);
      setStates(country ? country.states : []);
      setFormData({ ...formData, country: country });
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const state = states.find((s) => s.name === selectedState);
      setCities(state ? state.cities : []);
      setFormData({ ...formData, state: state });
    }
  }, [selectedState]);

  useEffect(() => {
      if (selectedCity) {
        const state = states.find((s) => s.name === selectedState);
        setCities(state ? state.cities : []);
      }
    }, );
    useEffect(() => {
      if (selectedCity) {
        const state = states.find((s) => s.name === selectedState);
        setCities(state ? state.cities : []);
        const city = cities.find((c) => c.name === selectedCity);
        setFormData({ ...formData, city:city });
        console.log(formData.city)
      }
    },[selectedCity] );

  const handleChange = (e) => {
    if (e.target.name === 'profilepic') {
      const file = e.target.files[0];
      setFormData({ ...formData, profilepic: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setPreview(setFormData?.profilepic?setFormData?.profilepic:`http://127.0.0.1:8000${initialData.profilepic}`)
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handlePhoneUpdate = (newPhone) => {
    setFormData((prev) => ({ ...prev, phoneno: newPhone }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card style={{padding:"0px 200px"}}>
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Picture and Name Section */}
      <div className="flex items-center gap-6">
        <ProfilePictureUpload 
          name="profilepic"
          onChange={handleChange}
          preview={preview?preview:`http://127.0.0.1:8000${initialData.profilepic}`}
          currentImage={formData.profilepic}
        />
        <p className="text-4xl font-mono">{firstName} {lastName}</p>
      </div>

      {/* Bio Section */}
      <div className="space-y-2 "style={{marginTop:"30px"}}>
        <label className="block text-sm font-medium text-gray-900" style={{marginBottom:"10px"}}>
          About
        </label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border p-2"
        />
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
                  <PhoneVerification view={initialData.phoneno} phoneno={formData.phoneno} onPhoneChange={handlePhoneUpdate}/>
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
                  value={formData.dob|| '' }
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
      value={selectedCountry}
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
                  value={formData.pincode||null}
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
      value={selectedState}
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
      value={selectedCity}
      onChange={(e) => setSelectedCity(e.target.value)}
      onClick={(e) => setSelectedCity(e.target.value)}
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
                  value={formData.address||''}
                  onChange={handleChange}
                  type="text"
                  autoComplete="street-address"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

          </div>
        </div>

      <div className="flex justify-end gap-4 mt-8" style={{marginTop:"30px"}}>
        {/* <button 
          type="button" 
          className="px-4 py-2 text-sm font-medium text-gray-700"
          disabled={loading}
        >
          
        </button> */}
        {can}
        <button
          type="submit"
          className="cursor-pointer px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 w-30" style={{color:"white"}}
          disabled={loading}
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
    </Card>
  );
};

export { ProfileForm };