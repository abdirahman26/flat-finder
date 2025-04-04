import { navRouting } from "@/app/(auth)/actions";
import ConsultantProfile from "./ConsultantProfile";
import LandlordProfile from "./LandlordProfile";

const Profile = async () => {
  const { role, error } = await navRouting();

  if (error) {
    console.error(error);
    return;
  }

  if (role === "landlord") {
    return <LandlordProfile />;
  } else if (role === "consultant") {
    return <ConsultantProfile />;
  }

  return;
};

export default Profile;
