import { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import type { PinData } from '@/types/pinterest';

interface FileUploaderProps {
  onPinsLoaded: (pins: PinData[]) => void;
}

export function FileUploader({ onPinsLoaded }: FileUploaderProps) {
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        try {
          const parsedPins = results.data
            .slice(1) // Skip header row
            .filter((row: any[]) => row.length === 4 && row.every(cell => cell)) // Ensure all cells have values
            .map((row: any[]) => ({
              title: row[0],
              description: row[1],
              link: row[2],
              imageUrl: row[3],
            }));

          if (parsedPins.length === 0) {
            toast.error('No valid pins found in CSV file');
            return;
          }

          onPinsLoaded(parsedPins);
          toast.success(`Successfully loaded ${parsedPins.length} pins`);
        } catch (error) {
          toast.error('Error parsing CSV file. Please check the format.');
          console.error('CSV parsing error:', error);
        }
      },
      error: (error) => {
        toast.error('Error reading CSV file: ' + error.message);
      },
    });

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Upload CSV File
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500">
              <span>Upload a file</span>
              <input
                type="file"
                className="sr-only"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">
            CSV with columns: title, description, link, imageUrl
          </p>
        </div>
      </div>
    </div>
  );
}