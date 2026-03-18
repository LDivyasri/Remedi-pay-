import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, DollarSign, Shield, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3Ccircle cx='53' cy='7' r='7'/%3E%3Ccircle cx='30' cy='30' r='7'/%3E%3Ccircle cx='7' cy='53' r='7'/%3E%3Ccircle cx='53' cy='53' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="text-sm font-medium">🩺 Revolutionizing Healthcare Commerce</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Remedi Pay
                  </span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
                  The marketplace where surplus medicines find new purpose
                </p>
                <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                  Connect sellers with unused medicines to pharmacy owners looking for affordable stock. 
                  Save money, reduce waste, improve healthcare access.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="group relative bg-white text-medical-blue px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/medicines"
                  className="group relative border-2 border-white/30 backdrop-blur-sm bg-white/10 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-medical-blue transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="relative z-10">Browse Medicines</span>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-white/20 to-transparent rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative glass-card rounded-3xl p-8 backdrop-blur-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1596522016734-8e6136fe5cfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2luZSUyMHBoYXJtYWN5JTIwcGlsbHMlMjBoZWFsdGhjYXJlfGVufDF8fHx8MTc1OTIwODc3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Medicine and healthcare"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-8 -left-8 glass-card rounded-2xl p-6 backdrop-blur-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-medical-blue">2,500+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </div>
              
              <div className="absolute -top-8 -right-8 glass-card rounded-2xl p-6 backdrop-blur-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-medical-green">₹2.5M+</div>
                  <div className="text-sm text-gray-600">Total Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-medical-blue-light rounded-full mb-6">
              <span className="text-sm font-medium text-medical-blue">How it works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How Remedi Pay Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A simple, secure marketplace connecting surplus medicine sellers with pharmacy buyers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For Sellers */}
            <div className="group relative glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
              <div className="absolute inset-0 bg-gradient-to-br from-medical-blue/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">For Sellers</h3>
                <ul className="text-gray-600 space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Turn unused medicines into profit</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Easy listing and inventory management</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Secure payments and verification</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Track sales and earnings</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* For Pharmacy Owners */}
            <div className="group relative glass-card p-8 rounded-3xl hover-lift hover:shadow-medical lg:transform lg:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-medical-green/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-secondary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Most Popular
                </div>
              </div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <ShoppingBag className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">For Pharmacy Owners</h3>
                <ul className="text-gray-600 space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Buy medicines at 50% off retail price</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Browse and search available stock</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Verified sellers and quality assurance</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Instant purchase and delivery tracking</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Platform Benefits */}
            <div className="group relative glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
              <div className="absolute inset-0 bg-gradient-to-br from-medical-purple/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Benefits</h3>
                <ul className="text-gray-600 space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Secure transactions and escrow</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">KYC verification for all users</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">Real-time notifications</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-medical-green rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="leading-relaxed">24/7 customer support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-light/30 to-medical-green-light/30"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230066cc' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6 shadow-soft">
              <span className="text-sm font-medium text-medical-blue">Our Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Making a Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of users already benefiting from our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center">
              <div className="glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3">2,500+</div>
                <div className="text-gray-600 font-medium">Active Users</div>
                <div className="text-sm text-gray-500 mt-2">Growing daily</div>
              </div>
            </div>

            <div className="group text-center">
              <div className="glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3">15,000+</div>
                <div className="text-gray-600 font-medium">Medicines Listed</div>
                <div className="text-sm text-gray-500 mt-2">Fresh inventory</div>
              </div>
            </div>

            <div className="group text-center">
              <div className="glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="w-20 h-20 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3">₹2.5M+</div>
                <div className="text-gray-600 font-medium">Total Savings</div>
                <div className="text-sm text-gray-500 mt-2">For our users</div>
              </div>
            </div>

            <div className="group text-center">
              <div className="glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-3">8,500+</div>
                <div className="text-gray-600 font-medium">Successful Transactions</div>
                <div className="text-sm text-gray-500 mt-2">Secure & verified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-hero text-white">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl opacity-5"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="text-sm font-medium">🚀 Join the Revolution</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Ready to Get Started?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join Remedi Pay today and be part of the solution to healthcare affordability and medicine waste reduction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Link
                to="/signup"
                className="group relative bg-white text-medical-blue px-10 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-xl transform hover:-translate-y-1 text-lg"
              >
                <span className="relative z-10">Sign Up Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link
                to="/login"
                className="group relative border-2 border-white/30 backdrop-blur-sm bg-white/10 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-white hover:text-medical-blue transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
              >
                <span className="relative z-10">Already have an account? Sign In</span>
              </Link>
            </div>
            
            <div className="pt-8">
              <p className="text-white/70 text-sm">
                Trusted by 2,500+ healthcare professionals • Secure & verified platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-xl font-bold">Remedi Pay</span>
              </div>
              <p className="text-gray-400">
                Connecting surplus medicines with those who need them most.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/medicines" className="hover:text-white transition-colors">Browse Medicines</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Become a Seller</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Join as Pharmacy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Remedi Pay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}