"use server";


import { createClient } from "@/supabase/server";
import { subDays, formatISO } from "date-fns";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  id_number: number;
}

interface AuthError {
  message: string;
  status?: number;
}

interface SignUpResponse {
  data: AuthUser | null;
  error: AuthError | null;
}

export const signUpFunc = async (
  email: string,
  password: string,
  id_number: number,
  first_name: string,
  role: string,
): Promise<SignUpResponse> => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  if (data?.user) {
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: data.user.id,
          id_number,
          first_name,
          role,
          email,
        },
      ])
      .select();

    // Return the data and any insert errors
    if (insertError) {
      return { data: null, error: insertError };
    }

    return { data: insertData ? insertData[0] : null, error: null };
  }

  return { data: null, error: null };
};

export const signInFunc = async (email: string, password: string) => {
  const supabase = await createClient();

  // Step 1: Authenticate the user with Supabase
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    // If there is an authentication error, return it
    return { data: null, error: authError, role: null };
  }

  // Step 2: If the authentication is successful, fetch the user's role from the "users" table
  if (authData?.user) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role") // Selecting only the role column
      .eq("id", authData.user.id) // Match the user's ID
      .single(); // Only expect a single row for the authenticated user

    if (userError || !userData) {
      // If there is an error fetching the user's role, return an error
      return { data: null, error: userError, role: null };
    }

    // Return the user data and role
    const lowerCaseRole = userData.role.toLowerCase();
    return { data: userData, error: null, role: lowerCaseRole };
  }

  // If authentication fails, return null for the data and role
  return { data: null, error: new Error("User not found"), role: null };
};

export const signOutFunc = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const navRouting = async () => {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    // If there is an authentication error, return it
    return { data: null, error: authError, role: null };
  }

  // Step 2: If the authentication is successful, fetch the user's role from the "users" table
  if (authData?.user) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role") // Selecting only the role column
      .eq("id", authData.user.id) // Match the user's ID
      .single(); // Only expect a single row for the authenticated user

    if (userError || !userData) {
      // If there is an error fetching the user's role, return an error
      return { data: null, error: userError, role: null };
    }

    // Return the user data and role
    const lowerCaseRole = userData.role.toLowerCase();
    return { data: userData, error: null, role: lowerCaseRole };
  }

  // If authentication fails, return null for the data and role
  return { data: null, error: new Error("User not found"), role: null };
};

export const getPendingListingsCount = async (): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", "Unverified"); 

  if (error) {
    console.error("Error fetching pending listings count:", error);
    return 0;
  }

  return count ?? 0;
};


export const getUserSignupsStats = async (): Promise<{
  past7DaysCount: number;
  todayCount: number;
}> => {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const sevenDaysAgoISO = sevenDaysAgo.toISOString();
  const todayStartISO = todayStart.toISOString();

  const [{ count: past7DaysCount, error: error7d }, { count: todayCount, error: errorToday }] =
    await Promise.all([
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgoISO),

      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStartISO),
    ]);

  if (error7d || errorToday) {
    console.error("Error fetching user signup stats:", error7d || errorToday);
    return { past7DaysCount: 0, todayCount: 0 };
  }

  return {
    past7DaysCount: past7DaysCount ?? 0,
    todayCount: todayCount ?? 0,
  };
};

export const getVerifiedListingsCount = async (): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .in("is_verified", ["Verified", "FDM Verified"]); // ✅ match either value

  if (error) {
    console.error("Error fetching verified listings count:", error);
    return 0;
  }

  return count ?? 0;
};



export const getUnresolvedComplaintsCount = async (): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true })
    // count if status is not "Resolved" or "Closed" or "Rejected"
    .in("status", ["Unresolved", "In Progress", "Pending"]);

  if (error) {
    console.error("Error fetching unresolved complaints count:", error);
    return 0;
  }

  return count ?? 0;
};

export const getAllListingsOrderedByStatus = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      listing_id,
      title,
      city,
      area_code,
      is_verified,
      reviewer,
      users!listings_user_id_fkey (
        email,
        first_name
      )
    `)
    .order("is_verified", { ascending: true }); // Optional: order by status

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return data ?? [];
};

export const getUniqueReviewers = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("first_name")
    .eq("role", "Admin");

  if (error) {
    console.error("Error fetching admin reviewers:", error);
    return [];
  }

  return data.map((row) => row.first_name);
};



export const updateListingStatus = async (listing_id: string, status: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("listings")
    .update({ is_verified: status })
    .eq("listing_id", listing_id);

  if (error) {
    console.error(`Error updating status to ${status}:`, error);
    throw error;
  }
};


export const deleteListing = async (listing_id: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("listing_id", listing_id);

  if (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
};

export const assignReviewer = async (listing_id: string, reviewer: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("listings")
    .update({ reviewer }) // shorthand for { reviewer: reviewer }
    .eq("listing_id", listing_id);

  if (error) {
    console.error("Error assigning reviewer:", error);
    throw error;
  }
};


export const getAllComplaints = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      complaint_id,    
      title,
      status,
      user_id,

      listings:listing_id (
        listing_id,
        title
      ),

      users:user_id (
        id,
        role,
        first_name,
        email
      ),
      latest_message:view_latest_complaint_messages (
        user_id,
        message,
        last_message_created_at,
        role
      )
    `);

  if (error) {
    console.error("Error fetching complaints:", error);
    throw error;
  }

  return data;
};


export const updateComplaintStatus = async (complaintId: string, status: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("complaints")
    .update({ status })
    .eq("complaint_id", complaintId);

  if (error) {
    console.error("Failed to update complaint status:", error);
    throw error;
  }
};

export const deleteComplaint = async (complaintId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("complaints")
    .delete()
    .eq("complaint_id", complaintId);

  if (error) {
    console.error("Failed to delete complaint:", error);
    throw error;
  }
};

export const getComplaintMessages = async (complaintId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("complaint_messages")
    .select(`
      user_id,
      created_at,
      message,
      users:user_id (
        role
      )
    `)
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch complaint messages:", error);
    throw error;
  }

  return data;
};

export const sendComplaintMessage = async ({
  user_id,
  complaint_id,
  message,
}: {
  user_id: string;
  complaint_id: string;
  message: string;
}) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("complaint_messages")
    .insert({
      user_id,
      complaint_id,
      message,
    });

  if (error) {
    console.error("Failed to send message:", error);
    throw error;
  }

  return true;
};

export const addListing = async (
  area: string,
  area_code: string,
  bathrooms: number,
  bedrooms: number,
  city: string,
  created_at: string,
  description: string,
  price: number,
  title: string,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error);
    return { data: null, error };
  }

  if (data?.user) {
    const { data: insertData, error: insertError } = await supabase
      .from("listings")
      .insert([
        {
          area,
          area_code,
          bathrooms,
          bedrooms,
          city,
          created_at,
          description,
          user_id: data.user.id,
          price,
          title,
        },
      ])
      .select();

    if (insertError) {
      console.error("Error inserting listing:", insertError);
      return { data: null, error: insertError };
    }

    return { data: insertData ? insertData[0] : null, error: null };
  }

  return { data: null, error: "No authenticated user found" };
};

export const getListing = async (listing_id: string) => {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return { listingData: null, listingError: authError };
  }

  if (authData?.user) {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", listing_id);

    return { listingData: data ?? [], listingError: error ?? null };
  }

  return {
    listingData: null,
    listingError: new Error("User not authenticated"),
  };
};

export const getListingById = async (userId: string | string[] | undefined) => {
  if (!userId) {
    return { data: null, error: new Error("No userId provided") };
  }
  const supabase = await createClient();

  const id = Array.isArray(userId) ? userId[0] : userId;


  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      listing_images(
        url
      )
    `,
    )
    .eq("user_id", id);

  return {
    listingData: data ?? [],
    listingError: error ?? null,
  };
};

export const getAllListings = async () => {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return { listingData: null, listingError: authError };
  }

  if (authData?.user) {
    const { data, error } = await supabase.from("listings").select(
      `
       *,
       users!listings_user_id_fkey(
        first_name
       ),
       listing_images(
        url
      )
      `,
    );

    return { listingData: data ?? [], listingError: error ?? null };
  }

  return {
    listingData: null,
    listingError: new Error("User not authenticated"),
  };
};

export const removeListing = async (listing_id: string) => {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return { listingData: null, listingError: authError };
  }

  if (authData?.user) {
    const { data, error } = await supabase
      .from("listings")
      .delete()
      .eq("listing_id", listing_id);

    return { listingData: data ?? [], listingError: error ?? null };
  }

  return {
    listingData: null,
    listingError: new Error("User not authenticated"),
  };
};

export const addListingImage = async (listing_id: string, url: string) => {
  const supabase = await createClient();

  const { error } = await supabase.from("listing_images").insert([
    {
      listing_id,
      url,
    },
  ]);

  return { error };
};

export const fetchImage = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("listing_images").select("*");

    if (error) {
      throw error;
    }

    return data; // Return the data fetched from the "listing_images" table
  } catch (error) {
    console.error("Error fetching images:", error);
    throw new Error("Failed to fetch images");
  }
};

export const updateListing = async () => {};

// export const getUser = async () => {
//   const supabase = await createClient();
//   const { data, error } = await supabase.auth.getUser();

//   if (error) {
//     console.error("Error fetching user:", error);
//   }

//   return { data, error };
// };

export const getUserDetails = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.error("Error fetching auth user:", error);
    return { data: null, error };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (userError) {
    console.error("Error fetching user details:", userError);
    return { data: null, error: userError };
  }

  return { data: userData, error: null };
};
export const getUserDetailsById = async (
  userId: string | string[] | undefined,
) => {
  if (!userId) {
    return { data: null, error: new Error("No userId provided") };
  }

  const id = Array.isArray(userId) ? userId[0] : userId;

  const supabase = await createClient();
  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user details:", error);
    return { data: null, error };
  }

  return { data: userData, error: null };
};


export const addListingAvailability = async (
  listingId: string,
  availability: { available_from: string; available_to: string }[]
) => {
  const supabase = await createClient();

  const { error } = await supabase.from("listing_availability").insert(
    availability.map((a) => ({
      listing_id: listingId,
      available_from: a.available_from,
      available_to: a.available_to,
    }))
  );

  return { error };
};

export const getListingAvailability = async (listingId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listing_availability")
    .select("available_from, available_to")
    .eq("listing_id", listingId);

  if (error) {
    console.error("Error fetching listing availability:", error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const updateListingAvailability = async (
  listingId: string,
  newAvailability: { available_from: string; available_to: string }[]
) => {
  const supabase = await createClient();

  // 1. Delete old entries
  const { error: deleteError } = await supabase
    .from("listing_availability")
    .delete()
    .eq("listing_id", listingId);

  if (deleteError) {
    return { error: deleteError };
  }

  // 2. Insert new entries
  const { error: insertError } = await supabase
    .from("listing_availability")
    .insert(
      newAvailability.map((range) => ({
        listing_id: listingId,
        available_from: range.available_from,
        available_to: range.available_to,
      }))
    );

  return { error: insertError || null };
};

export const getAllFavouritesByUserID = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("favourites")
    .select("listing_id")
    .eq("user_id", user.id);

  return {
    data: data?.map((fav) => fav.listing_id) || [],
    error,
  };
};

// Adds a favourited listing
export const addFavourite = async (listing_id: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("favourites")
    .insert([{ user_id: user.id, listing_id }])
    .select();

  return { data, error };
};

// Removes a favourited listing
export const removeFavourite = async (listing_id: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("favourites")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listing_id);

  return { data, error };
};

