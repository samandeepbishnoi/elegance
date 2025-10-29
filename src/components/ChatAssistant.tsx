import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  products?: Product[];
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ChatAssistantProps {
  initialMessage?: string;
  onMessageSent?: () => void;
}

export default function ChatAssistant({ initialMessage, onMessageSent }: ChatAssistantProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      text: "Hello! I'm your jewelry consultant. How can I help you find the perfect piece today?",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasProcessedInitialMessage = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Separate function to send message to AI
  const sendMessageToAI = useCallback(async (messageText: string) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          text: "I apologize, but the AI service is not configured yet. Please add your Gemini API key to the .env file (VITE_GEMINI_API_KEY) to enable the chat assistant.",
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          apiKey: apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        throw new Error(`API Error: ${errorData.message || 'Failed to get response from AI'}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: data.message,
        products: data.products,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    if (onMessageSent) {
      onMessageSent();
    }

    await sendMessageToAI(messageToSend);
  }, [inputValue, isLoading, onMessageSent, sendMessageToAI]);

  // Handle initial message when chat opens
  useEffect(() => {
    if (isOpen && initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true;
      // Auto-send immediately without showing in input
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        text: initialMessage,
      };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      sendMessageToAI(initialMessage);
    }
  }, [isOpen, initialMessage]);

  // Listen for custom events to open chat with message
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      const message = event.detail?.message;
      if (message) {
        setIsOpen(true);
        hasProcessedInitialMessage.current = false;
        // Auto-send immediately
        setTimeout(() => {
          const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: message,
          };
          setMessages(prev => [...prev, userMessage]);
          setIsLoading(true);
          sendMessageToAI(message);
        }, 300);
      }
    };

    window.addEventListener('openChatWithMessage' as any, handleOpenChat);
    return () => {
      window.removeEventListener('openChatWithMessage' as any, handleOpenChat);
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden"
              style={{ height: '600px', maxHeight: 'calc(100vh - 8rem)' }}
            >
              <div className="h-full flex flex-col">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Jewelry Consultant</h3>
                      <p className="text-white/80 text-xs">Here to help you find perfect pieces</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          message.type === 'user'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>

                        {message.products && message.products.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.products.map((product) => (
                              <Link
                                key={product._id}
                                to={`/product/${product._id}`}
                                onClick={() => setIsOpen(false)}
                                className="flex gap-3 bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 transition-colors"
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                                  <p className="text-sm font-semibold text-amber-700 mt-0.5">
                                    ₹{product.price.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                        <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about jewelry..."
                      className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-amber-200 transition-shadow"
      >
        <Sparkles className="w-5 h-5 md:w-7 md:h-7" />
      </motion.button>
    </>
  );
}
