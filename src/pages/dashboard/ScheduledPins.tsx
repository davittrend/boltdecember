import { useState, useEffect } from 'react';
import { useAccountStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { ScheduledPin } from '@/types/pinterest';

export function ScheduledPins() {
  const { selectedAccountId, boards } = useAccountStore();
  const [scheduledPins, setScheduledPins] = useState<ScheduledPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publishingPinId, setPublishingPinId] = useState<string | null>(null);
  const [deletingPinId, setDeletingPinId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAccountId) {
      fetchScheduledPins();
    }
  }, [selectedAccountId]);

  const fetchScheduledPins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/.netlify/functions/pin-scheduler');
      if (!response.ok) throw new Error('Failed to fetch scheduled pins');
      const { pins } = await response.json();
      setScheduledPins(pins);
    } catch (error) {
      toast.error('Failed to load scheduled pins');
      console.error('Error fetching scheduled pins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishNow = async (pin: ScheduledPin) => {
    try {
      setPublishingPinId(pin.id);
      const response = await fetch('/.netlify/functions/pin-scheduler/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinId: pin.id }),
      });

      if (!response.ok) throw new Error('Failed to publish pin');
      
      toast.success('Pin published successfully!');
      await fetchScheduledPins(); // Refresh the list
    } catch (error) {
      toast.error('Failed to publish pin');
      console.error('Error publishing pin:', error);
    } finally {
      setPublishingPinId(null);
    }
  };

  const handleDelete = async (pin: ScheduledPin) => {
    try {
      setDeletingPinId(pin.id);
      const response = await fetch('/.netlify/functions/pin-scheduler', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinId: pin.id }),
      });

      if (!response.ok) throw new Error('Failed to delete pin');
      
      toast.success('Pin deleted successfully!');
      setScheduledPins(pins => pins.filter(p => p.id !== pin.id));
    } catch (error) {
      toast.error('Failed to delete pin');
      console.error('Error deleting pin:', error);
    } finally {
      setDeletingPinId(null);
    }
  };

  const getBoardName = (boardId: string) => {
    const board = boards[selectedAccountId!]?.find(b => b.id === boardId);
    return board?.name || 'Unknown Board';
  };

  if (!selectedAccountId) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No Account Selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select a Pinterest account first.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Scheduled Pins</h1>
      </div>

      {scheduledPins.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No Scheduled Pins</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by scheduling some pins.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y">
            {scheduledPins.map((pin) => (
              <div key={pin.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{pin.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{pin.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(pin.scheduledTime), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(pin.scheduledTime), 'h:mm a')}
                      </div>
                      <div>
                        Board: {getBoardName(pin.boardId)}
                      </div>
                      <div className="capitalize">
                        Status: {pin.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {pin.status === 'scheduled' && (
                      <Button
                        onClick={() => handlePublishNow(pin)}
                        disabled={publishingPinId === pin.id}
                      >
                        {publishingPinId === pin.id ? 'Publishing...' : 'Publish Now'}
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(pin)}
                      disabled={deletingPinId === pin.id}
                    >
                      {deletingPinId === pin.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}