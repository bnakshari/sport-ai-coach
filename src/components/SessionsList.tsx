import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

type Session = {
  id: string;
  athlete_id: string;
  coach_id: string | null;
  date: string;
  duration_minutes: number | null;
  type: 'strength' | 'cardio' | 'flexibility' | 'skill_work' | 'recovery';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

interface SessionsListProps {
  sessions: Session[];
}

const SessionsList = ({ sessions }: SessionsListProps) => {
  const getSessionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      strength: 'bg-red-500',
      cardio: 'bg-blue-500',
      flexibility: 'bg-green-500',
      skill_work: 'bg-purple-500',
      recovery: 'bg-yellow-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No sessions yet. Log your first workout to get started!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Badge className={getSessionTypeColor(session.type)}>
                  {session.type.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(session.date).toLocaleDateString()}
              </div>
            </div>
            {session.duration_minutes && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                {session.duration_minutes} minutes
              </div>
            )}
            {session.notes && (
              <p className="text-sm text-foreground mt-2">{session.notes}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SessionsList;
