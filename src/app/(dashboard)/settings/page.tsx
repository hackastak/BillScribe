import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/queries/profiles";
import { LogoUpload } from "@/components/invoice/logo-upload";
import { ProfileSettings } from "@/components/settings/profile-settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-fg-default)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Manage your profile and company information
        </p>
      </div>

      <div className="space-y-6">
        <LogoUpload currentLogoUrl={profile?.logoUrl || null} />
        <ProfileSettings profile={profile} />
      </div>
    </div>
  );
}
