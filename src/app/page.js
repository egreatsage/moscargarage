import Link from 'next/link';
import Image from 'next/image';
import { 
  Wrench, 
  Car, 
  Shield, 
  Clock, 
  DollarSign, 
  Award,
  ChevronRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';

const features = [
  {
    icon: Shield,
    title: 'Certified Technicians',
    description: 'Expert mechanics with years of experience and ongoing training'
  },
  {
    icon: Clock,
    title: 'Fast Turnaround',
    description: 'Quick service without compromising on quality'
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'No hidden fees, clear quotes before any work begins'
  },
  {
    icon: Award,
    title: 'Quality Guarantee',
    description: 'All work backed by our service warranty'
  }
];

async function getActiveServices() {
  await connectDB();
  
  const services = await Service.find({ isActive: true }).sort({ category: 1, name: 1 }).lean();
  return JSON.parse(JSON.stringify(services));
}

export default async function HomePage() {
  const services = await getActiveServices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100">
   
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-orange-900 to-slate-800 text-white">
       
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Car className="w-4 h-4" />
              <span className="text-sm font-medium">Professional Auto Care Since 2013</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Your Car Deserves
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
                Expert Care
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Professional automotive repair and maintenance services with online booking and secure M-Pesa payments
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#services" 
                className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                Browse Services
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/register" 
                className="group bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                Get Started
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group text-center p-6 rounded-2xl hover:bg-orange-50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
     <section id="services" className="py-20 bg-gradient-to-br from-slate-50 to-orange-50">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-4 font-semibold">
        <Wrench className="w-4 h-4" />
        Our Services
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        Comprehensive Auto Care
      </h2>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto">
        From routine maintenance to major repairs, we've got your vehicle covered
      </p>
    </div>

    <section id="services" className="py-20 bg-gradient-to-br from-slate-50 to-orange-50">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-4 font-semibold">
        <Wrench className="w-4 h-4" />
        Our Services
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        Comprehensive Auto Care
      </h2>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto">
        From routine maintenance to major repairs, we've got your vehicle covered
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {services.slice(0, 6).map((service) => (
        <div 
          key={service._id}
          className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-orange-300 hover:-translate-y-1 flex flex-col"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="relative flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              {service.image ? (
                  <Image src={service.image} alt={service.name} fill className="object-cover rounded-xl" />
              ) : (
                  <Wrench className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                {service.name}
              </h3>
            </div>
          </div>
          
          <p className="text-slate-600 mb-4 leading-relaxed flex-grow">
            {service.description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-sm text-slate-500">{service.priceType === 'starting_from' ? 'Starting at' : 'Price'}</span>
              <span className="text-lg font-bold text-orange-600">KES {service.price.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-slate-500">Duration</span>
              <span className="text-sm font-semibold text-slate-700">{service.duration}</span>
            </div>
          </div>
          
          <Link 
            href={`/bookings/new?serviceId=${service._id}`}
            className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
          >
            Book Now
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ))}
    </div>
  </div>
</section>
  </div>
</section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-4 font-semibold">
                  <Award className="w-4 h-4" />
                  Why Moscar Garage
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  Quality Service You Can Trust
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  We combine traditional craftsmanship with modern technology to deliver exceptional automotive care. Our commitment to excellence ensures your vehicle receives the attention it deserves.
                </p>
                
                <div className="space-y-4">
                  {[
                    'State-of-the-art diagnostic equipment',
                    'Genuine and high-quality spare parts',
                    'Convenient online booking system',
                    'Secure M-Pesa payment integration',
                    'Regular service reminders',
                    'Detailed service history tracking'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <span className="text-slate-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square  overflow-hidden">
                
                  <div className="absolute inset-0 flex items-center justify-center">
                
                    <img 
                      src="/logo.png" 
                      alt="Car Service" 
                      className="object-cover w-full h-full "
                    />
                  </div>
                 
                  <div className="absolute bottom-8 left-8 right-8">
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-orange-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoOFYxNnptMCA4djhoOFYyNHptLTggOHY4aDhWMzJ6bS04IDh2OGg4VjQwem04LThWMjRoOHY4em04LThWMTZoOHY4em04IDh2OGg4VjMyem04IDh2OGg4VjQweiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Book Your Service?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join hundreds of satisfied customers who trust us with their vehicles. Book online in minutes and pay securely with M-Pesa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                Create Account
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#services" 
                className="group bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-slate-600">
                Have questions? We're here to help
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-xl mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Phone</h3>
                <p className="text-slate-600">+254758891081</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-xl mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Email</h3>
                <p className="text-slate-600">info@moscargarage.co.ke</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-xl mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Location</h3>
                <p className="text-slate-600">Bungoma, Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-8 h-8 text-orange-500" />
                <span className="text-xl font-bold text-white">Moscar Garage</span>
              </div>
              <p className="text-slate-400">
                Professional automotive repair and maintenance services you can trust.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#services" className="hover:text-orange-400 transition-colors">Services</Link></li>
                <li><Link href="/register" className="hover:text-orange-400 transition-colors">Book Now</Link></li>
                <li><Link href="/login" className="hover:text-orange-400 transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link href="#services" className="hover:text-orange-400 transition-colors">Body Repair</Link></li>
                <li><Link href="#services" className="hover:text-orange-400 transition-colors">Engine Diagnostics</Link></li>
                <li><Link href="#services" className="hover:text-orange-400 transition-colors">Maintenance</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+254758891081</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@moscargarage.co.ke</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Nairobi, Kenya</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} Moscar Garage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}