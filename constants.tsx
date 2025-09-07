
import React from 'react';
import { DeviceCategory } from './types';
import { PhoneIcon, ComputerIcon, HeadphonesIcon, SpeakerIcon, WatchIcon, HeartIcon, MouseIcon, HomeIcon, OtherIcon, UnknownIcon } from './components/icons';

export const CATEGORY_ICONS: Record<DeviceCategory, React.ComponentType<{ className?: string }>> = {
  [DeviceCategory.Phone]: PhoneIcon,
  [DeviceCategory.Computer]: ComputerIcon,
  [DeviceCategory.Headphones]: HeadphonesIcon,
  [DeviceCategory.Speaker]: SpeakerIcon,
  [DeviceCategory.Wearable]: WatchIcon,
  [DeviceCategory.Health]: HeartIcon,
  [DeviceCategory.Peripheral]: MouseIcon,
  [DeviceCategory.SmartHome]: HomeIcon,
  [DeviceCategory.Other]: OtherIcon,
  [DeviceCategory.Unknown]: UnknownIcon,
};

// Constants for distance calculation
// Assumed signal strength at 1 meter. Common values are between -59 and -69.
export const TX_POWER = -59; 
// Environmental factor. 2 for free space, can be up to 4 for lossy environments.
export const ENV_FACTOR = 2.5; 
