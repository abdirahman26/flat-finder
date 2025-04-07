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
  role: string
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

export const pageRouting = async () => {
  const supabase = await createClient();

  // Step 1: Authenticate the user with Supabase
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
    .eq("is_verified", "Unverified"); // Changed from `false` to `"Unverified"`

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
    .neq("status", "resolved"); // status NOT EQUAL to 'resolved'

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
    .select(
   `
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
      `
    )
  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return data ?? [];
};


export const getUniqueReviewers = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("unique_reviewers")
    .select("reviewer");

  if (error) {
    console.error("Error fetching reviewers:", error);
    return [];
  }

  return data.map((row) => row.reviewer);
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
