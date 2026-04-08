import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Clock, CalendarDays } from "lucide-react";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return [`${h}:00`, `${h}:30`];
}).flat();

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
}

const MentorAvailability = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({ day_of_week: "1", start_time: "09:00", end_time: "10:00" });

  useEffect(() => {
    if (user) fetchSlots();
  }, [user]);

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", user!.id)
      .order("day_of_week", { ascending: true });
    setSlots((data as AvailabilitySlot[]) || []);
    setLoading(false);
  };

  const handleAddSlot = async () => {
    if (!user) return;
    const { error } = await supabase.from("mentor_availability").insert({
      mentor_id: user.id,
      day_of_week: parseInt(newSlot.day_of_week),
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      is_recurring: true,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Availability slot added!" });
      fetchSlots();
    }
  };

  const handleRemoveSlot = async (id: string) => {
    await supabase.from("mentor_availability").delete().eq("id", id);
    toast({ title: "Slot removed" });
    fetchSlots();
  };

  // Group slots by day
  const slotsByDay = DAYS_OF_WEEK.map((day, i) => ({
    day,
    dayIndex: i,
    slots: slots.filter(s => s.day_of_week === i),
  }));

  if (loading) return null;

  return (
    <div className="space-y-4">
      {/* Add New Slot */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" /> Set Your Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Day</label>
              <Select value={newSlot.day_of_week} onValueChange={v => setNewSlot(p => ({ ...p, day_of_week: v }))}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((d, i) => (
                    <SelectItem key={i} value={i.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">From</label>
              <Input
                type="time"
                value={newSlot.start_time}
                onChange={e => setNewSlot(p => ({ ...p, start_time: e.target.value }))}
                className="w-[120px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">To</label>
              <Input
                type="time"
                value={newSlot.end_time}
                onChange={e => setNewSlot(p => ({ ...p, end_time: e.target.value }))}
                className="w-[120px]"
              />
            </div>
            <Button onClick={handleAddSlot} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Slot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {slotsByDay.filter(d => d.slots.length > 0).map(({ day, dayIndex, slots: daySlots }) => (
          <Card key={dayIndex} className="border-border">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm text-foreground mb-2">{day}</h4>
              <div className="space-y-2">
                {daySlots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveSlot(slot.id)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {slots.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              No availability slots set. Add your available times above so students can book sessions.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MentorAvailability;
