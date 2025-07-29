'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
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

      {/* Privacy Policy Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none" style={{ color: '#979797' }}>
          <p className="text-lg mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
            <p className="mb-4">
              At FitSnap, we collect information you provide directly to us, such as when you create an account, 
              log workouts, upload photos, or contact us for support.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Account information (email, username, profile details)</li>
              <li>Workout data (exercises, sets, reps, weights, duration)</li>
              <li>Progress photos and measurements</li>
              <li>Device and usage information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide, maintain, and improve our fitness tracking services</li>
              <li>Process and track your workouts and progress</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve our app</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Information Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this policy. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>In connection with a business transfer</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong> <a href="mailto:onelasttimejuan@gmail.com" className="hover:text-white transition-colors" style={{ color: '#FFFC74' }}>onelasttimejuan@gmail.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date.
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
