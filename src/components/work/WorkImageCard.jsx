import Image from 'next/image';
import { useTranslation } from 'next-i18next';

export default function WorkImageCard({ imageUrl, altText, isRTL }) {
  const { t } = useTranslation('common');

  return (
    <div className="group relative overflow-hidden h-96">
      <Image
        src={imageUrl}
        alt={altText}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover group-hover:scale-25 group-hover:blur-3xl transition-all duration-300 ease-in-out"
      />
      <div className={`absolute inset-0 flex flex-col items-start justify-end p-4 bg-black bg-opacity-0 group-hover:bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none ${isRTL ? 'text-right' : 'text-left'}`}>
        <h3 className="text-white text-5xl font-bold mb-1">
          {t('ourWork.cardTitle', 'Project Title')}
        </h3>
        <p className="text-gray-200 text-xl">
          {t('ourWork.cardCategory', 'Category - Year')}
        </p>
      </div>
    </div>
  );
} 