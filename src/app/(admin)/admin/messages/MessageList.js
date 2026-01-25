// src/app/(admin)/admin/messages/MessageList.js
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import React from 'react';
import { Mail, User, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

async function getMessages() {
  await connectDB();
  const messages = await Contact.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(messages));
}

async function deleteMessage(messageId) {
  'use server';
  
  try {
    await connectDB();
    await Contact.findByIdAndDelete(messageId);
    revalidatePath('/admin/messages');
    revalidatePath('/admin/dashboard'); // Also revalidate dashboard
    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'Failed to delete message' };
  }
}

export default async function MessageList() {
    const messages = await getMessages();

    return (
        <div>
            {messages.length === 0 ? (
                <div className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No Messages Yet</h3>
                    <p className="text-slate-600">Customer messages will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6 p-4 sm:p-6">
                    {messages.map((message) => (
                        <div 
                            key={message._id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-orange-300 overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex-shrink-0 w-12 h-12 bg-linear-to-r from-orange-100 to-orange-200 text-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-slate-900 mb-1">
                                                {message.name}
                                            </h2>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Mail className="w-4 h-4" />
                                                <a href={`mailto:${message.email}`} className="hover:text-orange-600 transition-colors">
                                                    {message.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        {message.createdAt && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(message.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <form action={deleteMessage.bind(null, message._id)}>
                                            <button type="submit" className="group p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-300 hover:shadow-md" title="Delete message">
                                                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="bg-slate-50 rounded-xl p-6">
                                    <div className="flex items-start gap-2 mb-2">
                                        <MessageSquare className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                                        <h3 className="font-semibold text-slate-900">Message:</h3>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed pl-7 whitespace-pre-wrap">
                                        {message.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
