'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#151515' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1B1B1B', borderBottom: '1px solid #404040' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold" style={{ color: '#FFFC74' }}>
              FitSnap
            </Link>
            <div className="flex space-x-4">
              <Link href="/login" className="px-4 py-2 hover:text-white transition-colors" style={{ color: '#979797' }}>
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-black rounded hover:opacity-90 transition-colors" style={{ backgroundColor: '#FFFC74' }}>
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Terms of Service Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none" style={{ color: '#979797' }}>
          <p className="text-lg mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using FitSnap ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
            <p className="mb-4">
              FitSnap is a fitness tracking application that allows users to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Log and track workouts</li>
              <li>Monitor fitness progress</li>
              <li>Upload and compare progress photos</li>
              <li>Set and track fitness goals</li>
              <li>Connect with a fitness community</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts</h2>
            <p className="mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">4. User Content</h2>
            <p className="mb-4">
              You retain ownership of content you submit to FitSnap. By posting content, you grant us a 
              non-exclusive license to use, modify, and display your content in connection with the Service.
            </p>
            <p className="mb-4">You agree not to post content that:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violates any laws or regulations</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains harmful or malicious code</li>
              <li>Is offensive, abusive, or inappropriate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Health and Safety Disclaimer</h2>
            <p className="mb-4">
              FitSnap is not a medical device or healthcare service. The information provided is for 
              informational purposes only and should not replace professional medical advice.
            </p>
            <p className="mb-4">
              <strong>Important:</strong> Consult with a healthcare professional before starting any new 
              exercise program. Use the Service at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Prohibited Uses</h2>
            <p className="mb-4">You may not use the Service to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Harass or harm other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Limitation of Liability</h2>
            <p className="mb-4">
              FitSnap shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account and access to the Service at our sole discretion, 
              without prior notice, for conduct that we believe violates these Terms or is harmful to 
              other users, us, or third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of any material 
              changes by posting the updated Terms on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong> <a href="mailto:onelasttimejuan@gmail.com" className="hover:text-white transition-colors" style={{ color: '#FFFC74' }}>onelasttimejuan@gmail.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: '1px solid #404040' }}>
          <Link href="/" className="inline-flex items-center px-6 py-3 text-black rounded hover:opacity-90 transition-colors" style={{ backgroundColor: '#FFFC74' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
