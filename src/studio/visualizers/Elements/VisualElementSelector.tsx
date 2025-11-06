// components/VisualElementSelector.tsx
import React from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useVisualizer } from '../../../components/contexts/VisualizerContext';
import { defaultCustomizations } from '../../../components/contexts/VisualizerContext';
import { Button } from '../../../components/ui/Button';
import { VisualElement } from '../../types/visualizer';

export const VisualElementSelector: React.FC = () => {
  const { 
    visualElements, 
    selectedElement, 
    setSelectedElement,
    setVisualElements 
  } = useVisualizer();

const addNewElement = (type: VisualElement['type']) => {
  const elementNames = {
    particle: 'Particles',
    shape: 'Shape',
    light: 'Light',
    grid: 'Grid',
    wave: 'Wave',
    background: 'Background'
  };

  // Use functional update to avoid stale state
  setVisualElements(prev => {
    const newElement: VisualElement = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${elementNames[type]} ${prev.filter(el => el.type === type).length + 1}`,
      visible: true,
      customization: defaultCustomizations[type] as any
    };
    
    return [...prev, newElement];
  });
  
  // Note: You might need to handle selectedElement differently with functional update
  setSelectedElement(`${type}-${Date.now()}`);
};
  const removeElement = (id: string, e: React.MouseEvent) => {
  e.stopPropagation();
  setVisualElements(prev => prev.filter(el => el.id !== id));
  if (selectedElement === id) {
    setSelectedElement(null);
  }
};

  return (
    <div className="absolute bottom-24 left-4 flex flex-col gap-2">
      {/* Add New Element Dropdown */}
      <div className="relative group">
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          className="mb-2"
        >
          Add Element
        </Button>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-xl p-2 min-w-40 shadow-2xl z-50">
          <div className="grid grid-cols-2 gap-1">
            {(['particle', 'shape', 'light', 'grid', 'wave', 'background'] as const).map((type) => (
              <button
                key={type}
                onClick={() => addNewElement(type)}
                className="text-xs p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 capitalize"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Element List */}
      <div className="space-y-2">
        {visualElements.map((element) => (
          <div
            key={element.id}
            className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-xl transition-all cursor-pointer group ${
              selectedElement === element.id
                ? 'bg-cyan-500/20 border-cyan-500/50 shadow-lg'
                : 'bg-slate-800/90 border-slate-600 hover:bg-slate-700/90'
            } ${!element.visible ? 'opacity-50' : ''}`}
            onClick={() => setSelectedElement(element.id)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: (element.customization as any).color }}
            />
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {element.name}
              </div>
              <div className="text-xs text-slate-400 capitalize">
                {element.type}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                icon={<Settings size={12} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(element.id);
                }}
                className="p-1 hover:bg-slate-600"
              />
              
              {!element.id.includes('background') && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={12} />}
                  onClick={(e) => removeElement(element.id, e)}
                  className="p-1 hover:bg-rose-500/20"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};