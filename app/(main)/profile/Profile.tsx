"use client";

import ConsultantProfile from "./ConsultantProfile";
import LandlordProfile from "./LandlordProfile";

const Profile = () => {
  const isLandlord = true;

  return <>{isLandlord ? <LandlordProfile /> : <ConsultantProfile />}</>;
};

export default Profile;
