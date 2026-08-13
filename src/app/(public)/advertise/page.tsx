import type { Metadata } from "next";
import AdInquiryForm from "./AdInquiryForm";

export const metadata: Metadata = {
  title: "Advertise With The KN News",
  description:
    "अपने ब्रांड को The KN News के दर्शकों तक पहुंचाएं — बैनर विज्ञापन, स्पॉन्सर्ड कंटेंट, वीडियो और सोशल प्रमोशन।",
};

const OFFERINGS = [
  {
    title: "Website Advertising",
    desc: "होमपेज, आर्टिकल और कैटेगरी पेजों पर प्रीमियम बैनर पोज़िशन।",
    icon: "🖥️",
  },
  {
    title: "Banner Advertising",
    desc: "डेस्कटॉप और मोबाइल के लिए अलग-अलग रिस्पॉन्सिव बैनर क्रिएटिव।",
    icon: "🖼️",
  },
  {
    title: "Sponsored Content",
    desc: "आपके ब्रांड की कहानी, हमारी संपादकीय गुणवत्ता के साथ — स्पष्ट लेबलिंग सहित।",
    icon: "📝",
  },
  {
    title: "Video Promotion",
    desc: "वीडियो न्यूज़ सेक्शन और सोशल चैनलों पर वीडियो प्रमोशन।",
    icon: "🎬",
  },
  {
    title: "Social Promotion",
    desc: "Facebook, Instagram, YouTube, X, Telegram और WhatsApp चैनलों पर प्रचार।",
    icon: "📣",
  },
  {
    title: "Brand Partnerships",
    desc: "इवेंट कवरेज, सीरीज स्पॉन्सरशिप और लंबी अवधि की साझेदारी।",
    icon: "🤝",
  },
];

export default function AdvertisePage() {
  return (
    <div className="container-site py-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-extrabold border-b-2 border-kn-red pb-3">
          Advertise With The KN News
        </h1>
        <p className="mt-4 text-lg font-bold text-kn-dark">
          “अपने ब्रांड को The KN News के दर्शकों तक पहुंचाएं।”
        </p>
        <p className="mt-2 text-kn-muted leading-relaxed">
          The KN News उत्तर प्रदेश और देशभर के पाठकों तक पहुंचने वाला तेज़ी से बढ़ता
          डिजिटल न्यूज़ प्लेटफ़ॉर्म है। हमारे साथ विज्ञापन कर आप सही दर्शकों तक,
          भरोसेमंद माहौल में अपनी बात पहुंचा सकते हैं।
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OFFERINGS.map((o) => (
          <div key={o.title} className="bg-white border border-kn-border rounded-lg p-5 hover:shadow-md transition-shadow">
            <p className="text-3xl">{o.icon}</p>
            <h2 className="mt-3 font-bold text-lg">{o.title}</h2>
            <p className="mt-1.5 text-sm text-kn-muted leading-relaxed">{o.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2 items-start">
        <div className="bg-kn-dark text-white rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-extrabold">विज्ञापन के फायदे</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-300">
            <li>✅ हिंदी पाठकों तक सीधी पहुंच — उत्तर प्रदेश में मजबूत पकड़</li>
            <li>✅ मोबाइल-फर्स्ट ऑडियंस, तेज़ लोडिंग पेज</li>
            <li>✅ स्पष्ट रूप से लेबल किए गए, भरोसेमंद विज्ञापन स्थान</li>
            <li>✅ डेस्कटॉप + मोबाइल के लिए अलग क्रिएटिव सपोर्ट</li>
            <li>✅ परफॉर्मेंस रिपोर्टिंग (इंप्रेशन/क्लिक)</li>
            <li>✅ किफायती पैकेज — छोटे व्यवसायों के लिए भी</li>
          </ul>
        </div>
        <div className="bg-white border border-kn-border rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-extrabold mb-4">Advertising Team से संपर्क करें</h2>
          <AdInquiryForm />
        </div>
      </div>
    </div>
  );
}
