import { useState } from 'react';
import { useTranslation } from 'next-i18next';

export default function ProductSearchBar({ searchTerm, onSearchChange }) {
  const { t } = useTranslation('common');

  const handleInputChange = (event) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="w-full max-w-4xl mb-8 md:mb-12">
      <label htmlFor="product-search" className="sr-only">
        {t('products.searchLabel', 'Search Products')}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="search"
          name="search"
          id="product-search"
          value={searchTerm}
          onChange={handleInputChange}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder={t('products.searchPlaceholder', 'Search by product name...')}
        />
      </div>
    </div>
  );
} 