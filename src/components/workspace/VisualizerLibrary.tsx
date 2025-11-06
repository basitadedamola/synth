import { Search, Star, Grid3x3, Waves, Box as BoxIcon, Sparkles } from 'lucide-react';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Visualizer {
  id: string;
  name: string;
  type: 'bars' | 'particles' | 'waveform' | '3d';
  thumbnail: string;
  rating: number;
  favorite: boolean;
}

const visualizers: Visualizer[] = [
  { id: '1', name: 'Frequency Bars', type: 'bars', thumbnail: '🎵', rating: 4.8, favorite: true },
  { id: '2', name: 'Particle Flow', type: 'particles', thumbnail: '✨', rating: 4.9, favorite: false },
  { id: '3', name: 'Wave Ripple', type: 'waveform', thumbnail: '🌊', rating: 4.7, favorite: true },
  { id: '4', name: 'Spiral Galaxy', type: '3d', thumbnail: '🌌', rating: 4.6, favorite: false },
  { id: '5', name: 'Neon Grid', type: 'bars', thumbnail: '⚡', rating: 4.5, favorite: false },
  { id: '6', name: 'Audio Sphere', type: '3d', thumbnail: '🔮', rating: 4.8, favorite: true },
];

const typeIcons = {
  bars: Grid3x3,
  particles: Sparkles,
  waveform: Waves,
  '3d': BoxIcon,
};

export function VisualizerLibrary() {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="text-magenta-400" size={20} />
          Visualizers
        </h2>
      </div>

      <Input
        placeholder="Search visualizers..."
        icon={<Search size={16} />}
      />

      <div className="flex gap-2 flex-wrap">
        {(['all', 'bars', 'particles', 'waveform', '3d'] as const).map((type) => (
          <button
            key={type}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${type === 'all'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }
            `}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {visualizers.map((viz) => {
            const Icon = typeIcons[viz.type];
            return (
              <Card
                key={viz.id}
                hover
                glow="cyan"
                className="p-4 cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg mb-3 flex items-center justify-center text-4xl relative overflow-hidden group">
                  {viz.thumbnail}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {viz.favorite && (
                    <Star
                      size={16}
                      className="absolute top-2 right-2 fill-amber-400 text-amber-400"
                    />
                  )}
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{viz.name}</h3>
                <div className="flex items-center justify-between">
                  <Badge variant="default" size="sm">
                    <Icon size={12} className="mr-1" />
                    {viz.type}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {viz.rating}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
