import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiePolicyPage() {
  return (
    <StaticPage title="Cookie Policy" subtitle="अंतिम अपडेट: 1 जुलाई 2026">
      <p>
        कुकीज़ छोटी टेक्स्ट फाइलें हैं जो वेबसाइट आपके ब्राउज़र में सहेजती है ताकि
        आपका अनुभव बेहतर हो सके।
      </p>
      <h2>हम किन कुकीज़ का उपयोग करते हैं</h2>
      <ul>
        <li>
          <strong>आवश्यक कुकीज़:</strong> लॉगिन सेशन जैसी बुनियादी सुविधाओं के लिए।
        </li>
        <li>
          <strong>एनालिटिक्स कुकीज़:</strong> (यदि सक्षम हों) यह समझने के लिए कि कौन-सी
          खबरें पढ़ी जा रही हैं।
        </li>
        <li>
          <strong>विज्ञापन कुकीज़:</strong> Google AdSense जैसे नेटवर्क प्रासंगिक
          विज्ञापन दिखाने के लिए कुकीज़ का उपयोग कर सकते हैं।
        </li>
      </ul>
      <h2>कुकीज़ प्रबंधित करें</h2>
      <p>
        आप अपने ब्राउज़र की सेटिंग्स से कुकीज़ को नियंत्रित या हटा सकते हैं। ध्यान रखें
        कि आवश्यक कुकीज़ बंद करने पर कुछ सुविधाएं काम नहीं करेंगी।
      </p>
    </StaticPage>
  );
}
