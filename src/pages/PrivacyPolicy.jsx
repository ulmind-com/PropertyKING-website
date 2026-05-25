import { Shield, Lock, Eye, Users, Bell, Globe, Server, Mail, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const lastUpdated = 'May 26, 2025';

  const sections = [
    {
      icon: <Eye size={22} className="text-violet-500" />,
      iconBg: 'bg-violet-50',
      title: '1. Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          text: 'When you create an account, list a property, or submit an inquiry on PropertyKing, we may collect the following personal information:',
          list: [
            'Full name, email address, and phone number',
            'Profile photo and biographical information',
            'Mailing address and location data',
            'Government-issued identification (for property listing verification)',
            'Payment and billing information (processed securely through third-party providers)',
          ],
        },
        {
          subtitle: 'Property Information',
          text: 'When you list a property, we collect:',
          list: [
            'Property address, description, and specifications',
            'Photographs, videos, and virtual tour content',
            'Pricing information and listing preferences',
            'Property documents and ownership details',
          ],
        },
        {
          subtitle: 'Automatically Collected Information',
          text: 'When you use our platform, we automatically collect:',
          list: [
            'Device information (type, operating system, browser)',
            'IP address and approximate geographic location',
            'Usage data (pages visited, features used, time spent)',
            'Cookies and similar tracking technologies',
            'Referral URLs and search queries',
          ],
        },
      ],
    },
    {
      icon: <Lock size={22} className="text-emerald-500" />,
      iconBg: 'bg-emerald-50',
      title: '2. How We Use Your Information',
      content: [
        {
          text: 'We use the information we collect for the following purposes:',
          list: [
            'To create and manage your PropertyKing account',
            'To facilitate property listings, searches, and transactions',
            'To connect property owners with potential buyers and renters',
            'To process and manage meeting requests and inquiries',
            'To send important notifications about your listings and inquiries',
            'To personalize your experience with property recommendations',
            'To improve our platform\'s functionality and user experience',
            'To detect and prevent fraudulent activity and ensure platform security',
            'To comply with legal obligations and enforce our terms of service',
            'To communicate updates, promotions, and new features (with your consent)',
          ],
        },
      ],
    },
    {
      icon: <Users size={22} className="text-blue-500" />,
      iconBg: 'bg-blue-50',
      title: '3. Information Sharing & Disclosure',
      content: [
        {
          text: 'We respect your privacy and limit how we share your information:',
          list: [
            'With other PropertyKing users when you submit an inquiry or list a property (e.g., your name, email, and phone number are shared with property owners when you request a meeting)',
            'With trusted service providers who assist us in operating our platform (hosting, analytics, email services)',
            'With law enforcement or government agencies when required by law or to protect our legal rights',
            'In connection with a merger, acquisition, or sale of assets (with prior notice)',
          ],
        },
        {
          subtitle: 'We Never',
          list: [
            'Sell your personal information to third parties for marketing purposes',
            'Share your data with advertisers without your explicit consent',
            'Provide your financial information to other users',
          ],
        },
      ],
    },
    {
      icon: <Server size={22} className="text-amber-500" />,
      iconBg: 'bg-amber-50',
      title: '4. Data Storage & Security',
      content: [
        {
          text: 'We take the security of your data seriously and implement industry-standard measures:',
          list: [
            'All data is encrypted in transit using TLS/SSL protocols',
            'Sensitive data is encrypted at rest using AES-256 encryption',
            'We use secure cloud infrastructure with regular security audits',
            'Access to personal data is restricted to authorized personnel only',
            'We conduct regular vulnerability assessments and penetration testing',
            'Multi-factor authentication is available for all accounts',
          ],
        },
        {
          subtitle: 'Data Retention',
          text: 'We retain your personal information for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time. After account deletion, we may retain certain information as required by law or for legitimate business purposes for up to 90 days.',
        },
      ],
    },
    {
      icon: <Globe size={22} className="text-rose-500" />,
      iconBg: 'bg-rose-50',
      title: '5. Cookies & Tracking Technologies',
      content: [
        {
          text: 'PropertyKing uses cookies and similar technologies to enhance your experience:',
          list: [
            'Essential cookies — Required for basic platform functionality (authentication, security)',
            'Analytics cookies — Help us understand how users interact with our platform (Google Analytics)',
            'Preference cookies — Remember your settings and preferences',
            'Performance cookies — Monitor and improve platform performance',
          ],
        },
        {
          text: 'You can manage your cookie preferences through your browser settings. Disabling certain cookies may limit some platform features.',
        },
      ],
    },
    {
      icon: <Shield size={22} className="text-indigo-500" />,
      iconBg: 'bg-indigo-50',
      title: '6. Your Rights & Choices',
      content: [
        {
          text: 'Depending on your location, you may have the following rights regarding your personal data:',
          list: [
            'Right to Access — Request a copy of the personal data we hold about you',
            'Right to Rectification — Request correction of inaccurate or incomplete data',
            'Right to Erasure — Request deletion of your personal data ("right to be forgotten")',
            'Right to Portability — Request your data in a machine-readable format',
            'Right to Object — Object to certain processing of your personal data',
            'Right to Withdraw Consent — Withdraw previously given consent at any time',
            'Right to Non-Discrimination — We will not discriminate against you for exercising your rights',
          ],
        },
        {
          text: 'To exercise any of these rights, please contact us at privacy@propertyking.com or through your account settings.',
        },
      ],
    },
    {
      icon: <Bell size={22} className="text-teal-500" />,
      iconBg: 'bg-teal-50',
      title: '7. Communications & Notifications',
      content: [
        {
          text: 'We may send you the following types of communications:',
          list: [
            'Transactional emails — Inquiry confirmations, meeting requests, status updates (cannot be opted out)',
            'Security alerts — Account activity, password changes, login from new devices (cannot be opted out)',
            'Marketing emails — New features, property recommendations, promotions (can be opted out)',
            'Push notifications — Real-time updates on inquiries and listings (can be managed in app settings)',
          ],
        },
        {
          text: 'You can manage your notification preferences in your account settings or by clicking "Unsubscribe" in any marketing email.',
        },
      ],
    },
    {
      icon: <FileText size={22} className="text-orange-500" />,
      iconBg: 'bg-orange-50',
      title: '8. Third-Party Services',
      content: [
        {
          text: 'PropertyKing integrates with the following third-party services, each governed by their own privacy policies:',
          list: [
            'Google Maps — For property location display and directions',
            'Google Analytics — For platform usage analytics',
            'Cloud Storage Providers — For secure media and document storage',
            'Payment Processors — For handling financial transactions securely',
            'Push Notification Services — For real-time mobile and web notifications',
          ],
        },
        {
          text: 'We encourage you to review the privacy policies of these third-party services.',
        },
      ],
    },
    {
      icon: <Users size={22} className="text-cyan-500" />,
      iconBg: 'bg-cyan-50',
      title: '9. Children\'s Privacy',
      content: [
        {
          text: 'PropertyKing is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected data from a minor, we will take immediate steps to delete such information.',
        },
      ],
    },
    {
      icon: <Globe size={22} className="text-purple-500" />,
      iconBg: 'bg-purple-50',
      title: '10. International Data Transfers',
      content: [
        {
          text: 'PropertyKing primarily operates in the United States. If you are accessing our platform from outside the US, please be aware that your data may be transferred to, stored, and processed in the United States. By using our platform, you consent to such transfers. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.',
        },
      ],
    },
    {
      icon: <FileText size={22} className="text-pink-500" />,
      iconBg: 'bg-pink-50',
      title: '11. Changes to This Policy',
      content: [
        {
          text: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:',
          list: [
            'Post the updated policy on this page with a revised "Last Updated" date',
            'Notify you via email or in-app notification for significant changes',
            'Provide a summary of key changes at the top of the updated policy',
          ],
        },
        {
          text: 'Your continued use of PropertyKing after any changes constitutes acceptance of the updated Privacy Policy.',
        },
      ],
    },
  ];

  return (
    <div className="pt-[72px] bg-neutral-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container-custom relative z-10 py-16 max-md:py-10 px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm font-semibold mb-8">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl max-md:text-2xl font-extrabold tracking-tight">Privacy Policy</h1>
              <p className="text-neutral-400 text-sm font-medium mt-1">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <p className="text-neutral-300 text-base leading-relaxed max-w-[720px]">
            At PropertyKing, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom px-6 py-12 max-w-[860px] mx-auto">
        {/* Quick Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-3xl p-6 mb-10 border border-blue-100">
          <h3 className="text-lg font-extrabold text-neutral-900 mb-3 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Quick Summary
          </h3>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
            {[
              { label: 'Data Collection', desc: 'We collect info you provide and usage data to improve our service' },
              { label: 'Data Sharing', desc: 'We never sell your data. Shared only to facilitate property transactions' },
              { label: 'Your Rights', desc: 'Access, correct, delete, or export your data at any time' },
              { label: 'Security', desc: 'Industry-standard encryption and security measures protect your data' },
            ].map(({ label, desc }) => (
              <div key={label} className="bg-white/70 rounded-xl p-4">
                <p className="text-sm font-bold text-neutral-900 mb-1">{label}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 max-md:p-5 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-xl ${section.iconBg} flex items-center justify-center shrink-0`}>
                  {section.icon}
                </div>
                <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight">{section.title}</h2>
              </div>
              
              <div className="flex flex-col gap-4 pl-[56px] max-md:pl-0">
                {section.content.map((block, bIdx) => (
                  <div key={bIdx}>
                    {block.subtitle && (
                      <h4 className="text-sm font-bold text-neutral-800 mb-2">{block.subtitle}</h4>
                    )}
                    {block.text && (
                      <p className="text-sm text-neutral-600 leading-relaxed mb-2">{block.text}</p>
                    )}
                    {block.list && (
                      <ul className="flex flex-col gap-2 mt-1">
                        {block.list.map((item, lIdx) => (
                          <li key={lIdx} className="flex items-start gap-2.5 text-sm text-neutral-600 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-neutral-900 rounded-3xl p-8 mt-12 text-center">
          <Mail size={32} className="text-white mx-auto mb-4" />
          <h3 className="text-xl font-extrabold text-white mb-2">Questions About Your Privacy?</h3>
          <p className="text-neutral-400 text-sm mb-5 max-w-[480px] mx-auto">
            If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please reach out to us.
          </p>
          <div className="flex max-md:flex-col items-center justify-center gap-4">
            <a href="mailto:privacy@propertyking.com" className="flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-xl font-bold text-sm no-underline hover:bg-neutral-100 transition-colors">
              <Mail size={16} /> privacy@propertyking.com
            </a>
            <span className="text-neutral-600 text-sm">PropertyKing Inc. • New York, NY 10001</span>
          </div>
        </div>
      </div>
    </div>
  );
}
