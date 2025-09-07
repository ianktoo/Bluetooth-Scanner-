
import React from 'react';
import { DeviceInfo, DeviceCategory } from '../types';
import { CATEGORY_ICONS, TX_POWER, ENV_FACTOR } from '../constants';

interface DeviceCardProps {
  device: DeviceInfo;
  category: DeviceCategory;
}

const calculateDistance = (rssi: number): string => {
  if (rssi === 0) {
    return '?';
  }
  const ratio = rssi * 1.0 / TX_POWER;
  if (ratio < 1.0) {
    return `~${Math.pow(ratio, 10).toFixed(1)}m`;
  } else {
    const distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
    return `~${distance.toFixed(1)}m`;
  }
};

const SignalStrength: React.FC<{ rssi: number }> = ({ rssi }) => {
    const getStrengthLevel = () => {
        if (rssi > -60) return 4; // Excellent
        if (rssi > -70) return 3; // Good
        if (rssi > -80) return 2; // Fair
        if (rssi > -90) return 1; // Weak
        return 0; // Very Weak
    };

    const level = getStrengthLevel();
    const bars = Array.from({ length: 4 }, (_, i) => i < level);

    return (
        <div className="flex items-end space-x-0.5 h-4">
            {bars.map((active, index) => (
                <div
                    key={index}
                    className={`w-1 rounded-full ${active ? 'bg-green-400' : 'bg-gray-600'}`}
                    style={{ height: `${(index + 1) * 25}%` }}
                ></div>
            ))}
        </div>
    );
};


const DeviceCard: React.FC<DeviceCardProps> = ({ device, category }) => {
  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Unknown;
  const distance = calculateDistance(device.rssi);

  return (
    <div className="bg-gray-medium p-4 rounded-lg border border-gray-light shadow-md hover:border-brand-blue hover:scale-105 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Icon className="w-8 h-8 mr-3 text-brand-purple" />
            <h3 className="text-lg font-bold text-white break-all">{device.name}</h3>
          </div>
          <span className="text-2xl font-mono text-white">{distance}</span>
        </div>
        <p className="text-xs text-gray-500 break-all">ID: {device.id}</p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-medium text-gray-400">Signal Strength</span>
        <div className="flex items-center space-x-2">
            <SignalStrength rssi={device.rssi} />
            <span className="text-xs font-mono text-green-400">{device.rssi} dBm</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
