import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = { title: "Correction Policy" };

export default function CorrectionPolicyPage() {
  return (
    <StaticPage title="Correction Policy" subtitle="त्रुटि सुधार नीति">
      <p>
        पत्रकारिता में गलती की गुंजाइश हमेशा रहती है — महत्वपूर्ण यह है कि गलती को
        स्वीकार कर पारदर्शी ढंग से सुधारा जाए।
      </p>
      <h2>हम कैसे सुधार करते हैं</h2>
      <ul>
        <li>तथ्यात्मक त्रुटि की पुष्टि होते ही लेख को अपडेट किया जाता है।</li>
        <li>महत्वपूर्ण सुधार लेख के साथ “अपडेटेड” समय के रूप में दर्ज होता है।</li>
        <li>गंभीर त्रुटि की स्थिति में लेख में स्पष्ट सुधार-नोट जोड़ा जाता है।</li>
        <li>शीर्षक बदलने पर पुराना URL यथासंभव कार्यरत रखा जाता है।</li>
      </ul>
      <h2>त्रुटि की सूचना दें</h2>
      <p>
        किसी खबर में त्रुटि दिखे तो संपर्क पेज से या हमारे ईमेल पर सूचित करें। कृपया
        लेख का लिंक और त्रुटि का विवरण साझा करें — संपादकीय टीम 48 घंटे के भीतर
        समीक्षा करेगी।
      </p>
    </StaticPage>
  );
}
