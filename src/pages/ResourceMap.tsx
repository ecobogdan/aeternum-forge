import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Eye, EyeOff, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Resource data structure
interface ResourceNode {
  id: string;
  name: string;
  type: string;
  category: string;
  coordinates: [number, number];
  icon: string;
  region: string;
  tier?: number;
  quantity?: number;
}

const regions = [
  'All Regions',
  'Brightwood',
  'Brimstone Sands', 
  'Cutlass Keys',
  'Ebonscale Reach',
  'Edengrove',
  'Everfall',
  'Elysian Wilds',
  'Great Cleave',
  "Monarch's Bluffs",
  'Mourningdale',
  'Reekwater',
  'Restless Shore',
  'Shattered Mountain',
  "Weaver's Fen",
  'Windsward'
];

const resourceCategories = [
  {
    name: 'Events',
    items: [
      { name: 'Medleyfaire Village', icon: '🎪', count: 1 },
      { name: 'Aeternum Sturgeon Hotspot', icon: '🐟', count: 3 },
      { name: 'Maudlinbug Swarm', icon: '🐛', count: 5 }
    ]
  },
  {
    name: 'Chests',
    items: [
      { name: 'Elite Doubloon Cache', icon: '💰', count: 1 },
      { name: 'Cursed Chest', icon: '👻', count: 123 },
      { name: 'Expedition Chest', icon: '📦', count: 12345 },
      { name: 'Elite Ancient Chest', icon: '⚱️', count: 12345 },
      { name: 'Elite Supply Stockpile', icon: '📋', count: 12345 }
    ]
  },
  {
    name: 'Enemies',
    items: [
      { name: 'Boss', icon: '👹', count: 847 },
      { name: 'Elite Boss', icon: '💀', count: 156 },
      { name: 'Rafflebones (Lvl 20)', icon: '☠️', count: 2 },
      { name: 'Rafflebones (Lvl 60)', icon: '💀', count: 8 }
    ]
  },
  {
    name: 'Farming',
    items: [
      { name: 'Hemp', icon: '🌿', count: 2847 },
      { name: 'Silkweed', icon: '🕸️', count: 1256 },
      { name: 'Wirefiber', icon: '🪢', count: 856 },
      { name: 'Iron Ore', icon: '⛏️', count: 3421 },
      { name: 'Silver Ore', icon: '⚡', count: 1847 },
      { name: 'Gold Ore', icon: '🏆', count: 923 }
    ]
  }
];

// Sample resource nodes data
const sampleNodes: ResourceNode[] = [
  {
    id: '1',
    name: 'Iron Deposit',
    type: 'Iron Ore',
    category: 'Farming',
    coordinates: [-73.935242, 40.730610],
    icon: '⛏️',
    region: 'Everfall',
    tier: 2,
    quantity: 5
  },
  {
    id: '2', 
    name: 'Hemp Field',
    type: 'Hemp',
    category: 'Farming',
    coordinates: [-73.925242, 40.740610],
    icon: '🌿',
    region: 'Windsward',
    tier: 1,
    quantity: 10
  }
];

const ResourceMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNodes, setShowNodes] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [enabledCategories, setEnabledCategories] = useState<{[key: string]: boolean}>({
    Events: true,
    Chests: true,
    Enemies: true,
    Farming: true
  });
  const markers = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      preferCanvas: true,
    }).setView([40.730610, -73.935242], 10);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Create custom icon for markers
    const createCustomIcon = (emoji: string) => L.divIcon({
      html: `<div style="font-size: 20px; text-align: center; line-height: 1;">${emoji}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: 'custom-resource-marker'
    });

    // Add sample markers
    sampleNodes.forEach(node => {
      if (map.current) {
        const marker = L.marker([node.coordinates[1], node.coordinates[0]], {
          icon: createCustomIcon(node.icon)
        })
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${node.name}</h3>
              <p class="text-sm text-muted-foreground">${node.type}</p>
              <p class="text-xs">${node.region}</p>
              ${node.quantity ? `<p class="text-xs">Quantity: ${node.quantity}</p>` : ''}
            </div>
          `)
          .addTo(map.current);
        
        markers.current.push(marker);
      }
    });

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, []);

  const toggleCategory = (categoryName: string) => {
    setEnabledCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const toggleAllCategories = (enabled: boolean) => {
    const newCategories: {[key: string]: boolean} = {};
    Object.keys(enabledCategories).forEach(key => {
      newCategories[key] = enabled;
    });
    setEnabledCategories(newCategories);
  };


  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Resource Map
          </h1>
          
          {/* Controls */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <Button
                variant={showNodes ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNodes(!showNodes)}
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-1" />
                Nodes
              </Button>
              <Button
                variant={showRoutes ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRoutes(!showRoutes)}
                className="flex-1"
              >
                Routes
              </Button>
            </div>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllCategories(true)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllCategories(false)}
              className="flex-1"
            >
              <EyeOff className="h-4 w-4 mr-1" />
              None
            </Button>
          </div>
        </div>

        {/* Resource Categories */}
        <div className="p-4 space-y-4">
          {resourceCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  {category.name}
                </h3>
                <Checkbox
                  checked={enabledCategories[category.name]}
                  onCheckedChange={() => toggleCategory(category.name)}
                />
              </div>
              
              <div className="space-y-2">
                {category.items
                  .filter(item => 
                    !searchTerm || 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors ${
                        enabledCategories[category.name] ? 'opacity-100' : 'opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.count.toLocaleString()}
                      </Badge>
                    </div>
                  ))
                }
              </div>
              
              {category.name !== resourceCategories[resourceCategories.length - 1].name && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Map Overlay UI */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <Card className="pointer-events-auto">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                <span className="font-medium">
                  {Object.values(enabledCategories).filter(Boolean).length} categories active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResourceMap;