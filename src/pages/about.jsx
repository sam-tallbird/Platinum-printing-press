import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import TextImageSection from '../components/sections/TextImageSection';

export default function About() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;

  // Who We Are content
  const whoWeAreTitle = "Who We Are";
  const whoWeAreParagraphs = [
    "Since 2015, Platinum Printing Press has been driven by a clear message:",
    "To deliver professional and advanced printing services that combine production quality with execution precision.",
    "We believe that printing is an essential part of any project's identity, and our goal is to reflect your message and vision in the best possible way."
  ];

  // Arabic translations
  const whoWeAreTranslations = {
    title: "من نحن",
    paragraphs: [
      "منذ عام 2015، تعمل بلاتينيوم للطباعة بدافع من رسالة واضحة:",
      "تقديم خدمات طباعة احترافية ومتقدمة تجمع بين جودة الإنتاج ودقة التنفيذ.",
      "نؤمن بأن الطباعة جزء أساسي من هوية أي مشروع، وهدفنا هو عكس رسالتك ورؤيتك بأفضل طريقة ممكنة."
    ]
  };

  // Our Mission content
  const ourMissionTitle = "Our Mission";
  const ourMissionParagraphs = [
    "To offer advanced printing solutions that meet our clients' needs and help them achieve tangible success through outstanding quality and excellent service."
  ];

  // Arabic translations for Our Mission
  const ourMissionTranslations = {
    title: "مهمتنا",
    paragraphs: [
      "تقديم حلول طباعة متقدمة تلبي احتياجات عملائنا وتساعدهم على تحقيق نجاح ملموس من خلال الجودة المتميزة والخدمة الممتازة."
    ]
  };

  // Our Vision content
  const ourVisionTitle = "Our Vision";
  const ourVisionParagraphs = [
    "To be the trusted, go-to partner in the printing world for all those seeking creativity, precision, and exceptional quality."
  ];

  // Arabic translations for Our Vision
  const ourVisionTranslations = {
    title: "رؤيتنا",
    paragraphs: [
      "أن نكون الشريك الموثوق به والمفضل في عالم الطباعة لكل من يسعى إلى الإبداع والدقة والجودة الاستثنائية."
    ]
  };

  return (
    <div className="py-12 w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full px-0 sm:px-3">
        <div className="ps-6 pe-6">
          <h1 className="text-xl font-semibold text-start mb-4">
            {t('nav.about')}
          </h1>
          
          {locale === 'ar' ? (
            <h2 className="text-6xl font-bold text-start mb-4">
              من التصميم إلى التسليم،<br />نقدم خدمات طباعة شاملة
            </h2>
          ) : (
            <h2 className="text-6xl font-bold text-start mb-4">
              From design to delivery,<br />we provide comprehensive printing services
            </h2>
          )}

          <p className="text-xl text-start mt-6 mb-8 text-gray-600 dark:text-gray-300 max-w-3xl">
            {locale === 'ar' 
              ? 'حيث يلتقي الإبداع بالدقة، لضمان الجودة والاتساق في كل مرحلة من رحلة الطباعة الخاصة بك'
              : 'Where creativity meets precision, ensuring quality and consistency at every stage of your print journey'}
          </p>
        </div>
        
        <div className="w-full mt-4">
          <div className="ps-6 pe-6">
            <div className="overflow-hidden relative">
              <Image
                src="/images/about-us-hero.jpg"
                alt="Printing press in action showing vibrant colors"
                width={1920}
                height={600}
                className="w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <TextImageSection 
          imageUrl="/images/who-are-we.jpg"
          imageAlt="Vintage printing press with framed prints on wall"
          title={whoWeAreTitle}
          paragraphs={whoWeAreParagraphs}
          translations={whoWeAreTranslations}
          imagePosition="right"
          imageWidth={750}
          imageHeight={1000}
          className="mt-16"
        />

        <TextImageSection 
          imageUrl="/images/our-vision.jpg"
          imageAlt="Colorful CMYK printing color palette chart"
          title={ourVisionTitle}
          paragraphs={ourVisionParagraphs}
          translations={ourVisionTranslations}
          imagePosition="left"
          imageWidth={750}
          imageHeight={1000}
          className="mt-24"
        />

        <TextImageSection 
          imageUrl="/images/our-mission.jpg"
          imageAlt="Modern printing equipment showing precision and quality"
          title={ourMissionTitle}
          paragraphs={ourMissionParagraphs}
          translations={ourMissionTranslations}
          imagePosition="right"
          imageWidth={750}
          imageHeight={1000}
          className="mt-24"
        />
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 