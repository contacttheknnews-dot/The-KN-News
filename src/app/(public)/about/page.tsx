// import type { Metadata } from "next";
// import StaticPage from "@/components/StaticPage";
// import { SITE } from "@/lib/constants";

// export const metadata: Metadata = {
//   title: "हमारे बारे में",
//   description: "“दूरगामी सोच” एक प्रतिष्ठित सामाजिक मीडिया संस्थान के रूप में होने को अग्रसर",
// };

// export default function AboutPage() {
//   return (
//     <StaticPage title="हमारे बारे में" subtitle={SITE.tagline}>
//       <p>
//         <strong>The KN News</strong> एक डिजिटल समाचार एवं सामाजिक मीडिया मंच है, जहां
//         देश, उत्तर प्रदेश, राजनीति, क्रिकेट, खेल, मनोरंजन, बिजनेस, टेक्नोलॉजी और समाज
//         से जुड़ी महत्वपूर्ण खबरें प्रस्तुत की जाती हैं।
//       </p>
//       <h2>हमारा मिशन</h2>
//       <p>
//         हमारा मिशन है — भरोसेमंद, तथ्य-आधारित और निष्पक्ष पत्रकारिता के जरिए पाठकों तक
//         सही जानकारी पहुंचाना। हम मानते हैं कि खबर सिर्फ सूचना नहीं, समाज को दिशा देने
//         का माध्यम है। यही हमारी “दूरगामी सोच” है।
//       </p>
//       <h2>हम क्या कवर करते हैं</h2>
//       <ul>
//         <li>उत्तर प्रदेश — गाजीपुर, वाराणसी, लखनऊ, प्रयागराज सहित हर जिले की खबरें</li>
//         <li>देश-दुनिया की बड़ी खबरें और राजनीति</li>
//         <li>क्रिकेट और खेल — मैच रिपोर्ट, विश्लेषण और रिकॉर्ड्स</li>
//         <li>मनोरंजन, बिजनेस, टेक्नोलॉजी, शिक्षा और नौकरी</li>
//       </ul>
//       <h2>हमारे मूल्य</h2>
//       <ul>
//         <li><strong>सटीकता:</strong> हर खबर प्रकाशन से पहले जांची जाती है।</li>
//         <li><strong>निष्पक्षता:</strong> हम किसी दल या विचारधारा से बंधे नहीं हैं।</li>
//         <li><strong>पारदर्शिता:</strong> गलती होने पर हम खुलकर सुधार प्रकाशित करते हैं।</li>
//         <li><strong>जवाबदेही:</strong> पाठकों की प्रतिक्रिया हमारे लिए सर्वोपरि है।</li>
//       </ul>
//       <p>
//         The KN News का मुख्यालय <strong>{SITE.address}</strong> में है।
//       </p>
//     </StaticPage>
//   );
// }






import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us | The KN News",
  description:
    "The KN News, founded by Krishna Nand Yadav in Ghazipur, Uttar Pradesh, is committed to delivering accurate, timely, transparent, and comprehensive news.",
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About Us"
      subtitle="“दूरगामी सोच” एक प्रतिष्ठित सामाजिक मीडिया संस्थान के रूप में होने को अग्रसर"
    >
      {/* Introduction */}
      <h2>About Us</h2>

      <p>
        We are committed to delivering accurate, timely, and comprehensive news
        to our readers.
      </p>

      <p>
        Founded by <strong>Krishna Nand Yadav</strong> in the heart of
        <strong> Ghazipur, Uttar Pradesh</strong>, The KN News has been built
        with a commitment to responsible journalism, credible reporting, and
        meaningful news coverage.
      </p>

      <p>
        Our vision is to establish The KN News as a trusted digital news and
        social media institution that informs, educates, and empowers society
        through responsible journalism.
      </p>

      {/* Mission */}
      <h2>Our Mission</h2>

      <p>
        Our mission is to inform, educate, and empower our audience with
        in-depth news coverage and insightful analysis.
      </p>

      <p>
        We believe in the power of journalism to bring about positive change in
        society. We are dedicated to maintaining high standards of integrity,
        accuracy, transparency, and responsibility in our reporting.
      </p>

      {/* What We Offer */}
      <h2>What We Offer</h2>

      <h3>Breaking News</h3>
      <p>
        Stay updated with the latest developments from India and around the
        world. Our team works to bring readers important and timely news
        stories.
      </p>

      <h3>In-Depth Analysis</h3>
      <p>
        Beyond the headlines, we provide detailed analysis and context to help
        readers understand the implications of major events and issues.
      </p>

      <h3>Local News</h3>
      <p>
        We are proud of our roots in Ghazipur and strive to cover stories that
        matter to our local community, highlighting the culture, challenges,
        achievements, and developments of our region.
      </p>

      <h3>National & Global Perspectives</h3>
      <p>
        Our coverage extends beyond local news. We bring national and
        international developments to our readers and explain how major events
        and trends can impact society.
      </p>

      <h3>Sports & Cricket</h3>
      <p>
        The KN News provides dedicated coverage of cricket and other sports,
        including match reports, player updates, records, analysis, and major
        sporting events.
      </p>

      <h3>Digital Media</h3>
      <p>
        We use digital platforms, social media, video, and other modern
        communication channels to make news accessible to a wider audience.
      </p>

      {/* Our Journey */}
      <h2>Our Journey</h2>

      <p>
        The KN News was founded in <strong>2020</strong> by{" "}
        <strong>Krishna Nand Yadav</strong>, with roots in a small village in
        Ghazipur, Uttar Pradesh.
      </p>

      <p>
        Our journey began with a clear vision: to maintain high standards of
        journalism while providing people with accurate, timely, and meaningful
        information.
      </p>

      <p>
        What started on a small scale has continued to grow through dedication,
        hard work, and a commitment to responsible communication. Our aim is to
        continue building a trusted digital media platform for local, national,
        and global audiences.
      </p>

      {/* Our Values */}
      <h2>Our Values</h2>

      <h3>Integrity</h3>
      <p>
        We strive to maintain high ethical standards in our reporting and
        present information responsibly, accurately, and fairly.
      </p>

      <h3>Transparency</h3>
      <p>
        We believe in being transparent about our reporting process and making
        corrections whenever an error is identified.
      </p>

      <h3>Community Focus</h3>
      <p>
        We remain committed to serving the needs and interests of our local
        community in Ghazipur while also covering important national and
        international issues.
      </p>

      <h3>Accountability</h3>
      <p>
        We recognize our responsibility to provide readers with reliable
        information and to listen to their feedback.
      </p>

      {/* Our Services */}
      <h2>Our Services</h2>

      <ul>
        <li>
          <strong>News Coverage:</strong> Local, national, and international
          news.
        </li>

        <li>
          <strong>Analysis & Reports:</strong> In-depth analysis, reports, and
          informative coverage.
        </li>

        <li>
          <strong>Special Programs:</strong> Special programs, interviews, and
          coverage of important current issues.
        </li>

        <li>
          <strong>Digital Media:</strong> Website, social media, video, and
          digital news updates.
        </li>

        <li>
          <strong>Sports & Cricket:</strong> Cricket news, match reports,
          analysis, records, and sports updates.
        </li>
      </ul>

      {/* Our Team */}
      <h2>Our Team</h2>

      <p>
        The KN News is powered by a passionate team of journalists, reporters,
        editors, analysts, contributors, and digital media professionals who
        share a commitment to quality and responsible journalism.
      </p>

      <p>
        Our team works to bring readers the stories that matter while
        maintaining a strong focus on accuracy, context, and responsible
        reporting.
      </p>

      {/* Our Purpose */}
      <h2>Our Purpose</h2>

      <p>
        The primary purpose of The KN News is to present information with
        responsibility, integrity, and transparency.
      </p>

      <ul>
        <li>
          <strong>Truth & Accuracy:</strong> Present information responsibly
          and accurately.
        </li>

        <li>
          <strong>Transparency:</strong> Maintain transparency in our reporting
          and communication.
        </li>

        <li>
          <strong>Responsibility:</strong> Recognize our responsibility towards
          readers and society.
        </li>

        <li>
          <strong>Public Awareness:</strong> Help people stay informed about
          important developments.
        </li>
      </ul>

      {/* Community */}
      <h2>For Our Community</h2>

      <p>
        We believe that the role of media is not limited to providing news.
        Responsible media can also help create awareness, encourage informed
        discussion, and contribute to a stronger and more informed society.
      </p>

      <p>
        With this vision, The KN News aims to remain connected with communities
        and highlight issues, achievements, challenges, and stories that matter
        to people.
      </p>

      {/* Founder */}
      <h2>Founder</h2>

      <p>
        <strong>Krishna Nand Yadav</strong>
      </p>

      <p>
        Founder, The KN News
        <br />
        Ghazipur, Uttar Pradesh
      </p>

      <p>
        Krishna Nand Yadav founded The KN News with the vision of creating a
        responsible digital media platform that can connect people with
        accurate, timely, and meaningful information.
      </p>

      {/* Join Us */}
      <h2>Join Us</h2>

      <p>
        We invite you to be a part of our journey. Whether you are a reader
        seeking reliable news, a journalist, reporter, contributor, advertiser,
        or professional looking to collaborate, The KN News offers a platform
        for meaningful engagement and information sharing.
      </p>

      <p>
        Thank you for choosing <strong>The KN News</strong> as your trusted
        digital news source.
      </p>

      {/* Social Media */}
      <h2>Connect With Us</h2>

      <p>
        Stay connected with The KN News through our social media platforms.
      </p>

      <ul>
        <li>
          <strong>Facebook:</strong>{" "}
          <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer">
            The KN News on Facebook
          </a>
        </li>

        <li>
          <strong>Instagram:</strong>{" "}
          <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer">
            @theknnews_
          </a>
        </li>

        <li>
          <strong>YouTube:</strong>{" "}
          <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer">
            @Theknnews7
          </a>
        </li>

        <li>
          <strong>Twitter / X:</strong>{" "}
          <a href={SITE.social.x} target="_blank" rel="noopener noreferrer">
            @thekngroup7622
          </a>
        </li>

        <li>
          <strong>Telegram:</strong>{" "}
          <a href={SITE.social.telegram} target="_blank" rel="noopener noreferrer">
            t.me/theknnews
          </a>
        </li>

        <li>
          <strong>WhatsApp Channel:</strong>{" "}
          <a href={SITE.social.whatsapp} target="_blank" rel="noopener noreferrer">
            The KN News on WhatsApp
          </a>
        </li>
      </ul>

      {/* Contact */}
      <h2>Contact Us</h2>

      <p>
        If you have any questions, feedback, suggestions, news tips, or
        collaboration proposals, please do not hesitate to contact us.
      </p>

      <p>
        <strong>Address:</strong>
        <br />
        Ghazipur, Uttar Pradesh, India
      </p>

      <p>
        <strong>Phone:</strong>{" "}
        <a href="tel:+917607711590">7607711590</a>
      </p>

      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:contacttheknnews@gmail.com">
          contacttheknnews@gmail.com
        </a>
      </p>

      <p>
        We are always happy to hear from our readers and community. Your
        feedback helps us improve and serve you better.
      </p>

      {/* Hindi Founder Section */}
      <h2>हमारे बारे में</h2>

      <p>
        <strong>कृष्णा नंद यादव द्वारा स्थापित THE KN News</strong>
      </p>

      <h3>परिचय</h3>

      <p>
        मैं, <strong>कृष्णा नंद यादव</strong>, गाजीपुर, उत्तर प्रदेश का निवासी
        और THE KN News का संस्थापक हूँ। हमारा मिशन सटीक, निष्पक्ष और ताज़ा
        समाचारों को जिम्मेदारी के साथ पाठकों तक पहुंचाना है।
      </p>

      <h3>हमारी यात्रा</h3>

      <p>
        गाजीपुर के एक छोटे से गाँव से अपनी यात्रा शुरू करते हुए हमने वर्ष{" "}
        <strong>2020</strong> में THE KN News की स्थापना की। हमारा लक्ष्य
        पत्रकारिता के उच्च मानकों को बनाए रखते हुए जनता तक सही, सटीक और
        महत्वपूर्ण जानकारी पहुंचाना था।
      </p>

      <p>
        हमारी शुरुआत छोटे स्तर पर हुई, लेकिन समर्पण, मेहनत और ईमानदार प्रयासों
        के साथ हमने अपनी पहचान बनाने की दिशा में निरंतर कदम बढ़ाए हैं।
      </p>

      <h3>हमारी सेवाएँ</h3>

      <ul>
        <li>स्थानीय, राष्ट्रीय और अंतर्राष्ट्रीय समाचार कवरेज</li>
        <li>गहन विश्लेषण एवं विशेष रिपोर्ट</li>
        <li>सामयिक विषयों पर विशेष कार्यक्रम एवं इंटरव्यू</li>
        <li>वेबसाइट एवं सोशल मीडिया के माध्यम से डिजिटल अपडेट्स</li>
        <li>क्रिकेट, खेल और अन्य महत्वपूर्ण घटनाओं की कवरेज</li>
      </ul>

      <h3>हमारा उद्देश्य</h3>

      <p>
        THE KN News का मुख्य उद्देश्य सत्यनिष्ठा, पारदर्शिता और उत्तरदायित्व के
        साथ समाचार एवं जानकारी उपलब्ध कराना है।
      </p>

      <ul>
        <li>
          <strong>सत्यनिष्ठा:</strong> समाचारों को सच्चाई और जिम्मेदारी के साथ
          प्रस्तुत करना।
        </li>

        <li>
          <strong>पारदर्शिता:</strong> हमारी रिपोर्टिंग प्रक्रिया में
          पारदर्शिता बनाए रखना।
        </li>

        <li>
          <strong>उत्तरदायित्व:</strong> जनता और पाठकों के प्रति अपनी
          जिम्मेदारी को समझना।
        </li>

        <li>
          <strong>जन-जागरूकता:</strong> समाज को महत्वपूर्ण घटनाओं और मुद्दों
          के प्रति जागरूक एवं सूचित बनाना।
        </li>
      </ul>

      <h3>समुदाय के लिए</h3>

      <p>
        हमारा मानना है कि मीडिया का काम केवल समाचार उपलब्ध कराना नहीं, बल्कि
        समाज को जागरूक, शिक्षित और सशक्त बनाना भी है। इसी उद्देश्य के साथ हम
        स्थानीय समुदाय से जुड़े महत्वपूर्ण मुद्दों, उपलब्धियों और चुनौतियों को
        सामने लाने का प्रयास करते हैं।
      </p>

      <h3>संपर्क करें</h3>

      <p>
        हमें गर्व है कि <strong>THE KN News</strong> आपकी सेवा में है। अपनी राय,
        सुझाव, समाचार या सहयोग के लिए हमसे संपर्क करें।
      </p>

      <p>
        <strong>पता:</strong>
        <br />
        GHAZIPUR, UTTAR PRADESH, INDIA
      </p>

      <p>
        <strong>फोन:</strong>{" "}
        <a href="tel:+917607711590">7607711590</a>
      </p>

      <p>
        <strong>ईमेल:</strong>{" "}
        <a href="mailto:contacttheknnews@gmail.com">
          contacttheknnews@gmail.com
        </a>
      </p>

      <p>
        हम आपकी उम्मीदों पर खरा उतरने के लिए सदैव तत्पर हैं और हमें विश्वास है
        कि आपका समर्थन हमें और भी ऊँचाइयों तक पहुँचने के लिए प्रेरित करेगा।
      </p>

      <p>
        <strong>धन्यवाद!</strong>
      </p>

      <p>
        <strong>
          कृष्णा नंद यादव
          <br />
          संस्थापक, THE KN News
        </strong>
      </p>
    </StaticPage>
  );
}