"use server";

import { createClient } from "@/supabase/server";

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

export const addListing = async (
  area: string,
  area_code: string,
  bathrooms: number,
  bedrooms: number,
  city: string,
  created_at: string,
  description: string,
  price: number,
  title: string
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

export const updateListing = async () => {};

export const getUser = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error);
  }

  return { data, error };
};
