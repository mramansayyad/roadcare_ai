import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored markers
const createColoredIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const priorityColors = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
};

export default function ReportsMap({ reports }) {
  // Default to Solapur, India
  const defaultCenter = [17.6599, 75.9064];
  
  const validReports = reports.filter(r => r.latitude && r.longitude);
  const center = validReports.length > 0 
    ? [validReports[0].latitude, validReports[0].longitude]
    : defaultCenter;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#1a365d] text-white py-3 px-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Live Complaint Map - Solapur
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] w-full">
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createColoredIcon(priorityColors[report.priority] || priorityColors.Medium)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-bold text-[#1a365d] mb-2">#{report.complaintId}</p>
                    <div className="flex gap-2 mb-2">
                      <PriorityBadge priority={report.priority} showIcon={false} />
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Type:</strong> {report.damageType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Dept:</strong> {report.department}
                    </p>
                    {report.image && (
                      <img 
                        src={report.image} 
                        alt="Damage" 
                        className="w-full h-20 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 py-3 bg-gray-50 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Medium</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}