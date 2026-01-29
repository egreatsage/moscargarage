
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, Mail, MessageSquare, User, Phone } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const promise = fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    }).then(res => {
        if (!res.ok) {
            return res.json().then(err => Promise.reject(err));
        }
        return res.json();
    });

    toast.promise(promise, {
      loading: 'Sending your message...',
      success: (data) => {
        setFormData({ name: '', email: '', phoneNumber: '', message: '' });
        return `Message sent! ${data.message || "We'll get back to you soon!"}`;
      },
      error: (err) => `Oops! ${err.error || 'Something went wrong.'}`,
    });

    try {
        await promise;
    } catch(e) {
        // prevent unhandled promise rejection error
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-800">Get in Touch</h1>
                <p className="text-gray-500 mt-2">We'd love to hear from you. Send us a message!</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number *
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                            placeholder="e.g. 254712345678"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                        Message *
                    </label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full pl-10 pr-4 py-3 border text-slate-900 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                            placeholder="Your message here..."
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                    {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                    </>
                    ) : (
                    'Send Message'
                    )}
                </button>
            </form>
        </div>
        </div>
    </div>
  );
}
