import React, { useState } from "react";

const DEVICES = [
  {
    name: "Phone",
    width: 375,
    height: 812,
    className: "border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-900",
  },
  {
    name: "Tablet",
    width: 768,
    height: 1024,
    className: "border-2 border-gray-300 rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-gray-900",
  },
  {
    name: "Desktop",
    width: 1280,
    height: 800,
    className: "border border-gray-200 rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-900",
  },
];

export default function DevicePreview({ children }) {
  const [device, setDevice] = useState(DEVICES[0]);

  return (
    <div className="flex flex-col items-center gap-4 my-8">
      <div className="flex gap-2 mb-2">
        {DEVICES.map((d) => (
          <button
            key={d.name}
            className={`px-3 py-1 rounded font-medium border transition-colors duration-150 ${
              device.name === d.name
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => setDevice(d)}
          >
            {d.name}
          </button>
        ))}
      </div>
      <div
        className={device.className}
        style={{ width: device.width, height: device.height, maxWidth: "100%" }}
      >
        <div style={{ width: "100%", height: "100%", overflow: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
