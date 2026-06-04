'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/lib/types/study-companion';
import { EXPLANATION_MODES } from '@/lib/utils/constants';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Trash2,
  Sparkles,
} from 'lucide-react';

const suggestedPrompts = [
  'Explain photosynthesis in simple terms',
  'Give me exam-style questions on force and motion',
  'What are the laws of reflection?',
  'Help me understand chemical bonding',
];

export default function StudyCompanionPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('simple');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const res = await fetch('/api/proxy/study-companion/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          message: messageText,
          mode,
          subject: 'science',
          class_level: user.grade_level,
        }),
      });

      const data = await res.json();

      setMessages((prev) => prev.filter((m) => m.id !== 'loading'));

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date().toISOString(),
          sources: data.data.sources,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error(data.error?.message || 'Failed to get response');
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== 'loading'));
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.info('Chat cleared');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, m: { value: string }) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMode(m.value);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Study Companion</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                AI tutor for your curriculum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {EXPLANATION_MODES.map((m) => (
              <Badge
                key={m.value}
                variant={mode === m.value ? 'default' : 'outline'}
                className="cursor-pointer select-none transition-colors"
                role="button"
                tabIndex={0}
                onClick={() => setMode(m.value)}
                onKeyDown={(e) => handleKeyDown(e, m)}
              >
                {m.label}
              </Badge>
            ))}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-destructive ml-auto sm:ml-0"
                onClick={clearChat}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full text-center px-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">How can I help you study?</h2>
            <p className="text-muted-foreground mb-6 max-w-md text-sm sm:text-base">
              Ask me anything about your curriculum. I can explain concepts, generate
              practice questions, or help you prepare for exams.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="justify-start text-left h-auto py-3 px-4 transition-colors hover:bg-accent"
                  onClick={() => handleSend(prompt)}
                >
                  <Lightbulb className="w-4 h-4 mr-2 shrink-0 text-amber-500" />
                  <span className="text-sm leading-snug">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                )}
                <Card
                  className={`max-w-[85%] sm:max-w-[75%] p-2.5 sm:p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" />
                      <div
                        className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce"
                        style={{ animationDelay: '0.15s' }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce"
                        style={{ animationDelay: '0.3s' }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`prose prose-sm max-w-none ${
                        message.role === 'user'
                          ? 'prose-invert prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground prose-code:text-primary-foreground prose-code:bg-primary-foreground/20'
                          : 'dark:prose-invert'
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          Sources: {message.sources.join(', ')}
                        </span>
                      </p>
                    </div>
                  )}
                </Card>
                {message.role === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 max-w-3xl mx-auto"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your studies..."
            className="flex-1 h-10 sm:h-11"
            disabled={isLoading}
            enterKeyHint="send"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-10 sm:h-11 px-3 sm:px-4 shrink-0"
          >
            <Send className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
