import { Upload, Music, Wand2, Loader2, FileAudio } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AudioFile {
  name: string;
  size: number;
  duration?: number;
  bpm?: number;
  key?: string;
}

export function AudioUploadPanel() {
  const [isDragging, setIsDragging] = useState(false);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(f => f.type.startsWith('audio/'));

    if (audioFile) {
      simulateAnalysis(audioFile);
    }
  };

  const simulateAnalysis = (file: File) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAudioFile({
        name: file.name,
        size: file.size,
        duration: 234,
        bpm: 128,
        key: 'A minor',
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Music className="text-cyan-400" size={20} />
          Audio Input
        </h2>
        <Button variant="secondary" size="sm" icon={<Wand2 size={16} />}>
          AI Generate
        </Button>
      </div>

      {!audioFile ? (
        <Card
          className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-300 ${
            isDragging ? 'border-cyan-500 bg-cyan-500/10 scale-[0.98]' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-cyan-400 animate-spin" size={48} />
              <p className="text-slate-300">Analyzing audio...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-cyan-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Drop your audio file</h3>
              <p className="text-slate-400 text-center mb-6">
                Support for MP3, WAV, FLAC, OGG
                <br />
                <span className="text-sm">or use AI to generate music</span>
              </p>
              <Button variant="primary">
                Browse Files
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <FileAudio className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{audioFile.name}</h3>
                <p className="text-sm text-slate-400">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  {audioFile.duration && ` · ${Math.floor(audioFile.duration / 60)}:${(audioFile.duration % 60).toString().padStart(2, '0')}`}
                </p>
                <div className="flex gap-2 mt-3">
                  {audioFile.bpm && <Badge variant="info" size="sm">{audioFile.bpm} BPM</Badge>}
                  {audioFile.key && <Badge variant="default" size="sm">{audioFile.key}</Badge>}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Waveform</h4>
            <div className="h-24 bg-slate-900/50 rounded-lg flex items-center justify-center gap-1 px-2">
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full opacity-70"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                  }}
                />
              ))}
            </div>
          </Card>

          <Button variant="secondary" className="w-full">
            Replace Audio
          </Button>
        </div>
      )}
    </div>
  );
}
