import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import { getSettings } from "@/lib/data";
import { MailIcon, PhoneIcon, MapPinIcon, WhatsAppIcon } from "@/components/icons";
import ContactForm from "./ContactForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "संपर्क करें",
  description: "The KN News की टीम से संपर्क करें — खबर, सुझाव, शिकायत या सहयोग के लिए।",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const email = settings["contact.email"] || "contacttheknnews@gmail.com";
  const phone = settings["contact.phone"] || "+91 7607711590";
  const whatsapp = settings["contact.whatsapp"] || "+91 7607711590";

  return (
    <div className="container-site py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold border-b-2 border-kn-red pb-3 max-w-3xl">
        संपर्क करें
      </h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2 items-start">
        <div>
          <p className="text-kn-muted leading-relaxed">
            कोई खबर, सुझाव, शिकायत या सहयोग का प्रस्ताव? हमें लिखें — The KN News की
            टीम शीघ्र ही आपसे संपर्क करेगी।
          </p>
          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPinIcon width={18} height={18} className="mt-0.5 text-kn-red shrink-0" />
              <span>
                <strong>{SITE.name}</strong>
                <br />
                {SITE.address}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <MailIcon width={18} height={18} className="text-kn-red shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-kn-red">{email}</a>
            </li>
            <li className="flex items-center gap-3">
              <PhoneIcon width={18} height={18} className="text-kn-red shrink-0" />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-kn-red">{phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <WhatsAppIcon width={18} height={18} className="text-kn-red shrink-0" />
              <a href={`https://wa.me/${whatsapp.replace(/\s/g, "")}`} className="hover:text-kn-red" target="_blank" rel="noopener noreferrer">
                {whatsapp}
              </a>
            </li>
          </ul>
        </div>
        <div className="bg-white border border-kn-border rounded-lg p-6 md:p-8">
          <h2 className="text-lg font-extrabold mb-4">हमें संदेश भेजें</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
