import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Eye, EyeOff, Filter, X, Plus, Minus } from 'lucide-react';
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

// Sample resource nodes data with game world coordinates
const sampleNodes: ResourceNode[] = [
  {
    id: '1',
    name: 'Iron Deposit',
    type: 'Iron Ore',
    category: 'Farming',
    coordinates: [35, 45], // Percentage coordinates on the map image
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
    coordinates: [50, 30],
    icon: '🌿',
    region: 'Windsward',
    tier: 1,
    quantity: 10
  },
  {
    id: '3',
    name: 'Elite Ancient Chest',
    type: 'Elite Ancient Chest',
    category: 'Chests',
    coordinates: [25, 60],
    icon: '⚱️',
    region: 'Great Cleave',
    tier: 5,
    quantity: 1
  },
  {
    id: '4',
    name: 'Boss Spawn',
    type: 'Boss',
    category: 'Enemies',
    coordinates: [70, 20],
    icon: '👹',
    region: 'Shattered Mountain',
    tier: 5,
    quantity: 1
  }
];

const ResourceMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
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
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mouse and touch handlers for map interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  };

  const filteredNodes = sampleNodes.filter(node => {
    const matchesSearch = !searchTerm || 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'All Regions' || 
      node.region === selectedRegion;
    
    const matchesCategory = enabledCategories[node.category];
    
    return matchesSearch && matchesRegion && matchesCategory && showNodes;
  });

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
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-card border-r border-border overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Aeternum Map
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
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
              <SelectContent className="bg-popover border border-border z-50">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
      <div className="flex-1 relative overflow-hidden bg-slate-900">
        {!sidebarOpen && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 left-4 z-20"
            onClick={() => setSidebarOpen(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Game World Map */}
        <div 
          className="absolute inset-0 cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            className="relative"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              width: '200%',
              height: '200%',
              backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
              backgroundSize: '100px 100px',
              backgroundPosition: '0 0, 50px 50px'
            }}
          >
            {/* Placeholder map background - replace with actual New World map image */}
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 relative">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
              </div>
              
              {/* Region Labels */}
              <div className="absolute top-1/4 left-1/4 text-white/60 font-semibold text-sm">Windsward</div>
              <div className="absolute top-1/3 left-1/2 text-white/60 font-semibold text-sm">Everfall</div>
              <div className="absolute top-1/2 right-1/4 text-white/60 font-semibold text-sm">Brightwood</div>
              <div className="absolute bottom-1/4 left-1/3 text-white/60 font-semibold text-sm">Great Cleave</div>
              
              {/* Resource Nodes */}
              {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform group"
                  style={{
                    left: `${node.coordinates[0]}%`,
                    top: `${node.coordinates[1]}%`
                  }}
                  title={`${node.name} - ${node.type}`}
                >
                  <div className="text-2xl drop-shadow-lg">{node.icon}</div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {node.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Map Info */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <Card className="pointer-events-auto">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                <span className="font-medium">
                  {filteredNodes.length} nodes • {Object.values(enabledCategories).filter(Boolean).length} categories
                </span>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-xs text-muted-foreground pointer-events-auto">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceMap;