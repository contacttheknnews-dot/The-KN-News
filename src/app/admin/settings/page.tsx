import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser(["EDITOR"]);
  const settings = await getSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold mb-5">Website Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
