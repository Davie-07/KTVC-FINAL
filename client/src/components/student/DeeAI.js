import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, Loader, Trash2, MessageSquare } from 'lucide-react';
import axios from '../../services/axios';

const DeeAI = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m DeeAI, your AI learning assistant at KTVC. I\'m here to help you with your studies, answer questions, explain concepts, and provide guidance. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to backend with conversation history
      const response = await axios.post('/api/student/deeai/chat', {
        message: inputMessage,
        conversationHistory: messages.slice(-6) // Last 6 messages for context
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          role: 'assistant',
          content: '👋 Chat cleared! How can I help you today?',
          timestamp: new Date()
        }
      ]);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-4 lg:p-6 mb-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white p-2 lg:p-3 rounded-full mr-3 lg:mr-4">
              <Bot className="text-purple-600" size={28} />
            </div>
            <div>
              <h1 className="text-xl lg:text-3xl font-bold">DeeAI Assistant</h1>
              <p className="text-purple-100 flex items-center text-sm lg:text-base">
                <Sparkles size={16} className="mr-1" />
                Powered by Google Gemini AI
              </p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            title="Clear chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-lg flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] lg:max-w-[70%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-2">
                    <Bot size={18} className={message.isError ? 'text-red-600' : 'text-purple-600'} />
                    <span className="ml-2 font-semibold text-sm">DeeAI</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </p>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <Loader className="animate-spin text-purple-600" size={20} />
                  <span className="text-gray-600">DeeAI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <MessageSquare className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                <Send size={24} />
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Tip: Ask me to explain concepts, help with assignments, or provide study guidance!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeeAI;
