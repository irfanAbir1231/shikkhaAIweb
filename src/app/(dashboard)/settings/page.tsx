'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUpdateStudent } from '@/lib/api/students';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Globe,
  Info,
  Save,
  GraduationCap,
  Palette,
  Languages,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GRADE_LEVELS } from '@/lib/utils/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal';
import { GradientText } from '@/components/ui/gradient-text';
import { cn } from '@/lib/utils';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ElementType;
  description: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun, description: 'Clean and bright' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: Monitor, description: 'Follows your device' },
];

type LanguageOption = {
  value: 'en' | 'bn';
  label: string;
  native: string;
  flag: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { value: 'bn', label: 'Bangla', native: 'বাংলা', flag: '🇧🇩' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const updateStudent = useUpdateStudent();
  const [selectedGrade, setSelectedGrade] = useState(user?.grade_level || '');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'bn'>('en');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const handleSaveClass = async () => {
    if (!user || !selectedGrade) return;
    try {
      const updated = await updateStudent.mutateAsync({
        studentId: user.id,
        payload: { grade_level: selectedGrade },
      });
      updateUser({ grade_level: updated.grade_level });
      toast.success('Class updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update class');
    }
  };

  const handleLanguageChange = (lang: 'en' | 'bn') => {
    setSelectedLanguage(lang);
    if (lang === 'bn') {
      toast.info('বাংলা language support is coming soon!');
    } else {
      toast.success('Language set to English');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Reveal>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            <GradientText>Settings</GradientText>
          </h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </Reveal>

      <Stagger className="space-y-4" gap={0.1}>
        {/* Account */}
        <StaggerItem>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                  <User className="w-4 h-4" />
                </div>
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 text-primary text-lg font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  Class {user?.grade_level}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Class Level */}
        <StaggerItem>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/10 text-success">
                  <GraduationCap className="w-4 h-4" />
                </div>
                Class Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your class level is used to generate relevant exam questions.
              </p>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedGrade}
                  onValueChange={(value) => value && setSelectedGrade(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        Class {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSaveClass}
                  disabled={
                    !selectedGrade ||
                    selectedGrade === user?.grade_level ||
                    updateStudent.isPending
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Appearance */}
        <StaggerItem>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/50 text-accent-foreground">
                  <Palette className="w-4 h-4" />
                </div>
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mounted ? (
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          'relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
                          'hover:border-primary/40 hover:bg-primary/5',
                          active
                            ? 'border-primary bg-primary/10 shadow-glow'
                            : 'border-border bg-card/50'
                        )}
                        aria-pressed={active}
                        aria-label={`Set theme to ${option.label}`}
                      >
                        {active && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        )}
                        <Icon
                          className={cn(
                            'w-6 h-6',
                            active ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <div className="text-center">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              active ? 'text-primary' : 'text-foreground'
                            )}
                          >
                            {option.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-tight">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-xl border border-border bg-card/50 animate-pulse"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Language */}
        <StaggerItem>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-warning/10 text-warning">
                  <Languages className="w-4 h-4" />
                </div>
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGE_OPTIONS.map((option) => {
                  const active = selectedLanguage === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleLanguageChange(option.value)}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl border p-3 transition-all text-left',
                        'hover:border-primary/40 hover:bg-primary/5',
                        active
                          ? 'border-primary bg-primary/10 shadow-glow'
                          : 'border-border bg-card/50'
                      )}
                      aria-pressed={active}
                      aria-label={`Set language to ${option.label}`}
                    >
                      {active && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                      )}
                      <span className="text-2xl" aria-hidden>
                        {option.flag}
                      </span>
                      <div>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            active ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {option.native}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {option.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* About */}
        <StaggerItem>
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground">
                  <Info className="w-4 h-4" />
                </div>
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ShikkhaAI</p>
                  <p className="text-sm text-muted-foreground">
                    AI-powered adaptive learning platform
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  v0.1.0
                </Badge>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Built for Bangladeshi students. ShikkhaAI adapts to your learning
                pace, identifies weak topics, and generates personalized study plans
                and practice materials.
              </p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Separator />
        </StaggerItem>

        <StaggerItem>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
