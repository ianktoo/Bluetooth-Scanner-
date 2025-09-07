
export interface DeviceInfo {
  id: string;
  name: string;
  rssi: number;
  timestamp: number;
}

export enum DeviceCategory {
  Phone = 'Phone',
  Computer = 'Computer',
  Headphones = 'Headphones',
  Speaker = 'Speaker',
  Wearable = 'Wearable',
  Health = 'Health Device',
  Peripheral = 'Peripheral',
  SmartHome = 'Smart Home',
  Other = 'Other',
  Unknown = 'Unknown',
}

// FIX: Add declarations for the Web Bluetooth API to satisfy TypeScript.
// This avoids errors when accessing navigator.bluetooth, which is an experimental API.
declare global {
  interface Bluetooth extends EventTarget {
    requestLEScan(options?: BluetoothLEScanOptions): Promise<BluetoothLEScan>;
    addEventListener(type: 'advertisementreceived', listener: (this: this, ev: AdvertisementReceivedEvent) => any, useCapture?: boolean): void;
  }

  interface BluetoothLEScan {
    stop: () => void;
  }

  interface BluetoothLEScanOptions {
    acceptAllAdvertisements?: boolean;
    filters?: any[];
  }

  interface BluetoothDevice {
    id: string;
    name?: string | null;
  }

  interface AdvertisementReceivedEvent extends Event {
    device: BluetoothDevice;
    rssi: number;
  }

  interface Navigator {
    bluetooth: Bluetooth;
  }
}
