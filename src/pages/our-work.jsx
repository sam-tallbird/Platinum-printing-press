import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import WorkImageCard from '../components/work/WorkImageCard';
import { supabase } from '../lib/supabaseClient';

export default function OurWork() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const isRTL = locale === 'ar';

  const [workItems, setWorkItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const layoutPattern = ['F', 'W', 'Q', 'A1', 'A2'];

  useEffect(() => {
    const fetchWorks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('works')
          .select('id, image_url, title_en, title_ar, description_en, description_ar')
          .order('sort_order', { ascending: true });
        
        if (fetchError) {
          throw fetchError;
        }
        
        setWorkItems(data || []);
      } catch (err) {
        console.error("Error fetching work items:", err);
        setError(err.message || 'Could not load work items.');
        setWorkItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorks();
  }, []);

  let wqPairIndex = 0;

  if (isLoading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading Our Work...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }
  
  if (workItems.length === 0) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No work items found.</p>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-12 text-gray-900 dark:text-white text-center">
          {t('ourWork.pageTitle', 'Our Work')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workItems.map((item, index, arr) => {
            const currentLayoutType = layoutPattern[index % layoutPattern.length];
            
            const imageUrl = item.image_url;
            const altText = `${t('ourWork.imageAltPrefix', 'Portfolio image')} ${item.id}`;
            const title = isRTL ? (item.title_ar || item.title_en) : item.title_en;
            const description = isRTL ? (item.description_ar || item.description_en) : item.description_en;

            if (currentLayoutType === 'Q') return null;

            if (currentLayoutType === 'W') {
              const nextItem = arr[index + 1];
              const nextLayoutType = layoutPattern[(index + 1) % layoutPattern.length];

              if (nextItem && nextLayoutType === 'Q') {
                const isEvenPair = wqPairIndex % 2 === 0;
                wqPairIndex++;
                
                const nextImageUrl = nextItem.image_url;
                const nextAltText = `${t('ourWork.imageAltPrefix', 'Portfolio image')} ${nextItem.id}`;
                const nextTitle = isRTL ? (nextItem.title_ar || nextItem.title_en) : nextItem.title_en;
                const nextDescription = isRTL ? (nextItem.description_ar || nextItem.description_en) : nextItem.description_en;

                return (
                  <div key={item.id} className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isEvenPair ? (
                      <>
                        <div className="col-span-1 md:col-span-2">
                          <WorkImageCard imageUrl={imageUrl} altText={altText} isRTL={isRTL} title={title} description={description} />
                        </div>
                        <div className="col-span-1">
                          <WorkImageCard imageUrl={nextImageUrl} altText={nextAltText} isRTL={isRTL} title={nextTitle} description={nextDescription} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-1">
                          <WorkImageCard imageUrl={nextImageUrl} altText={nextAltText} isRTL={isRTL} title={nextTitle} description={nextDescription} />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <WorkImageCard imageUrl={imageUrl} altText={altText} isRTL={isRTL} title={title} description={description} />
                        </div>
                      </>
                    )}
                  </div>
                );
              } 
            }

            return (
              <div key={item.id} className={`${currentLayoutType === 'F' ? 'md:col-span-2' : ''}`}>
                <WorkImageCard
                  imageUrl={imageUrl}
                  altText={altText}
                  isRTL={isRTL}
                  title={title}
                  description={description}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
} 