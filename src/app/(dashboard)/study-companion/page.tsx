'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { AILoader } from '@/components/ui/ai-loader';

import {
  Send,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Trash2,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const suggestedPrompts = [
  'Explain photosynthesis in simple terms',
  'Give me exam-style questions on force and motion',
  'What are the laws of reflection?',
  'Help me understand chemical bonding',
];

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  math: ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'equation', 'formula', 'theorem', 'number', 'fraction', 'decimal', 'percentage', 'ratio', 'proportion', 'area', 'volume', 'perimeter', 'circumference', 'angle', 'triangle', 'circle', 'square', 'rectangle', 'polygon', 'graph', 'statistics', 'probability', 'set', 'function', 'variable', 'constant', 'coefficient', 'polynomial', 'quadratic', 'linear'],
  physics: ['physics', 'force', 'motion', 'velocity', 'acceleration', 'speed', 'energy', 'work', 'power', 'gravity', 'friction', 'magnet', 'electricity', 'circuit', 'current', 'voltage', 'resistance', 'wave', 'sound', 'light', 'optics', 'lens', 'mirror', 'reflection', 'refraction', 'mass', 'weight', 'density', 'pressure', 'heat', 'temperature', 'thermodynamics', 'nuclear', 'atom', 'electron', 'proton', 'neutron', 'kinematics', 'dynamics'],
  chemistry: ['chemistry', 'chemical', 'reaction', 'compound', 'mixture', 'element', 'periodic table', 'acid', 'base', 'salt', 'metal', 'non-metal', 'alloy', 'molecule', 'ion', 'bond', 'covalent', 'ionic', 'metallic', 'valency', 'oxidation', 'reduction', 'electrolysis', 'carbon', 'organic', 'inorganic', 'solution', 'solvent', 'solute', 'concentration', 'molarity', 'pH', 'indicator', 'rusting', 'corrosion', 'combustion', 'fermentation', 'polymerization'],
  biology: ['biology', 'cell', 'tissue', 'organ', 'system', 'plant', 'animal', 'human', 'photosynthesis', 'respiration', 'digestion', 'circulation', 'excretion', 'reproduction', 'genetics', 'dna', 'gene', 'chromosome', 'heredity', 'evolution', 'ecosystem', 'food chain', 'food web', 'habitat', 'adaptation', 'classification', 'bacteria', 'virus', 'fungi', 'microorganism', 'enzyme', 'hormone', 'nutrition', 'diet', 'health', 'disease', 'immunity', 'vaccine'],
  history: ['history', 'past', 'ancient', 'medieval', 'modern', 'civilization', 'empire', 'dynasty', 'king', 'queen', 'ruler', 'war', 'battle', 'revolution', 'independence', 'colonial', 'freedom', 'movement', 'rebellion', 'mutiny', 'partition', 'constitution', 'democracy', 'government', 'policy', 'treaty', 'agreement', 'archaeology', 'artifact', 'heritage', 'monument', 'culture', 'tradition', 'folklore', 'mythology'],
  geography: ['geography', 'earth', 'planet', 'continent', 'country', 'nation', 'state', 'city', 'capital', 'river', 'mountain', 'plateau', 'plain', 'valley', 'desert', 'forest', 'ocean', 'sea', 'lake', 'island', 'peninsula', 'coast', 'climate', 'weather', 'monsoon', 'rainfall', 'temperature', 'humidity', 'wind', 'cyclone', 'earthquake', 'volcano', 'tsunami', 'flood', 'drought', 'soil', 'agriculture', 'population', 'census', 'resource', 'industry', 'transport', 'communication', 'map', 'globe', 'latitude', 'longitude', 'equator', 'tropic'],
  english: ['english', 'grammar', 'noun', 'pronoun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'tense', 'sentence', 'phrase', 'clause', 'paragraph', 'essay', 'letter', 'story', 'poem', 'poetry', 'drama', 'novel', 'literature', 'comprehension', 'vocabulary', 'synonym', 'antonym', 'homonym', 'spelling', 'punctuation', 'article', 'voice', 'narration', 'transformation', 'tag question', 'idiom', 'proverb', 'figure of speech', 'metaphor', 'simile', 'alliteration', 'personification'],
  bangla: ['bangla', 'bengali', 'bangladesh', 'dhaka', 'bangla bhasha', 'sahitya', 'kobita', 'golpo', 'uponnash', 'natak', 'boi', 'poddho', 'bondu', 'poribar', 'desh', 'bhasha', 'shiksha', 'itihash', 'bhugol', 'biggan'],
};

function detectSubject(message: string): string {
  const lower = message.toLowerCase();
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      // ChromaDB currently only contains 'science' curriculum data,
      // so map biology/physics/chemistry questions to science for retrieval.
      if (subject === 'biology' || subject === 'physics' || subject === 'chemistry') {
        return 'science';
      }
      return subject;
    }
  }
  return 'science';
}

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

  const idRef = useRef(0);

  const sendWithRetry = useCallback(
    async (messageText: string): Promise<void> => {
      if (!user) return;

      const maxRetries = 2;
      let attempt = 0;

      while (attempt <= maxRetries) {
        const res = await fetch('/api/proxy/study-companion/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: user.id,
            message: messageText,
            mode,
            subject: detectSubject(messageText),
            class_level: user.grade_level,
          }),
        });

        const data = await res.json();

        if (data.success) {
          const responseText: string = data.data?.response || '';
          // Detect if the backend accidentally returned an error as a success response
          const looksLikeError =
            responseText.includes('RAG HTTP ask failed') ||
            responseText.includes('429 Too Many Requests') ||
            responseText.includes('503 Service Unavailable') ||
            responseText.includes('RAG server') ||
            responseText.includes('not reachable');

          if (!looksLikeError) {
            const assistantMessage: ChatMessage = {
              id: `a_${++idRef.current}`,
              role: 'assistant',
              content: responseText,
              timestamp: new Date().toISOString(),
              sources: data.data?.sources,
            };
            setMessages((prev) => [...prev, assistantMessage]);
            return;
          }
        }

        // Retry on server errors or error-looking responses
        if (attempt < maxRetries && (res.status >= 500 || (data.success && data.data?.response))) {
          const delay = 1000 * (attempt + 1);
          await new Promise((r) => setTimeout(r, delay));
          attempt++;
          continue;
        }

        break;
      }

      const errorMessage: ChatMessage = {
        id: `e_${++idRef.current}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isError: true,
        retryText: messageText,
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
    [user, mode]
  );

  const handleSend = useCallback(
    async (messageText: string = input) => {
      if (!messageText.trim() || !user) return;

      const userMessage: ChatMessage = {
        id: `u_${++idRef.current}`,
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        await sendWithRetry(messageText);
      } catch {
        const errorMessage: ChatMessage = {
          id: `e_${++idRef.current}`,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          isError: true,
          retryText: messageText,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, user, sendWithRetry]
  );

  const handleRetry = useCallback(
    (messageText: string) => {
      setMessages((prev) => prev.filter((m) => m.retryText !== messageText));
      handleSend(messageText);
    },
    [handleSend]
  );

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
    <div className="flex flex-col h-full -m-4 lg:-m-8">
      {/* Header */}
      <div className="border-b glass px-4 py-3 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold leading-tight">Study Companion</h1>
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
                className={cn(
                  'cursor-pointer select-none transition-colors',
                  mode === m.value && 'bg-primary text-primary-foreground border-0'
                )}
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
                className="h-7 px-2 text-muted-foreground hover:text-destructive ml-auto sm:ml-0 hover-lift"
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
        className="flex-1 overflow-y-auto min-h-0 p-4 lg:p-8 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full text-center px-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
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
                  className="justify-start text-left h-auto py-3 px-4 transition-colors hover:bg-accent whitespace-normal glass hover-lift"
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
                className={cn(
                  'flex gap-2 sm:gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                <Card
                  className={cn(
                    'max-w-[85%] sm:max-w-[75%] p-2.5 sm:p-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.isError
                        ? 'border-destructive/30 bg-destructive/5'
                        : 'glass'
                  )}
                >
                  {message.isError ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">
                            Unable to get a response
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            The AI tutor is temporarily unavailable. Please try again in a moment.
                          </p>
                        </div>
                      </div>
                      {message.retryText && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="self-start h-7 text-xs gap-1"
                          onClick={() => handleRetry(message.retryText!)}
                          disabled={isLoading}
                        >
                          <RotateCcw className="w-3 h-3" />
                          Retry
                        </Button>
                      )}
                    </div>
                  ) : message.isLoading ? (
                    <AILoader compact label="Thinking..." />
                  ) : (
                    <div
                      className={cn(
                        'prose prose-sm max-w-none',
                        message.role === 'user'
                          ? 'prose-invert prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground prose-code:text-primary-foreground prose-code:bg-primary-foreground/20'
                          : 'dark:prose-invert'
                      )}
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
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <Card className="glass p-3">
                  <AILoader compact label="Thinking..." />
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t glass p-3 sm:p-4 lg:px-8">
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
            className="flex-1 h-10 sm:h-11 glass"
            disabled={isLoading}
            enterKeyHint="send"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            variant="gradient"
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
