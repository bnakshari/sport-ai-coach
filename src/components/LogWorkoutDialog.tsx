import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface LogWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LogWorkoutDialog = ({ open, onOpenChange }: LogWorkoutDialogProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<string>('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const logWorkoutMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('sessions').insert({
        athlete_id: user.id,
        date: new Date(date).toISOString(),
        type: type as any,
        duration_minutes: duration ? parseInt(duration) : null,
        notes: notes || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Workout logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['recent-sessions'] });
      onOpenChange(false);
      setType('');
      setDuration('');
      setNotes('');
    },
    onError: (error) => {
      toast.error('Failed to log workout');
      console.error('Log workout error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      toast.error('Please select a workout type');
      return;
    }
    logWorkoutMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Workout Type</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="skill_work">Skill Work</SelectItem>
                <SelectItem value="recovery">Recovery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go?"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={logWorkoutMutation.isPending}
          >
            {logWorkoutMutation.isPending ? 'Logging...' : 'Log Workout'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogWorkoutDialog;
