export type FaqEntry = {
  question: string
  answer: string
  category: string
}

export const faqData: FaqEntry[] = [
  {
    question: "What are your business hours?",
    answer:
      "Our support team is available Monday through Friday, 9:00 AM to 6:00 PM EST. We're closed on weekends and major holidays.",
    category: "General",
  },
  {
    question: "Where are you located?",
    answer:
      "Our headquarters is located in San Francisco, California, but we operate fully online and serve customers worldwide.",
    category: "General",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "You can reach our support team via email at support@example.com, through this chat, or by calling +1-800-555-0199 during business hours.",
    category: "General",
  },
  {
    question: "How can I reset my password?",
    answer:
      "To reset your password, click the 'Forgot Password' link on the login page, enter your email address, and follow the instructions sent to your inbox.",
    category: "Account",
  },
  {
    question: "How do I create a new account?",
    answer:
      "Click the 'Sign Up' button on the top right of our homepage, fill in your details, and verify your email address to activate your account.",
    category: "Account",
  },
  {
    question: "How do I delete my account?",
    answer:
      "You can delete your account from Settings > Account > Delete Account. Please note this action is permanent and cannot be undone.",
    category: "Account",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "Go to Settings > Profile, edit your information such as name, email, or avatar, then click 'Save Changes' to update your profile.",
    category: "Account",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay.",
    category: "Billing",
  },
  {
    question: "How do I update my billing information?",
    answer:
      "Navigate to Settings > Billing, where you can add, edit, or remove payment methods and update your billing address.",
    category: "Billing",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes, we offer a 30-day money-back guarantee. Contact our support team with your order details to request a refund.",
    category: "Billing",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "To cancel your subscription, go to Settings > Billing > Subscription and click 'Cancel Subscription'. You'll retain access until the end of your billing period.",
    category: "Billing",
  },
  {
    question: "Do you offer discounts for annual plans?",
    answer:
      "Yes! Annual plans come with a 20% discount compared to paying monthly. You can switch to annual billing anytime in your account settings.",
    category: "Billing",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 5-7 business days, while express shipping takes 1-2 business days. Delivery times may vary based on your location.",
    category: "Shipping",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to over 100 countries worldwide. International shipping times and fees vary depending on the destination.",
    category: "Shipping",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can also view tracking details under Orders in your account dashboard.",
    category: "Shipping",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of delivery. Items must be unused and in their original packaging. Visit our Returns page to start a return.",
    category: "Shipping",
  },
  {
    question: "The app keeps crashing, what should I do?",
    answer:
      "Try restarting the app and clearing its cache. If the problem persists, make sure you have the latest version installed, or contact support with your device details.",
    category: "Technical",
  },
  {
    question: "Why can't I log in to my account?",
    answer:
      "Login issues are often caused by incorrect credentials or an unverified email. Try resetting your password, and ensure your account is verified. Contact support if the issue continues.",
    category: "Technical",
  },
  {
    question: "Which browsers are supported?",
    answer:
      "Our platform supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend keeping your browser up to date.",
    category: "Technical",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use industry-standard encryption (AES-256) for data at rest and TLS for data in transit. We never share your personal information with third parties.",
    category: "Technical",
  },
  {
    question: "Do you have a mobile app?",
    answer:
      "Yes, our mobile app is available for both iOS and Android. You can download it from the Apple App Store or Google Play Store.",
    category: "Technical",
  },
  {
    question: "How do I enable two-factor authentication?",
    answer:
      "Go to Settings > Security > Two-Factor Authentication and follow the prompts to set it up using an authenticator app or SMS verification.",
    category: "Account",
  },
]

export const categories = ["All", ...Array.from(new Set(faqData.map((f) => f.category)))]
