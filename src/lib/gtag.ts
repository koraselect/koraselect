declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackProductClick = (
  productName: string,
  category: string,
  amazonUrl: string
): void => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'select_item', {
      item_name: productName,
      item_category: category,
      destination_url: amazonUrl
    });
  }
};

export const trackPageView = (): void => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: window.location.pathname + window.location.hash
    });
  }
};

export default trackProductClick;