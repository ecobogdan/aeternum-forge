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
import { simpleNwdbService } from '@/services/simpleNwdbService';

interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconHiRes?: string;
  tier: number;
  rarity: string;
  baseDamage?: number;
  critChance?: number;
  critDamageMultiplier?: number;
  blockStaminaDamage?: number;
  blockStability?: number;
  perks: Array<{
    id: string;
    name?: string;
    description?: string;
  }>;
  gearScoreMax: number;
  gearScoreMin?: number;
  itemType?: string;
  mountType?: string;
  type?: string;
  tradeskill?: string;
  category?: string;
  level?: number;
  attributes?: Array<{
    name: string;
    value: number;
    isSelectable?: boolean;
  }>;
  sockets?: Array<{
    type: string;
    description: string;
  }>;
}

interface SearchResult {
  id: string;
  name: string;
  rarity: string;
  tier: number;
  icon: string;
  iconHiRes?: string;
  gearScoreMax?: number;
  mountType?: string;
  type?: string;
  tradeskill?: string;
  category?: string;
}

interface CategoryData {
  data: SearchResult[];
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

const Database = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('items');
  const [categoryData, setCategoryData] = useState<CategoryData>({ data: [], pageCount: 0, currentPage: 1 });
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [hoveredPerk, setHoveredPerk] = useState<any>(null);
  const [hoverLoading, setHoverLoading] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [perksCache, setPerksCache] = useState<Record<string, any>>({});
  const currentHoveredId = useRef<string | null>(null);
  const hoverDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get proper image URL
  const getImageUrl = (item: SearchResult | Item) => {
    const iconPath = 'iconHiRes' in item ? item.iconHiRes || item.icon : item.icon;
    if (!iconPath) {
      return '/placeholder.svg';
    }
    // Remove leading slash if present and ensure proper path
    const cleanPath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
    const fullUrl = `https://cdn.nwdb.info/db/images/live/v56/${cleanPath}.png`;
    return fullUrl;
  };

  // Get rarity display info
  const getRarityInfo = (rarity: string | number) => {
    const numericRarity = typeof rarity === 'number' ? rarity : 0;
    const rarityName = rarityNames[numericRarity as keyof typeof rarityNames] || 'Common';
    const colorClass = rarityColors[numericRarity as keyof typeof rarityColors] || rarityColors[0];
    return { name: rarityName, colorClass };
  };

  // Fetch item details using the original service
  const fetchItemDetails = useCallback(async (itemId: string): Promise<Item | null> => {
    try {
      if (itemId && itemId.startsWith('perkid_')) {
        console.log('Skipping perk ID:', itemId);
        return null;
      }
      
      const responseData = await simpleNwdbService.getItemDetails(itemId);
      
      if (responseData.error) {
        console.error('Error fetching item details:', responseData.error);
        return null;
      }
      
      const data = responseData.data || responseData;
      
      if (!data) {
        console.error('No data found for item:', itemId);
        return null;
      }
      
      // Fetch perk details
      const perksWithDetails = await Promise.all(
        (data.perks || []).map(async (perk: any) => {
          if (perksCache[perk.id]) {
            return { ...perk, ...perksCache[perk.id] };
          }
          
          try {
            const perkResponse = await fetch(`https://nwdb.info/db/perk/${perk.id}.json`);
            const perkData = await perkResponse.json();
            const perkInfo = {
              name: perkData.data?.name || perkData.name,
              description: perkData.data?.description || perkData.description
            };
            
            setPerksCache(prev => ({ ...prev, [perk.id]: perkInfo }));
            return { ...perk, ...perkInfo };
          } catch {
            return perk;
          }
        })
      );

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        iconHiRes: data.iconHiRes,
        tier: data.tier,
        rarity: data.rarity,
        baseDamage: data.baseDamage,
        critChance: data.critChance,
        critDamageMultiplier: data.critDamageMultiplier,
        blockStaminaDamage: data.blockStaminaDamage,
        blockStability: data.blockStability,
        perks: perksWithDetails,
        gearScoreMax: data.gearScoreMax,
        gearScoreMin: data.gearScoreMin,
        itemType: data.itemType,
        attributes: data.attributes,
        sockets: data.sockets,
      };
    } catch (error) {
      console.error('Error fetching item details:', error);
      return null;
    }
  }, [perksCache]);

  // Search function using the original service
  const searchItems = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await simpleNwdbService.searchItems(query, 10);
      
      const searchResults = results.map(item => ({
        id: item.id,
        name: item.name,
        rarity: item.rarity || 'Unknown',
        icon: item.icon || '',
        tier: item.tier || 0,
      }));
      
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fetch perk details
  const fetchPerkDetails = useCallback(async (perkId: string): Promise<any> => {
    try {
      const responseData = await simpleNwdbService.getPerkDetails(perkId);
      
      if (responseData.error) {
        console.error('Error fetching perk details:', responseData.error);
        return null;
      }
      
      const data = responseData.data || responseData;
      
      return {
        id: data.id || perkId,
        name: data.name || 'Unknown Perk',
        description: data.description || 'No description available',
        rarity: data.rarity || 'Common',
        tier: data.tier || 0,
        icon: data.icon || data.iconHiRes,
        type: data.type || 'perk',
        itemType: data.itemType || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching perk details:', error);
      return null;
    }
  }, []);

  // Fetch category data
  const fetchCategoryData = useCallback(async (category: string, page: number = 1) => {
    const categoryConfig = categories.find(c => c.id === category);
    if (!categoryConfig) return;

    setIsLoadingCategory(true);
    try {
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

  // Enhanced hover handling
  const handleMouseEnter = useCallback((itemId: string) => {
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
    }
    
    currentHoveredId.current = itemId;
    
    hoverDebounceTimeout.current = setTimeout(() => {
      if (currentHoveredId.current === itemId) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        setHoverLoading(true);
        
        const timeout = setTimeout(async () => {
          try {
            const itemDetails = await fetchItemDetails(itemId);
            if (currentHoveredId.current === itemId) {
              setHoveredItem(itemDetails);
            }
          } catch (error) {
            console.error('Error fetching hover item details:', error);
          } finally {
            if (currentHoveredId.current === itemId) {
              setHoverLoading(false);
            }
          }
        }, 1000);
        
        setHoverTimeout(timeout);
      }
    }, 50);
  }, [fetchItemDetails, hoverTimeout]);

  const handlePerkMouseEnter = useCallback((perkId: string) => {
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
    }
    
    currentHoveredId.current = perkId;
    
    hoverDebounceTimeout.current = setTimeout(() => {
      if (currentHoveredId.current === perkId) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        setHoverLoading(true);
        
        const timeout = setTimeout(async () => {
          try {
            const perkDetails = await fetchPerkDetails(perkId);
            if (currentHoveredId.current === perkId) {
              setHoveredPerk(perkDetails);
            }
          } catch (error) {
            console.error('Error fetching hover perk details:', error);
          } finally {
            if (currentHoveredId.current === perkId) {
              setHoverLoading(false);
            }
          }
        }, 1000);
        
        setHoverTimeout(timeout);
      }
    }, 50);
  }, [fetchPerkDetails, hoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
      hoverDebounceTimeout.current = null;
    }
    
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    currentHoveredId.current = null;
    setHoveredItem(null);
    setHoveredPerk(null);
    setHoverLoading(false);
  }, [hoverTimeout]);

  // Handle search input
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      if (hoverDebounceTimeout.current) {
        clearTimeout(hoverDebounceTimeout.current);
      }
    };
  }, [hoverTimeout]);

  // Handle item selection - navigate to detail page (RESTORED)
  const handleItemSelect = (itemId: string, itemType?: string) => {
    if ((itemId && itemId.startsWith('perkid_')) || activeCategory === 'perks') {
      navigate(`/new-world-database/perk/${itemId}`);
      return;
    }
    
    navigate(`/new-world-database/item/${itemId}`);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.enabled) {
      setActiveCategory(categoryId);
      setSelectedItem(null);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchCategoryData(activeCategory, page);
  };

  // Render item card with enhanced design
  const renderItemCard = (item: SearchResult | Item, index?: number) => {
    const isFullItem = 'perks' in item;
    const itemData = isFullItem ? item : item as SearchResult;
    const uniqueKey = `${itemData.id}-${index || 0}`;
    const isPerk = activeCategory === 'perks' || (itemData.id && itemData.id.startsWith('perkid_'));
    const rarityInfo = getRarityInfo(itemData.rarity);

    return (
      <Tooltip key={uniqueKey}>
        <TooltipTrigger asChild>
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 bg-gradient-to-br from-card/80 to-slate-900/80 border-slate-700/50 hover:border-primary/30 backdrop-blur-sm"
            onMouseEnter={() => isPerk ? handlePerkMouseEnter(itemData.id) : handleMouseEnter(itemData.id)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleItemSelect(itemData.id, activeCategory)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityInfo.colorClass} rounded-lg opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <img 
                    src={getImageUrl(itemData)} 
                    alt={itemData.name}
                    className="relative w-14 h-14 object-contain p-1 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${rarityInfo.colorClass} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                    {itemData.tier || '?'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                    {itemData.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    {itemData.tier && (
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300 bg-slate-800/50">
                        T{itemData.tier}
                      </Badge>
                    )}
                    <Badge 
                      className={`text-xs text-white bg-gradient-to-r ${rarityInfo.colorClass} border-0 shadow-sm`}
                    >
                      {rarityInfo.name}
                    </Badge>
                    {itemData.mountType && (
                      <Badge variant="secondary" className="text-xs bg-slate-700/70 text-slate-300">
                        {itemData.mountType}
                      </Badge>
                    )}
                    {itemData.gearScoreMax && (
                      <Badge variant="secondary" className="text-xs bg-slate-700/70 text-slate-300">
                        GS {itemData.gearScoreMax}
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
                Loading {isPerk ? 'perk' : 'item'} details...
              </div>
            </div>
          ) : (hoveredItem && hoveredItem.id === itemData.id) || (hoveredPerk && hoveredPerk.id === itemData.id) ? (
            <div className="p-4 space-y-3 max-w-xs">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img 
                    src={isPerk ? getImageUrl(hoveredPerk) : getImageUrl(hoveredItem)} 
                    alt={isPerk ? hoveredPerk?.name : hoveredItem?.name}
                    className="w-12 h-12 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${getRarityInfo(isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity).colorClass} flex items-center justify-center text-xs font-bold text-white`}>
                    {isPerk ? hoveredPerk?.tier : hoveredItem?.tier}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-primary mb-1">
                    {isPerk ? hoveredPerk?.name : hoveredItem?.name}
                  </div>
                  <div className={`text-sm font-medium bg-gradient-to-r ${getRarityInfo(isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity).colorClass} bg-clip-text text-transparent`}>
                    {getRarityInfo(isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity).name}
                  </div>
                  {(isPerk ? hoveredPerk?.itemType : hoveredItem?.itemType) && (
                    <div className="text-slate-300 text-xs mt-1">{isPerk ? hoveredPerk?.itemType : hoveredItem?.itemType}</div>
                  )}
                </div>
              </div>

              {!isPerk && hoveredItem?.gearScoreMax && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                  <div className="text-2xl font-bold text-white">{hoveredItem?.gearScoreMax}</div>
                </div>
              )}

              <div className="border-t border-slate-600"></div>

              {(isPerk ? hoveredPerk?.description : hoveredItem?.description) && (
                <div className="text-slate-300 text-sm leading-relaxed">
                  {isPerk ? hoveredPerk?.description : hoveredItem?.description}
                </div>
              )}

              {isPerk && hoveredPerk && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-blue-400 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Type: {hoveredPerk.type}</span>
                  </div>
                </div>
              )}

              {!isPerk && hoveredItem?.attributes && hoveredItem?.attributes.length > 0 && (
                <div className="space-y-1">
                  {hoveredItem?.attributes.slice(0, 2).map((attr, index) => (
                    <div key={index} className="flex items-center space-x-2 text-blue-400 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>+{attr.value} {attr.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {!isPerk && hoveredItem?.perks && hoveredItem?.perks.length > 0 && (
                <div className="space-y-1">
                  {hoveredItem?.perks.slice(0, 2).map((perk, index) => (
                    <div key={index} className="flex items-center space-x-2 text-blue-400 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>{perk.name || `Random Perk`}</span>
                    </div>
                  ))}
                  {hoveredItem?.perks.length > 2 && (
                    <div className="text-gray-400 text-sm">+{hoveredItem?.perks.length - 2} more perks...</div>
                  )}
                </div>
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
      title="New World Database - Search Items, Mounts, and More"
      description="Search and browse New World items, mounts, recipes, and more in our comprehensive database."
      canonical={`${siteUrl}/new-world-database`}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent mb-4">
              New World Database
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and explore items, mounts, recipes, and more from Aeternum
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

            {/* Main Content */}
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
                  
                  {/* Search Results */}
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

              {/* Category Content */}
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

export default Database;