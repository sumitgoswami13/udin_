export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
  name: 'UDIN Services',
  description: 'Professional CA Document Processing',
  theme: {
    color: '#6366f1',
  },
  retry: {
    enabled: true,
    max_count: 3,
  },
  timeout: 300, // 5 minutes
  remember_customer: true,
};