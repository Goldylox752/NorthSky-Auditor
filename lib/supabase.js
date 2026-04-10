import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function getUserByEmail(email) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  return data;
}

export async function incrementUsage(email) {
  const user = await getUserByEmail(email);

  await supabase
    .from("users")
    .update({ uses: user.uses + 1 })
    .eq("email", email);
}
