import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, MessageSquare, BarChart } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Performance Hub</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>Get Started</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Train Smarter with AI-Powered Coaching
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Track your workouts, analyze your progress, and get personalized coaching insights powered by advanced AI
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
            Start Your Journey
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Performance</h3>
            <p className="text-muted-foreground">
              Log your workouts and monitor progress with detailed analytics and insights
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Coaching</h3>
            <p className="text-muted-foreground">
              Get personalized training advice and technique tips from your AI coach
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Data-Driven Insights</h3>
            <p className="text-muted-foreground">
              Visualize your progress and identify areas for improvement with smart analytics
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
