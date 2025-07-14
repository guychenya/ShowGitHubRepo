import React from 'react';
import { ArrowLeftIcon } from './IconComponents';

interface LegalPageProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBack }) => (
  <div className="max-w-4xl mx-auto animate-fade-in text-left">
    <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors mb-8">
      <ArrowLeftIcon className="h-4 w-4" />
      Back to App
    </button>
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-lg">
      <div className="prose-dark max-w-none">
        <h1>Privacy Policy</h1>
        <p>Last updated: August 1, 2024</p>
        
        <h2>1. Introduction</h2>
        <p>Welcome to GitHub Project Analyzer ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application (the "Service"). This Service is provided for educational and demonstrational purposes only.</p>
        <p>Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.</p>
        
        <h2>2. Collection of Your Information</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
        <h3>API Keys</h3>
        <p>To use the core analysis features of the Service, you must provide your own API key for the Google Gemini service ("API Key"). This API Key is stored exclusively in your browser's session storage and is only used to make requests directly from your browser to the Gemini API on your behalf. We do not have access to, transmit, or store your API Key on our servers. The key is discarded when you close your browser tab or window.</p>
        <h3>Search Queries and Repository URLs</h3>
        <p>The search terms and repository URLs you provide are sent to the Google Gemini API and the GitHub API to perform the analysis. This data is not stored or logged by our Service.</p>

        <h2>3. Use of Your Information</h2>
        <p>Your information is used solely to provide and operate the features of the Service. Specifically, we use the information you provide to:</p>
        <ul>
            <li>Enable API calls to Google Gemini and GitHub to fetch and analyze repository data.</li>
            <li>Display the analysis results to you within the application.</li>
            <li>Provide the core functionality of the Service.</li>
        </ul>

        <h2>4. Disclosure of Your Information</h2>
        <p>We do not share, sell, rent, or trade your API key or any other personal information with any third parties. Your interactions with third-party services (Google Gemini, GitHub) are governed by their respective privacy policies.</p>

        <h2>5. Security of Your Information</h2>
        <p>We use administrative, technical, and physical security measures to help protect your information. Your API Key is handled entirely on the client-side (in your browser) and is not stored on our servers. While we have taken reasonable steps to secure the application, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
        
        <h2>6. Third-Party Websites</h2>
        <p>The Application may contain links to third-party websites and applications of interest, including advertisements and external services, that are not affiliated with us. Once you have used these links to leave the Application, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information.</p>

        <h2>7. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.</p>
        
        <h2>8. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us through the developer's website.</p>
      </div>
    </div>
  </div>
);
