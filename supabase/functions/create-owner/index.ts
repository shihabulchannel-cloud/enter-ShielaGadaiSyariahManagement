import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: "shiela@gadaisyariah.com",
    password: "Shiela@2026",
    email_confirm: true,
    user_metadata: { nama_lengkap: "Shiela (Owner)", role: "owner" },
  });

  if (authError && !authError.message.includes("already been registered")) {
    return new Response(JSON.stringify({ error: authError.message }), { status: 400 });
  }

  const userId = authData?.user?.id;

  if (userId) {
    // Upsert profile with owner role
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      nama_lengkap: "Shiela (Owner)",
      email: "shiela@gadaisyariah.com",
      role: "owner",
      is_active: true,
    }, { onConflict: "id" });

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), { status: 400 });
    }
  }

  return new Response(JSON.stringify({ success: true, message: "Owner account ready!" }), {
    headers: { "Content-Type": "application/json" },
  });
});
