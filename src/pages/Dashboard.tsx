import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Activity, TrendingUp, Calendar } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import SessionsList from '@/components/SessionsList';
import LogWorkoutDialog from '@/components/LogWorkoutDialog';

const Dashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const [showLogWorkout, setShowLogWorkout] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recent-sessions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('athlete_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Performance Hub</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back{profile?.sport ? `, ${profile.sport} athlete` : ''}!
          </h2>
          <p className="text-muted-foreground">
            Track your progress and get AI-powered coaching insights
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentSessions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentSessions?.filter(s => {
                  const sessionDate = new Date(s.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return sessionDate >= weekAgo;
                }).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Sessions completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">+12%</div>
              <p className="text-xs text-muted-foreground">vs last month</p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">AI Coach</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowChat(true)}
                className="w-full"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask Coach
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Sessions</h3>
              <Button onClick={() => setShowLogWorkout(true)}>
                Log Workout
              </Button>
            </div>
            <SessionsList sessions={recentSessions || []} />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sport</span>
                    <span className="font-medium">{profile?.sport || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Position</span>
                    <span className="font-medium">{profile?.position || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Goals</span>
                    <span className="font-medium text-right max-w-[200px]">
                      {profile?.goals || 'Not set'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {showChat && <ChatInterface onClose={() => setShowChat(false)} />}
      {showLogWorkout && (
        <LogWorkoutDialog 
          open={showLogWorkout} 
          onOpenChange={setShowLogWorkout}
        />
      )}
    </div>
  );
};

export default Dashboard;
