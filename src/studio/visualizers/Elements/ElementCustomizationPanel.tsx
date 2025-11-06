// components/ElementCustomizationPanel.tsx
import React from 'react';
import { X, Eye, EyeOff, Palette, Zap, Settings } from 'lucide-react';
import { useVisualizer } from '../../../components/contexts/VisualizerContext';
import { Button } from '../../../components/ui/Button';
import { Slider } from '../../../components/ui/Slider';

interface CustomizationField {
  key: string;
  label: string;
  type: 'color' | 'slider' | 'select' | 'checkbox';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export const ElementCustomizationPanel: React.FC = () => {
  const { 
    visualElements, 
    selectedElement, 
    setSelectedElement, 
    updateElement,
    updateElementCustomization 
  } = useVisualizer();

  const element = visualElements.find(el => el.id === selectedElement);

  if (!element) return null;

  const getCustomizationFields = (): CustomizationField[] => {
    const baseFields: CustomizationField[] = [
      {
        key: 'color',
        label: 'Color',
        type: 'color',
      },
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.01,
      },
      { 
        key: 'responseTo', 
        label: 'Response To', 
        type: 'select',
        options: [
          { value: 'bass', label: 'Bass' },
          { value: 'mid', label: 'Mid Range' },
          { value: 'treble', label: 'Treble' },
          { value: 'beat', label: 'Beat' },
          { value: 'overall', label: 'Overall' },
        ]
      },
    ];

    // Add intensity for all types except background
    if (element.type !== 'background') {
      baseFields.splice(2, 0, {
        key: 'intensity',
        label: 'Intensity',
        type: 'slider',
        min: 0,
        max: 2,
        step: 0.1,
      });
    }

    const typeSpecificFields: Record<string, CustomizationField[]> = {
      particle: [
        { key: 'size', label: 'Size', type: 'slider', min: 0.01, max: 1, step: 0.01 },
        { key: 'speed', label: 'Speed', type: 'slider', min: 0.1, max: 3, step: 0.1 },
        { key: 'count', label: 'Count', type: 'slider', min: 100, max: 10000, step: 100 },
      ],
      light: [
        { key: 'intensity', label: 'Intensity', type: 'slider', min: 0, max: 2, step: 0.1 },
      ],
      grid: [
        { key: 'size', label: 'Grid Size', type: 'slider', min: 5, max: 50, step: 1 },
        { key: 'divisions', label: 'Divisions', type: 'slider', min: 10, max: 100, step: 1 },
      ],
      background: [
        { key: 'gradient', label: 'Gradient', type: 'checkbox' },
        { key: 'gradientStart', label: 'Gradient Start', type: 'color' },
        { key: 'gradientEnd', label: 'Gradient End', type: 'color' },
      ],
      shape: [
        { key: 'size', label: 'Size', type: 'slider', min: 0.1, max: 5, step: 0.1 },
        { key: 'rotationSpeed', label: 'Rotation Speed', type: 'slider', min: 0, max: 5, step: 0.1 },
        {
          key: 'geometry',
          label: 'Geometry',
          type: 'select',
          options: [
            { value: 'cube', label: 'Cube' },
            { value: 'sphere', label: 'Sphere' },
            { value: 'cone', label: 'Cone' },
            { value: 'torus', label: 'Torus' },
          ]
        },
        { key: 'wireframe', label: 'Wireframe', type: 'checkbox' },
      ],
      wave: [
        { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 0.1, max: 10, step: 0.1 },
        { key: 'frequency', label: 'Frequency', type: 'slider', min: 0.1, max: 5, step: 0.1 },
        { key: 'speed', label: 'Speed', type: 'slider', min: 0.1, max: 3, step: 0.1 },
        { key: 'points', label: 'Points', type: 'slider', min: 10, max: 200, step: 1 },
      ]
    };

    return [...baseFields, ...(typeSpecificFields[element.type] || [])];
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    updateElementCustomization(element.id, { [fieldKey]: value });
  };

  const toggleVisibility = () => {
    updateElement(element.id, { visible: !element.visible });
  };

  const fields = getCustomizationFields();

  // Safe value getter with fallbacks
  const getValue = (fieldKey: string): any => {
    const value = (element.customization as any)[fieldKey];
    
    // Handle different field types
    if (fieldKey === 'color' && !value) return '#000000';
    if (fieldKey === 'opacity' && value === undefined) return 1;
    if (fieldKey === 'intensity' && value === undefined) return 1;
    if (fieldKey === 'responseTo' && !value) return 'overall';
    
    return value;
  };

  const getSliderValue = (fieldKey: string): number => {
    const value = getValue(fieldKey);
    return typeof value === 'number' ? value : 0;
  };

  const getColorValue = (fieldKey: string): string => {
    const value = getValue(fieldKey);
    return typeof value === 'string' ? value : '#000000';
  };

  const getSelectValue = (fieldKey: string): string => {
    const value = getValue(fieldKey);
    return typeof value === 'string' ? value : '';
  };

  const getCheckboxValue = (fieldKey: string): boolean => {
    const value = getValue(fieldKey);
    return typeof value === 'boolean' ? value : false;
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-2xl shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700 rounded-lg">
            <Palette size={16} className="text-slate-300" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{element.name}</h3>
            <p className="text-xs text-slate-400 capitalize">{element.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={element.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            onClick={toggleVisibility}
            className="p-2 hover:bg-slate-700"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={16} />}
            onClick={() => setSelectedElement(null)}
            className="p-2 hover:bg-slate-700"
          />
        </div>
      </div>

      {/* Customization Fields */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>{field.label}</span>
              {field.type === 'slider' && (
                <span className="text-xs text-slate-400">
                  {getValue(field.key)}
                </span>
              )}
            </label>

            {field.type === 'slider' && (
              <Slider
                value={getSliderValue(field.key)}
                onChange={(v) => handleFieldChange(field.key, v)}
                min={field.min || 0}
                max={field.max || 100}
                step={field.step || 1}
              />
            )}

            {field.type === 'color' && (
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getColorValue(field.key)}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-600 bg-slate-700 cursor-pointer"
                />
              </div>
            )}

            {field.type === 'select' && (
              <select
                value={getSelectValue(field.key)}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white cursor-pointer"
              >
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={getCheckboxValue(field.key)}
                  onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                />
                <span className="text-sm text-slate-300">Enabled</span>
              </label>
            )}
          </div>
        ))}
      </div>

      {/* Audio Response Preview */}
      {element.type !== 'background' && (
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">Audio Response</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Current: {getValue('responseTo') || 'overall'}</span>
              <span>Active</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
                style={{ 
                  width: `${(getValue('intensity') || 1) * 50}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};