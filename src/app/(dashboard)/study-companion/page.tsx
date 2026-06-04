'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/lib/types/study-companion';
import { EXPLANATION_MODES } from '@/lib/utils/constants';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Lightbulb, BookOpen } from 'lucide-react';

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== 'loading'));
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Study Companion</h1>
          </div>
          <div className="flex gap-2">
            {EXPLANATION_MODES.map((m) => (
              <Badge
                key={m.value}
                variant={mode === m.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setMode(m.value)}
              >
                {m.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">How can I help you study?</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Ask me anything about your curriculum. I can explain concepts, generate practice
              questions, or help you prepare for exams.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="justify-start text-left h-auto py-3 px-4"
                  onClick={() => handleSend(prompt)}
                >
                  <Lightbulb className="w-4 h-4 mr-2 shrink-0" />
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <Card
                  className={`max-w-[80%] p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Sources: {message.sources.join(', ')}
                      </p>
                    </div>
                  )}
                </Card>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
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
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
