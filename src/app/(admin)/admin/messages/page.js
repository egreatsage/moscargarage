import React from 'react';
import MessageList from './MessageList';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100">
      <section className="bg-gradient-to-br from-slate-900 via-orange-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Customer Communications</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Customer Messages</h1>
              <p className="text-lg text-slate-300 mt-2">Review and manage messages from your customers.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <MessageList />
          </div>
        </div>
      </section>
    </div>
  );
}