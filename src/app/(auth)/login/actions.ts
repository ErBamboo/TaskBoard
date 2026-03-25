"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getSetupState } from "@/features/setup/get-setup-state";
import { resolvePostSignInPath } from "@/features/setup/setup-routing";
import { getServerSupabaseClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱地址。"),
  password: z.string().min(1, "请输入密码。"),
  redirectTo: z.string().optional(),
});

export type LoginActionState = {
  message: string;
  status: "error" | "idle";
};

export async function signInAction(
  previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsedPayload = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsedPayload.success) {
    return {
      status: "error",
      message: parsedPayload.error.issues[0]?.message ?? "登录信息不完整。",
    };
  }

  const supabaseClient = await getServerSupabaseClient();
  const { data: signInData, error } = await supabaseClient.auth.signInWithPassword({
    email: parsedPayload.data.email,
    password: parsedPayload.data.password,
  });

  if (error) {
    return {
      ...previousState,
      status: "error",
      message: "登录失败，请检查账号和密码。",
    };
  }

  const signedInUser = signInData.user;

  if (!signedInUser) {
    return {
      ...previousState,
      status: "error",
      message: "登录状态异常，请稍后重试。",
    };
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("user_profiles")
    .select("role, is_active")
    .eq("id", signedInUser.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    await supabaseClient.auth.signOut();

    return {
      ...previousState,
      status: "error",
      message: "账号不可用，请联系管理员。",
    };
  }

  const setupState =
    profile.role === "admin"
      ? await getSetupState()
      : {
          isInitialized: true,
        };

  redirect(
    resolvePostSignInPath({
      requestedPath: parsedPayload.data.redirectTo,
      role: profile.role,
      isInitialized: setupState.isInitialized,
    }),
  );
}
