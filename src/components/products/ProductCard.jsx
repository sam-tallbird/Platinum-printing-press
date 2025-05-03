import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

export default function ProductCard({ imageUrl, productName, quoteKey, quoteDefaultText, productLink = '#' }) {
  const { t } = useTranslation('common');

  return (
    <div className="group relative rounded-lg">
      <Link href={productLink} className="block">
        <div className="relative w-full aspect-square overflow-hidden"> 
          {/* Aspect ratio changed to 1:1 */}
          <Image
            src={imageUrl}
            alt={productName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Responsive image sizes
            className="object-cover object-center group-hover:scale-125 group-hover:rotate-[15deg] transition-transform duration-300 ease-in-out"
          />
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
            {productName}
          </h3>
        </div>
      </Link>
    </div>
  );
} 