"use server";

import { redirect } from "next/navigation";

import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabaseClient = await getServerSupabaseClient();
  await supabaseClient.auth.signOut();

  redirect("/login");
}
