import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const DeeAI = () => {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-6 mb-4 shadow-lg">
        <div className="flex items-center">
          <div className="bg-white p-3 rounded-full mr-4">
            <Bot className="text-purple-600" size={32} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">DeeAI Assistant</h1>
            <p className="text-purple-100 flex items-center">
              <Sparkles size={16} className="mr-1" />
              Your AI-powered learning companion
            </p>
          </div>
        </div>
      </div>

      {/* BotPenguin Chatbot Container */}
      <div className="bg-white rounded-2xl shadow-lg h-[calc(100%-120px)] overflow-hidden">
        <iframe 
          src="https://page.botpenguin.com/690209ba59b0df5461a4128f/6902083722cd9b507299bb3d"
          className="w-full h-full border-0"
          title="DeeAI Chatbot"
          allow="microphone; camera"
        />
      </div>
    </div>
  );
};

export default DeeAI;
