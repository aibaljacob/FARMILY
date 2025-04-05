import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        // Fetch user details
        const userRes = await fetch("http://127.0.0.1:8000/dashboard/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setUser(userData);
        // Fetch profile (farmer or buyer)
        const profileUrl = userData.user.role==1
          ? "http://127.0.0.1:8000/api/farmer-profile/"
          : "http://127.0.0.1:8000/api/buyer-profile/";

        const profileRes = await fetch(profileUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserAndProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, setUser, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
