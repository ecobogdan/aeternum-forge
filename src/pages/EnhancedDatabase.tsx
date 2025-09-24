import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Shield,
  Swords,
  Heart,
  Zap,
  Target,
  Gem,
  Book,
  Beaker,
  Mountain,
  Users,
  MapPin,
  Trophy,
  Gamepad2
} from 'lucide-react';
import { siteUrl } from '@/config/seo';

interface DatabaseItem {
  id: string;
  name: string;
  description?: string;
  icon: string;
  iconHiRes?: string;
  tier?: number;
  rarity: string | number;
  type?: string;
  mountType?: string;
  gearScoreMax?: number;
  tradeskill?: string;
  category?: string;
  level?: number;
  expansion?: string;
  // Additional fields for different types
  [key: string]: any;
}

interface CategoryData {
  data: DatabaseItem[];
  pageCount: number;
  currentPage: number;
}

const categories = [
  { 
    id: 'items', 
    name: 'Items', 
    icon: Swords, 
    enabled: true,
    endpoint: 'items',
    description: 'Weapons, armor, and equipment'
  },
  { 
    id: 'mounts', 
    name: 'Mounts', 
    icon: Star, 
    enabled: true,
    endpoint: 'mounts',
    description: 'Horses, wolves, sabretooths and bears'
  },
  { 
    id: 'recipes', 
    name: 'Recipes', 
    icon: Gem, 
    enabled: true,
    endpoint: 'recipes',
    description: 'Crafting recipes and schematics'
  },
  { 
    id: 'abilities', 
    name: 'Abilities', 
    icon: Zap, 
    enabled: true,
    endpoint: 'abilities',
    description: 'Weapon skills and abilities'
  },
  { 
    id: 'perks', 
    name: 'Perks', 
    icon: Target, 
    enabled: true,
    endpoint: 'perks',
    description: 'Item perks and enhancements'
  },
  { 
    id: 'consumables', 
    name: 'Consumables', 
    icon: Beaker, 
    enabled: true,
    endpoint: 'consumables',
    description: 'Potions, food, and consumable items'
  },
  { 
    id: 'lore-books', 
    name: 'Lore Books', 
    icon: Book, 
    enabled: true,
    endpoint: 'lore-books',
    description: 'Collectible lore and story books'
  },
  { 
    id: 'status-effects', 
    name: 'Status Effects', 
    icon: Shield, 
    enabled: true,
    endpoint: 'status-effects',
    description: 'Buffs, debuffs, and conditions'
  },
  { 
    id: 'quests', 
    name: 'Quests', 
    icon: Heart, 
    enabled: true,
    endpoint: 'quests',
    description: 'Missions and storylines'
  },
  { 
    id: 'creatures', 
    name: 'Creatures', 
    icon: Mountain, 
    enabled: true,
    endpoint: 'creatures',
    description: 'Monsters, animals, and NPCs'
  },
  { 
    id: 'gatherables', 
    name: 'Gatherables', 
    icon: Trophy, 
    enabled: true,
    endpoint: 'gatherables',
    description: 'Resources and materials'
  },
  { 
    id: 'npcs', 
    name: 'NPCs', 
    icon: Users, 
    enabled: true,
    endpoint: 'npcs',
    description: 'Non-player characters'
  },
  { 
    id: 'zones', 
    name: 'Zones', 
    icon: MapPin, 
    enabled: true,
    endpoint: 'zones',
    description: 'Areas and territories'
  },
];

const rarityColors = {
  'Common': 'from-gray-400 to-gray-500',
  'Uncommon': 'from-green-400 to-green-500',
  'Rare': 'from-blue-400 to-blue-500',
  'Epic': 'from-purple-400 to-purple-500',
  'Legendary': 'from-orange-400 to-orange-500',
  'Artifact': 'from-red-400 to-red-500',
  0: 'from-gray-400 to-gray-500',
  1: 'from-green-400 to-green-500',
  2: 'from-blue-400 to-blue-500',
  3: 'from-purple-400 to-purple-500',
  4: 'from-orange-400 to-orange-500',
  100: 'from-red-400 to-red-500',
};

const rarityNames = {
  0: 'Common',
  1: 'Uncommon', 
  2: 'Rare',
  3: 'Epic',
  4: 'Legendary',
  100: 'Artifact'
};

const EnhancedDatabase = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DatabaseItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DatabaseItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('items');
  const [categoryData, setCategoryData] = useState<CategoryData>({ data: [], pageCount: 0, currentPage: 1 });
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<DatabaseItem | null>(null);
  const [hoverLoading, setHoverLoading] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const currentHoveredId = useRef<string | null>(null);
  const hoverDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get proper image URL
  const getImageUrl = (item: DatabaseItem) => {
    const iconPath = item.iconHiRes || item.icon;
    if (!iconPath) {
      return '/placeholder.svg';
    }
    // Handle different icon path formats
    const cleanPath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
    return `https://cdn.nwdb.info/db/images/live/v56/${cleanPath}.png`;
  };

  // Get rarity display info
  const getRarityInfo = (rarity: string | number) => {
    const numericRarity = typeof rarity === 'number' ? rarity : 0;
    const rarityName = rarityNames[numericRarity as keyof typeof rarityNames] || 'Common';
    const colorClass = rarityColors[numericRarity as keyof typeof rarityColors] || rarityColors[0];
    return { name: rarityName, colorClass };
  };

  // Fetch category data with caching
  const fetchCategoryData = useCallback(async (category: string, page: number = 1) => {
    setIsLoadingCategory(true);
    try {
      const categoryConfig = categories.find(c => c.id === category);
      if (!categoryConfig) {
        throw new Error(`Unknown category: ${category}`);
      }
      
      const response = await fetch(`https://nwdb.info/db/${categoryConfig.endpoint}/page/${page}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategoryData({
        data: data.data || [],
        pageCount: data.pageCount || 1,
        currentPage: page
      });
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategoryData({ data: [], pageCount: 0, currentPage: 1 });
    } finally {
      setIsLoadingCategory(false);
    }
  }, []);

  // Enhanced search function
  const searchItems = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search in current category
      const categoryConfig = categories.find(c => c.id === activeCategory);
      const response = await fetch(`https://nwdb.info/db/${categoryConfig?.endpoint || 'items'}/page/1.json`);
      const data = await response.json();
      
      // Filter results based on search query
      const filtered = (data.data || []).filter((item: DatabaseItem) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [activeCategory]);

  // Fetch detailed item info for hover
  const fetchItemDetails = useCallback(async (itemId: string): Promise<DatabaseItem | null> => {
    try {
      const categoryConfig = categories.find(c => c.id === activeCategory);
      if (!categoryConfig) return null;

      // For some categories, we might need specific detail endpoints
      let detailUrl = `https://nwdb.info/db/${categoryConfig.endpoint.slice(0, -1)}/${itemId}.json`;
      
      const response = await fetch(detailUrl);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching item details:', error);
      return null;
    }
  }, [activeCategory]);

  // Improved hover handling with better stability
  const handleMouseEnter = useCallback((itemId: string, item: DatabaseItem) => {
    // Clear any existing debounce timeout
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
    }
    
    // Clear any existing hover timeout
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
    }
    
    // Set current hovered item
    currentHoveredId.current = itemId;
    
    // Start loading state immediately for visual feedback
    setHoverLoading(true);
    
    // Debounce the hover start with shorter delay for better UX
    hoverDebounceTimeout.current = setTimeout(() => {
      // Only proceed if this is still the current hovered item
      if (currentHoveredId.current === itemId) {
        // Set a timeout for detailed loading
        const timeout = setTimeout(async () => {
          try {
            // Try to fetch detailed info, fallback to basic item data
            const itemDetails = await fetchItemDetails(itemId) || item;
            
            // Only set if this is still the current hovered item
            if (currentHoveredId.current === itemId) {
              setHoveredItem(itemDetails);
            }
          } catch (error) {
            console.error('Error fetching hover item details:', error);
            // Fallback to basic item data
            if (currentHoveredId.current === itemId) {
              setHoveredItem(item);
            }
          } finally {
            if (currentHoveredId.current === itemId) {
              setHoverLoading(false);
            }
          }
        }, 1000);
        
        setHoverTimeoutId(timeout);
      }
    }, 100); // Shorter debounce for better responsiveness
  }, [fetchItemDetails]);

  // Handle mouse leave with cleanup
  const handleMouseLeave = useCallback(() => {
    // Clear all timeouts
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
      hoverDebounceTimeout.current = null;
    }
    
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    
    // Reset states
    currentHoveredId.current = null;
    setHoveredItem(null);
    setHoverLoading(false);
  }, [hoverTimeoutId]);

  // Search input handling
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchItems(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchItems]);

  // Load initial category data
  useEffect(() => {
    fetchCategoryData(activeCategory);
  }, [activeCategory, fetchCategoryData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutId) clearTimeout(hoverTimeoutId);
      if (hoverDebounceTimeout.current) clearTimeout(hoverDebounceTimeout.current);
    };
  }, [hoverTimeoutId]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedItem(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchCategoryData(activeCategory, page);
  };

  // Handle item selection
  const handleItemSelect = (itemId: string, itemType?: string) => {
    navigate(`/new-world-database/${activeCategory}/${itemId}`);
  };

  // Render enhanced item card
  const renderItemCard = (item: DatabaseItem, index?: number) => {
    const uniqueKey = `${item.id}-${index || 0}`;
    const rarityInfo = getRarityInfo(item.rarity);

    return (
      <Tooltip key={uniqueKey}>
        <TooltipTrigger asChild>
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-br from-card/80 to-slate-900/80 border-slate-700/50 hover:border-primary/30 backdrop-blur-sm"
            onMouseEnter={() => handleMouseEnter(item.id, item)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleItemSelect(item.id, activeCategory)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityInfo.colorClass} rounded-lg opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <img 
                    src={getImageUrl(item)} 
                    alt={item.name}
                    className="relative w-14 h-14 object-contain p-1 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${rarityInfo.colorClass} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                    {item.tier || '?'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    {item.tier && (
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300 bg-slate-800/50">
                        T{item.tier}
                      </Badge>
                    )}
                    <Badge 
                      className={`text-xs text-white bg-gradient-to-r ${rarityInfo.colorClass} border-0 shadow-sm`}
                    >
                      {rarityInfo.name}
                    </Badge>
                    {item.mountType && (
                      <Badge variant="secondary" className="text-xs bg-slate-700/70 text-slate-300">
                        {item.mountType}
                      </Badge>
                    )}
                    {item.gearScoreMax && (
                      <Badge variant="secondary" className="text-xs bg-slate-700/70 text-slate-300">
                        GS {item.gearScoreMax}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm bg-slate-900/95 border-slate-700 backdrop-blur-md">
          {hoverLoading ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-700 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center text-slate-400 text-sm">
                Loading details...
              </div>
            </div>
          ) : hoveredItem && hoveredItem.id === item.id ? (
            <div className="p-4 space-y-3 max-w-xs">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img 
                    src={getImageUrl(hoveredItem)} 
                    alt={hoveredItem.name}
                    className="w-12 h-12 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${getRarityInfo(hoveredItem.rarity).colorClass} flex items-center justify-center text-xs font-bold text-white`}>
                    {hoveredItem.tier || '?'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-primary mb-1">
                    {hoveredItem.name}
                  </div>
                  <div className={`text-sm font-medium bg-gradient-to-r ${getRarityInfo(hoveredItem.rarity).colorClass} bg-clip-text text-transparent`}>
                    {getRarityInfo(hoveredItem.rarity).name}
                  </div>
                  {hoveredItem.type && (
                    <div className="text-slate-300 text-xs mt-1">{hoveredItem.type}</div>
                  )}
                </div>
              </div>

              {hoveredItem.description && (
                <>
                  <div className="border-t border-slate-700"></div>
                  <div className="text-slate-300 text-sm leading-relaxed">
                    {hoveredItem.description}
                  </div>
                </>
              )}

              {(hoveredItem.mountType || hoveredItem.tradeskill || hoveredItem.category) && (
                <>
                  <div className="border-t border-slate-700"></div>
                  <div className="space-y-1">
                    {hoveredItem.mountType && (
                      <div className="flex items-center space-x-2 text-blue-400 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Mount Type: {hoveredItem.mountType}</span>
                      </div>
                    )}
                    {hoveredItem.tradeskill && (
                      <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Trade Skill: {hoveredItem.tradeskill}</span>
                      </div>
                    )}
                    {hoveredItem.category && (
                      <div className="flex items-center space-x-2 text-purple-400 text-sm">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>Category: {hoveredItem.category}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (categoryData.pageCount <= 1) return null;

    const pages = [];
    const totalPages = categoryData.pageCount;
    const currentPage = categoryData.currentPage;

    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page numbers (simplified for better UX)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <Button key={1} variant="outline" size="sm" onClick={() => handlePageChange(1)} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2 text-slate-400">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={i === currentPage 
            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
            : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          }
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-2 text-slate-400">...</span>);
      }
      pages.push(
        <Button key={totalPages} variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
          {totalPages}
        </Button>
      );
    }

    // Next button
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {pages}
      </div>
    );
  };

  const activeConfig = categories.find(c => c.id === activeCategory);

  return (
    <Layout
      title="New World Database - Comprehensive Item Explorer"
      description="Explore the complete New World database with enhanced search and filtering for items, mounts, recipes, abilities, and more."
      canonical={`${siteUrl}/new-world-database`}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent mb-4">
              New World Database
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and explore the complete collection of items, mounts, recipes, and more from the world of Aeternum
            </p>
          </div>

          <div className="flex gap-8">
            {/* Enhanced Sidebar */}
            <div className="w-80 flex-shrink-0">
              <Card className="bg-card/80 backdrop-blur-sm border-slate-700/50 sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-foreground flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    Categories
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {activeConfig?.description || 'Select a category to explore'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isActive = activeCategory === category.id;
                      return (
                        <Button
                          key={category.id}
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start h-auto p-3 ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }`}
                          onClick={() => handleCategoryChange(category.id)}
                        >
                          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                          <div className="text-left">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs opacity-70 mt-0.5">{category.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Main Content */}
            <div className="flex-1">
              {/* Enhanced Search */}
              <Card className="mb-6 bg-card/80 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder={`Search ${activeConfig?.name.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-slate-700/30 border-slate-600 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary text-lg"
                    />
                  </div>
                  
                  {/* Enhanced Search Results */}
                  {searchQuery && (
                    <div className="mt-6">
                      {isSearching ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full bg-slate-700/50" />
                          ))}
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            Found {searchResults.length} results
                          </h3>
                          {searchResults.map((item, index) => (
                            <div key={`search-${item.id}-${index}`}>
                              {renderItemCard(item, index)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-muted-foreground text-lg">No items found</div>
                          <div className="text-sm text-muted-foreground mt-2">Try adjusting your search terms</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Category Content */}
              {!searchQuery && (
                <Card className="bg-card/80 backdrop-blur-sm border-slate-700/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                      {activeConfig && <activeConfig.icon className="h-6 w-6 text-primary" />}
                      {activeConfig?.name}
                      <Badge variant="secondary" className="ml-auto bg-slate-700/70 text-slate-300">
                        {isLoadingCategory ? '...' : `${categoryData.data.length} items`}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCategory ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(12)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full bg-slate-700/50" />
                        ))}
                      </div>
                    ) : categoryData.data.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryData.data.map((item, index) => renderItemCard(item, index))}
                        </div>
                        {renderPagination()}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-muted-foreground text-xl">No items available</div>
                        <div className="text-sm text-muted-foreground mt-2">This category might be empty or unavailable</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedDatabase;