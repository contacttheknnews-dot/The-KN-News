import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdsensePage() {
  await requireUser(["AD_MANAGER", "EDITOR"]);
  const pub = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const autoAds = process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS === "true";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold mb-5">Google AdSense</h1>
      <div className="bg-white rounded-lg border border-kn-border p-6 space-y-4">
        <div>
          <p className="text-sm font-bold">Publisher ID</p>
          <p className={`text-sm mt-1 ${pub ? "text-green-700" : "text-kn-muted"}`}>
            {pub || "कॉन्फ़िगर नहीं है — विज्ञापन स्थानों पर placeholder दिख रहे हैं।"}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold">Auto Ads</p>
          <p className="text-sm mt-1">{autoAds ? "Enabled" : "Disabled"}</p>
        </div>
        <div className="rounded-md bg-kn-gray p-4 text-sm leading-relaxed">
          <p className="font-bold mb-2">सेटअप कैसे करें</p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>AdSense अकाउंट स्वीकृत होने के बाद अपना Publisher ID (ca-pub-XXXX…) कॉपी करें।</li>
            <li>
              प्रोजेक्ट की <code className="bg-white px-1 rounded">.env</code> फ़ाइल में{" "}
              <code className="bg-white px-1 rounded">NEXT_PUBLIC_ADSENSE_PUBLISHER_ID</code> सेट करें।
            </li>
            <li>
              Auto Ads चाहिए तो <code className="bg-white px-1 rounded">NEXT_PUBLIC_ADSENSE_AUTO_ADS=&quot;true&quot;</code> करें।
            </li>
            <li>सर्वर restart करें — सभी 13+ ad placements अपने-आप live हो जाएंगे।</li>
          </ol>
          <p className="mt-3 text-xs text-kn-muted">
            सुरक्षा नोट: credentials कभी code में hard-code न करें — केवल environment
            variables में रखें। Slot IDs हर placement के AdSenseAd component में
            <code className="bg-white px-1 rounded ml-1">slot</code> prop से दिए जा सकते हैं।
          </p>
        </div>
      </div>
    </div>
  );
}
