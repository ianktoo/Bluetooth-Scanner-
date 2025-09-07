
import React, { useMemo } from 'react';
import { DeviceInfo, DeviceCategory } from '../types';
import DeviceCard from './DeviceCard';
import { CATEGORY_ICONS } from '../constants';

interface DeviceListProps {
  devices: DeviceInfo[];
  categories: Record<string, DeviceCategory>;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, categories }) => {
    
  const groupedDevices = useMemo(() => {
    const groups: Record<DeviceCategory, DeviceInfo[]> = {} as any;

    devices.forEach(device => {
      const category = categories[device.name] || DeviceCategory.Unknown;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(device);
    });

    return Object.entries(groups).sort(([catA], [catB]) => catA.localeCompare(catB));
  }, [devices, categories]);
  
  if (devices.length === 0) {
    return null;
  }
  
  const hasCategories = Object.keys(categories).length > 0;

  if (!hasCategories) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(device => (
            <DeviceCard key={device.id} device={device} category={DeviceCategory.Unknown} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedDevices.map(([category, deviceList]) => {
        const Icon = CATEGORY_ICONS[category as DeviceCategory] || CATEGORY_ICONS.Unknown;
        return (
          <div key={category}>
            <div className="flex items-center mb-4">
              <Icon className="w-6 h-6 mr-3 text-brand-blue" />
              <h2 className="text-2xl font-bold text-white">{category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deviceList.map(device => (
                <DeviceCard key={device.id} device={device} category={category as DeviceCategory} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeviceList;
