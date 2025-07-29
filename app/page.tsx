'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Target, TrendingUp, Users, Camera, BarChart3, Trophy } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#151515' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1B1B1B', borderBottom: '1px solid #404040' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold" style={{ color: '#FFFC74' }}>FitSnap</div>
            {/* Navigation links - Hidden for now */}
            {/* <nav className="hidden md:flex space-x-8">
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#979797' }}>Home</a>
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#979797' }}>Features</a>
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#979797' }}>Pricing</a>
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#979797' }}>About</a>
            </nav> */}
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

      {/* Hero Section */}
      <section 
        className="text-white py-24 relative bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Elevate Your Fitness Journey<br />with FitSnap
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#979797' }}>
            An all-in-one fitness tracking app that helps you monitor your workouts, track your progress, and stay motivated with a supportive community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 text-black rounded font-medium hover:opacity-90 transition-colors" style={{ backgroundColor: '#FFFC74' }}>
              Get Started
            </Link>
            <button className="px-8 py-3 text-white rounded hover:opacity-80 transition-colors" style={{ border: '1px solid #FFFC74', color: '#FFFC74' }}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{ backgroundColor: '#1B1B1B' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Your Fitness Journey Starts
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 rounded-lg" style={{ backgroundColor: '#232323', border: '1px solid #404040' }}>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: '#404040' }}>
                <Target className="w-6 h-6" style={{ color: '#FFFC74' }} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Achieve Your Workout Goals</h3>
              <p className="mb-4" style={{ color: '#979797' }}>
                Set and track your fitness goals with our comprehensive workout planning tools.
              </p>
              <a href="#" className="font-medium hover:text-white transition-colors" style={{ color: '#FFFC74' }}>
                Read more →
              </a>
            </div>
            <div className="p-6 rounded-lg" style={{ backgroundColor: '#232323', border: '1px solid #404040' }}>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: '#404040' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#FFFC74' }} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Maximize Your Workout Efficiency</h3>
              <p className="mb-4" style={{ color: '#979797' }}>
                Optimize your training with data-driven insights and personalized recommendations.
              </p>
              <a href="#" className="font-medium hover:text-white transition-colors" style={{ color: '#FFFC74' }}>
                Read more →
              </a>
            </div>
            <div className="p-6 rounded-lg" style={{ backgroundColor: '#232323', border: '1px solid #404040' }}>
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: '#404040' }}>
                <BarChart3 className="w-6 h-6" style={{ color: '#FFFC74' }} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Track Your Progress Effectively</h3>
              <p className="mb-4" style={{ color: '#979797' }}>
                Monitor your improvements with detailed analytics and progress visualization.
              </p>
              <a href="#" className="font-medium hover:text-white transition-colors" style={{ color: '#FFFC74' }}>
                Read more →
              </a>
            </div>
          </div>
          <div className="text-center">
            <button className="px-6 py-3 text-black rounded hover:opacity-90 transition-colors" style={{ backgroundColor: '#FFFC74' }}>
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20" style={{ backgroundColor: '#151515' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">
                Transform Your Fitness Journey with Smart Tracking
              </h2>
              <p className="mb-8 leading-relaxed" style={{ color: '#979797' }}>
                Take control of your fitness with comprehensive workout tracking, progress monitoring, and personal records. FitSnap helps you stay motivated with detailed analytics, photo comparisons, and a supportive community of fitness enthusiasts.
              </p>
            </div>
            <div className="rounded-lg aspect-[4/3] lg:aspect-[4/3] my-8 md:my-0">
              <img 
                src="/fitsnap iphone mockup.png" 
                alt="FitSnap app displayed on iPhone mockup"
                className="w-full h-full object-contain scale-125 md:scale-100 my-4 md:my-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#232323' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Empowering your fitness journey, one<br />workout at a time.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#979797' }}>
            At FitSnap, we believe in making fitness accessible and enjoyable for everyone. Our platform is designed to help you achieve your goals through consistent tracking and community support.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#1B1B1B', borderTop: '1px solid #404040' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-8 md:mb-0">
              <div className="text-2xl font-bold mb-4" style={{ color: '#FFFC74' }}>FitSnap</div>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-white transition-colors" style={{ color: '#979797' }}>Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors" style={{ color: '#979797' }}>Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid #404040', color: '#979797' }}>
            <p>© 2025 FitSnap. Made with love and dedication by <a href="https://www.instagram.com/juan_oclock11/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: '#FFFC74' }}>Juan Oclock</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
