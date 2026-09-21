import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Gửi sự kiện xem trang (Page View) thủ công cho React Router (SPA)
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    });
  }
}

/**
 * Gửi một Custom Event bất kỳ lên Google Analytics 4
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * Theo dõi hành vi xem chi tiết món ăn/đồ uống (E-commerce GA4 standard)
 */
export function trackViewItem(item: { id: number | string; name: string; price: number; category?: string }) {
  trackEvent('view_item', {
    currency: 'VND',
    value: item.price,
    items: [
      {
        item_id: String(item.id),
        item_name: item.name,
        item_category: item.category || 'Beverage',
        price: item.price,
        quantity: 1,
      },
    ],
  });
}

/**
 * Theo dõi hành vi thêm món vào giỏ hàng (E-commerce GA4 standard)
 */
export function trackAddToCart(item: { id: number | string; name: string; price: number; quantity?: number; size?: string }) {
  const qty = item.quantity || 1;
  trackEvent('add_to_cart', {
    currency: 'VND',
    value: item.price * qty,
    items: [
      {
        item_id: String(item.id),
        item_name: item.name,
        item_variant: item.size || 'M',
        price: item.price,
        quantity: qty,
      },
    ],
  });
}

/**
 * Theo dõi đơn hàng thanh toán thành công (Purchase GA4 standard)
 */
export function trackPurchase(order: { orderCode: string; totalAmount: number; items?: any[] }) {
  trackEvent('purchase', {
    transaction_id: order.orderCode,
    value: order.totalAmount,
    currency: 'VND',
    items: order.items?.map((item) => ({
      item_id: String(item.menuItemId || item.id),
      item_name: item.menuItemName || item.name,
      price: item.unitPrice || item.price,
      quantity: item.quantity,
    })) || [],
  });
}

/**
 * Theo dõi tương tác với Trợ lý AI Sommelier
 */
export function trackAiInteraction(action: 'opened' | 'prompt_sent' | 'suggestion_clicked', label?: string) {
  trackEvent('ai_sommelier_interaction', {
    action,
    label: label || '',
  });
}

/**
 * Gửi số đo Core Web Vitals về Google Analytics 4
 * LCP: Tốc độ tải nội dung lớn nhất
 * INP: Độ trễ phản hồi tương tác người dùng
 * CLS: Điểm giật lag layout giao diện
 * FCP: Tốc độ bắt đầu vẽ giao diện
 * TTFB: Thời gian phản hồi từ server
 */
function sendMetricToGA(metric: Metric) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
      metric_value: metric.value,
      metric_rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      non_interaction: true,
    });
  }
}

/**
 * Khởi động theo dõi hiệu năng website (Core Web Vitals)
 */
export function initPerformanceMonitoring() {
  try {
    onCLS(sendMetricToGA);
    onINP(sendMetricToGA);
    onLCP(sendMetricToGA);
    onFCP(sendMetricToGA);
    onTTFB(sendMetricToGA);
  } catch (err) {
    console.warn('[Analytics] Lỗi khi kích hoạt Core Web Vitals:', err);
  }
}
