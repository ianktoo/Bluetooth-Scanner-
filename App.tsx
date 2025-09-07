
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DeviceInfo, DeviceCategory } from './types';
import { categorizeDeviceNames } from './services/geminiService';
import DeviceList from './components/DeviceList';
import Loader from './components/Loader';
import { BluetoothIcon } from './components/icons';

const SCAN_DURATION = 15000; // 15 seconds

const App: React.FC = () => {
  const [devices, setDevices] = useState<Map<string, DeviceInfo>>(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, DeviceCategory>>({});
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof navigator.bluetooth?.requestLEScan !== 'function') {
      setIsSupported(false);
      setError("Web Bluetooth Scanning is not supported in this browser. Please try Chrome on desktop or Android.");
    }
  }, []);

  const handleScan = useCallback(async () => {
    if (isScanning || !isSupported) return;

    setError(null);
    setDevices(new Map());
    setCategories({});
    setIsScanning(true);

    try {
      const scan = await navigator.bluetooth.requestLEScan({ acceptAllAdvertisements: true });

      const scanTimeout = setTimeout(() => {
        scan.stop();
        setIsScanning(false);
        console.log('Scan stopped due to timeout.');
      }, SCAN_DURATION);

      navigator.bluetooth.addEventListener('advertisementreceived', (event) => {
        const { device, rssi, device: { name } } = event;
        // Filter out devices with no name or rssi
        if (!name || !rssi) return;

        setDevices(prevDevices => {
          const newDevices = new Map(prevDevices);
          const existingDevice = newDevices.get(device.id);

          // Update existing device or add new one
          newDevices.set(device.id, {
            id: device.id,
            name: name || "Unknown Device",
            rssi: rssi,
            timestamp: Date.now(),
          });
          
          return newDevices;
        });
      });

      console.log('Scanning...');
      
      // When scan stops (manually or timeout), this will be caught
      // Unfortunately, there's no promise that resolves when stop() is called.
      // We rely on the timeout and the state change.
      
    } catch (err: any) {
      console.error('Bluetooth scan error:', err);
      if (err.name === 'NotFoundError') {
        setError('No Bluetooth devices found or permission denied.');
      } else {
        setError(err.message || 'An unknown error occurred during scanning.');
      }
      setIsScanning(false);
    }
  }, [isScanning, isSupported]);

  useEffect(() => {
    if (!isScanning && devices.size > 0 && Object.keys(categories).length === 0) {
      const categorize = async () => {
        setIsCategorizing(true);
        setError(null);
        try {
          const deviceNames = Array.from(devices.values()).map(d => d.name);
          const uniqueNames = [...new Set(deviceNames)];
          const newCategories = await categorizeDeviceNames(uniqueNames);
          setCategories(newCategories);
        } catch (err) {
          console.error('Categorization error:', err);
          setError('Could not categorize devices. Please check your Gemini API key.');
        } finally {
          setIsCategorizing(false);
        }
      };
      categorize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, devices]);

  const sortedDevices = useMemo(() => {
    return Array.from(devices.values()).sort((a, b) => b.rssi - a.rssi);
  }, [devices]);

  return (
    <div className="bg-gray-dark min-h-screen text-gray-text font-sans">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Bluetooth Proximity Scanner
            </h1>
            <span className="text-4xl">📡</span>
          </div>
          <p className="text-lg text-gray-400">Discover and categorize nearby Bluetooth devices.</p>
        </header>

        <div className="text-center mb-8">
          <button
            onClick={handleScan}
            disabled={isScanning || isCategorizing || !isSupported}
            className="bg-brand-blue hover:bg-blue-500 disabled:bg-gray-light disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center justify-center mx-auto"
          >
            {isScanning ? (
              <>
                <Loader />
                Scanning...
              </>
            ) : isCategorizing ? (
              <>
                <Loader />
                Categorizing...
              </>
            ) : (
              <>
                <BluetoothIcon className="w-6 h-6 mr-3" />
                Start Scan
              </>
            )}
          </button>
        </div>
        
        {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative text-center my-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {sortedDevices.length === 0 && !isScanning && (
          <div className="text-center bg-gray-medium p-8 rounded-lg mt-8 border border-gray-light">
              <h2 className="text-2xl font-semibold text-white">Welcome!</h2>
              <p className="mt-2 text-gray-400">Click "Start Scan" to discover BLE devices around you.</p>
              <p className="text-sm mt-4 text-gray-500">Note: This feature requires a browser with Web Bluetooth Scanning support (e.g., Chrome) and may require enabling experimental web platform features.</p>
          </div>
        )}
        
        <DeviceList devices={sortedDevices} categories={categories} />
      </main>
      <footer className="text-center py-4 text-sm text-gray-500">
        <p>Powered by React, Tailwind CSS, and the Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
