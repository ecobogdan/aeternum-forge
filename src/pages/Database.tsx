import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Star,
  Shield,
  Swords,
  Heart,
  Zap,
  Target,
  Gem,
  Lock,
  Book
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
}

interface Perk {
  id: string;
  name: string;
  description: string;
}

interface CategoryData {
  data: SearchResult[];
  pageCount: number;
  currentPage: number;
}

const categories = [
  { id: 'items', name: 'Items', icon: Swords, enabled: true },
  { id: 'mounts', name: 'Mounts', icon: Star, enabled: false },
  { id: 'recipes', name: 'Recipes', icon: Gem, enabled: false },
  { id: 'abilities', name: 'Abilities', icon: Zap, enabled: false },
  { id: 'perks', name: 'Perks', icon: Target, enabled: true },
  { id: 'lore-books', name: 'Lore Books', icon: Book, enabled: false },
  { id: 'status-effects', name: 'Status Effects', icon: Shield, enabled: false },
  { id: 'quests', name: 'Quests', icon: Heart, enabled: false },
  { id: 'creatures', name: 'Creatures', icon: Swords, enabled: false },
  { id: 'gatherables', name: 'Gatherables', icon: Gem, enabled: false },
  { id: 'shops', name: 'Shops', icon: Lock, enabled: false },
  { id: 'npcs', name: 'NPCs', icon: Lock, enabled: false },
  { id: 'zones', name: 'Zones', icon: Lock, enabled: false },
];

const rarityColors = {
  'Common': 'bg-gray-500',
  'Uncommon': 'bg-green-500',
  'Rare': 'bg-blue-500',
  'Epic': 'bg-purple-500',
  'Legendary': 'bg-orange-500',
  'Artifact': 'bg-red-500',
};

// Rarity-based outline colors (numeric values)
const rarityOutlineColors = {
  100: 'ring-red-500 border-red-500', // Artifact
  4: 'ring-orange-500 border-orange-500', // Legendary
  3: 'ring-purple-600 border-purple-600', // Epic
  2: 'ring-blue-500 border-blue-500', // Rare
  1: 'ring-green-500 border-green-500', // Uncommon
  0: 'ring-gray-300 border-gray-300', // Common
};

// Rarity-based text colors
const rarityTextColors = {
  100: 'text-red-400', // Artifact
  4: 'text-orange-400', // Legendary
  3: 'text-purple-400', // Epic
  2: 'text-blue-400', // Rare
  1: 'text-green-400', // Uncommon
  0: 'text-gray-300', // Common
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
  const [perksCache, setPerksCache] = useState<Record<string, Perk>>({});
  const currentHoveredId = useRef<string | null>(null);
  const hoverDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch item details using the new service
  const fetchItemDetails = useCallback(async (itemId: string): Promise<Item | null> => {
    try {
      // Skip if this is a perk ID
      if (itemId && itemId.startsWith('perkid_')) {
        console.log('Skipping perk ID:', itemId);
        return null;
      }
      
      console.log('Fetching item details for:', itemId);
      const responseData = await simpleNwdbService.getItemDetails(itemId);
      
      if (responseData.error) {
        console.error('Error fetching item details:', responseData.error);
        return null;
      }
      
      // The API returns data in a 'data' property
      const data = responseData.data || responseData;
      
      if (!data) {
        console.error('No data found for item:', itemId);
        return null;
      }
      
      console.log('Item data:', data);
      console.log('Icon path:', data.icon);
      console.log('IconHiRes path:', data.iconHiRes);
      console.log('Rarity value:', data.rarity, 'type:', typeof data.rarity);
      
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

  // Search function - using the new service
  const searchItems = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await simpleNwdbService.searchItems(query, 10);
      
      // Use the data already available from search results
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

  // Fetch perk details using the new service
  const fetchPerkDetails = useCallback(async (perkId: string): Promise<any> => {
    try {
      console.log('Fetching perk details for:', perkId);
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
    if (category === 'items') {
      setIsLoadingCategory(true);
      try {
        const response = await fetch(`https://nwdb.info/db/items/page/${page}.json`);
        const data = await response.json();
        setCategoryData({
          data: data.data || [],
          pageCount: data.pageCount || 0,
          currentPage: page
        });
      } catch (error) {
        console.error('Error fetching category data:', error);
        setCategoryData({ data: [], pageCount: 0, currentPage: 1 });
      } finally {
        setIsLoadingCategory(false);
      }
    } else if (category === 'perks') {
      setIsLoadingCategory(true);
      try {
        const response = await fetch(`https://nwdb.info/db/perks/page/${page}.json`);
        const data = await response.json();
        setCategoryData({
          data: data.data || [],
          pageCount: data.pageCount || 0,
          currentPage: page
        });
      } catch (error) {
        console.error('Error fetching perks data:', error);
        setCategoryData({ data: [], pageCount: 0, currentPage: 1 });
      } finally {
        setIsLoadingCategory(false);
      }
    }
  }, []);

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

  // Get proper image URL
  const getImageUrl = (item: SearchResult | Item) => {
    const iconPath = 'icon' in item ? item.icon : (item as Item).iconHiRes || (item as SearchResult).iconHiRes;
    if (!iconPath) {
      console.log('No icon path provided for item:', item);
      return '/placeholder.svg';
    }
    // Remove leading slash if present and ensure proper path
    const cleanPath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
    const fullUrl = `https://cdn.nwdb.info/db/images/live/v56/${cleanPath}.png`;
    console.log('Icon URL:', fullUrl);
    return fullUrl;
  };

  // Get rarity numeric value for color mapping
  const getRarityNumeric = (rarity: string | number): number => {
    console.log('Getting rarity numeric for:', rarity, 'type:', typeof rarity);
    
    // If it's already a number, return it
    if (typeof rarity === 'number') {
      return rarity;
    }
    
    const rarityMap: Record<string, number> = {
      'Common': 0,
      'Uncommon': 1,
      'Rare': 2,
      'Epic': 3,
      'Legendary': 4,
      'Artifact': 100,
    };
    const result = rarityMap[rarity] ?? 0;
    console.log('Mapped rarity:', rarity, 'to numeric:', result);
    return result;
  };

  // Get rarity outline classes
  const getRarityOutlineClasses = (rarity: string | number): string => {
    const numericRarity = getRarityNumeric(rarity);
    const classes = rarityOutlineColors[numericRarity as keyof typeof rarityOutlineColors] || rarityOutlineColors[0];
    console.log('Rarity outline classes for', rarity, ':', classes);
    return classes;
  };

  // Get rarity text color classes
  const getRarityTextClasses = (rarity: string | number): string => {
    const numericRarity = getRarityNumeric(rarity);
    const classes = rarityTextColors[numericRarity as keyof typeof rarityTextColors] || rarityTextColors[0];
    console.log('Rarity text classes for', rarity, ':', classes);
    return classes;
  };

  // Handle delayed hover with loading state
  const handleMouseEnter = useCallback((itemId: string) => {
    // Clear any existing debounce timeout
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
    }
    
    // Set current hovered item
    currentHoveredId.current = itemId;
    
    // Debounce the hover start
    hoverDebounceTimeout.current = setTimeout(() => {
      // Only proceed if this is still the current hovered item
      if (currentHoveredId.current === itemId) {
        // Clear any existing timeout
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        // Set loading state
        setHoverLoading(true);
        
        // Set a new timeout for 1 second
        const timeout = setTimeout(async () => {
          try {
            const itemDetails = await fetchItemDetails(itemId);
            // Only set if this is still the current hovered item
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
    }, 50); // Small debounce to prevent rapid triggers
  }, [fetchItemDetails]);

  // Handle mouse leave - clear timeout and reset states
  const handleMouseLeave = useCallback(() => {
    // Clear debounce timeout
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
  }, []);

  // Handle delayed hover for perks with loading state
  const handlePerkMouseEnter = useCallback((perkId: string) => {
    // Clear any existing debounce timeout
    if (hoverDebounceTimeout.current) {
      clearTimeout(hoverDebounceTimeout.current);
    }
    
    // Set current hovered item
    currentHoveredId.current = perkId;
    
    // Debounce the hover start
    hoverDebounceTimeout.current = setTimeout(() => {
      // Only proceed if this is still the current hovered item
      if (currentHoveredId.current === perkId) {
        // Clear any existing timeout
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
        
        // Set loading state
        setHoverLoading(true);
        
        // Set a new timeout for 1 second
        const timeout = setTimeout(async () => {
          try {
            const perkDetails = await fetchPerkDetails(perkId);
            // Only set if this is still the current hovered item
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
    }, 50); // Small debounce to prevent rapid triggers
  }, [fetchPerkDetails]);

  // Handle item selection - navigate to detail page
  const handleItemSelect = (itemId: string, itemType?: string) => {
    // Check if this is a perk ID or if we're in the perks category
    if ((itemId && itemId.startsWith('perkid_')) || itemType === 'perks') {
      // Navigate to a perk detail page
      navigate(`/new-world-database/perk/${itemId}`);
      return;
    }
    
    // Regular item navigation
    navigate(`/new-world-database/item/${itemId}`);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (categories.find(c => c.id === categoryId)?.enabled) {
      setActiveCategory(categoryId);
      setSelectedItem(null);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchCategoryData(activeCategory, page);
  };

  // Render item card with hover tooltip
  const renderItemCard = (item: SearchResult | Item, index?: number) => {
    const isFullItem = 'perks' in item;
    const itemData = isFullItem ? item : item as SearchResult;
    const uniqueKey = `${itemData.id}-${index || 0}`;
    const isPerk = activeCategory === 'perks' || (itemData.id && itemData.id.startsWith('perkid_'));

    console.log('Rendering item card for:', itemData.name, 'rarity:', itemData.rarity, 'type:', typeof itemData.rarity, 'isPerk:', isPerk);

    return (
      <Tooltip key={uniqueKey}>
        <TooltipTrigger asChild>
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:ring-2 bg-slate-800/50 border-slate-700 ${getRarityOutlineClasses(itemData.rarity)}`}
              onMouseEnter={() => isPerk ? handlePerkMouseEnter(itemData.id) : handleMouseEnter(itemData.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleItemSelect(itemData.id, activeCategory)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={getImageUrl(itemData)} 
                      alt={itemData.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      rarityColors[itemData.rarity as keyof typeof rarityColors] || 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${getRarityTextClasses(itemData.rarity)}`}>{itemData.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        Tier {itemData.tier}
                      </Badge>
                      <Badge 
                        className={`text-xs ${
                          rarityColors[itemData.rarity as keyof typeof rarityColors] || 'bg-gray-500'
                        }`}
                      >
                        {itemData.rarity}
                      </Badge>
                      {isFullItem && (
                        <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                          GS {itemData.gearScoreMax}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm bg-slate-800 border-slate-600">
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
              <div className="p-4 space-y-3">
                {/* Header with icon and basic info */}
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img 
                      src={isPerk ? getImageUrl(hoveredPerk) : getImageUrl(hoveredItem)} 
                      alt={isPerk ? hoveredPerk?.name : hoveredItem?.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                      rarityColors[(isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity) as keyof typeof rarityColors] || 'bg-gray-500'
                    } flex items-center justify-center text-xs font-bold text-white`}>
                      {isPerk ? hoveredPerk?.tier : hoveredItem?.tier}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold text-lg ${getRarityTextClasses(isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity)}`}>
                      {isPerk ? hoveredPerk?.name : hoveredItem?.name}
                    </div>
                    <div className="text-yellow-400 font-medium">{isPerk ? hoveredPerk?.rarity : hoveredItem?.rarity}</div>
                    {(isPerk ? hoveredPerk?.itemType : hoveredItem?.itemType) && (
                      <div className="text-gray-300 text-sm">{isPerk ? hoveredPerk?.itemType : hoveredItem?.itemType}</div>
                    )}
                  </div>
                </div>

                {/* Gear Score (only for items) */}
                {!isPerk && hoveredItem?.gearScoreMax && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-sm"></div>
                    </div>
                    <div className="text-2xl font-bold text-white">{hoveredItem?.gearScoreMax}</div>
                  </div>
                )}

                <div className="border-t border-slate-600"></div>

                {/* Description */}
                {(isPerk ? hoveredPerk?.description : hoveredItem?.description) && (
                  <div className="text-gray-300 text-sm">
                    {isPerk ? hoveredPerk?.description : hoveredItem?.description}
                  </div>
                )}

                {/* Perk-specific information */}
                {isPerk && hoveredPerk && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-blue-400 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Type: {hoveredPerk.type}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-400 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Tier: {hoveredPerk.tier}</span>
                    </div>
                  </div>
                )}

                {/* Attributes (only for items) */}
                {!isPerk && hoveredItem?.attributes && hoveredItem?.attributes.length > 0 && (
                  <div className="space-y-1">
                    {hoveredItem?.attributes.slice(0, 2).map((attr, index) => (
                      <div key={index} className="flex items-center space-x-2 text-blue-400 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>+{attr.value} {attr.name}{attr.isSelectable ? ' (selectable attribute)' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sockets (only for items) */}
                {!isPerk && hoveredItem?.sockets && hoveredItem?.sockets.length > 0 && (
                  <div className="space-y-1">
                    {hoveredItem?.sockets.slice(0, 1).map((socket, index) => (
                      <div key={index} className="flex items-center space-x-2 text-blue-400 text-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>{socket.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Perks (only for items) */}
                {!isPerk && hoveredItem?.perks && hoveredItem?.perks.length > 0 && (
                  <div className="space-y-1">
                    {hoveredItem?.perks.slice(0, 2).map((perk, index) => (
                      <div key={index} className="flex items-center space-x-2 text-blue-400 text-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>{perk.name || `100% Random Perk`}</span>
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

    // First page
    if (currentPage > 3) {
      pages.push(
        <Button
          key={1}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          1
        </Button>
      );
      if (currentPage > 4) {
        pages.push(<span key="ellipsis1" className="px-2 text-slate-400">...</span>);
      }
    }

    // Page numbers around current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={i === currentPage 
            ? "bg-yellow-500 text-slate-900 hover:bg-yellow-400" 
            : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          }
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push(<span key="ellipsis2" className="px-2 text-slate-400">...</span>);
      }
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
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
      <div className="flex items-center justify-center space-x-2 mt-6">
        {pages}
      </div>
    );
  };

  return (
    <Layout
      title="New World Database - Search Items, Mounts, and More"
      description="Search and browse New World items, mounts, recipes, and more in our comprehensive database."
      canonical={`${siteUrl}/new-world-database`}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">New World Database</h1>
            <p className="text-gray-300">Search and browse items, mounts, recipes, and more</p>
          </div>

          <div className="flex gap-6">
            {/* Left Sidebar */}
            <div className="w-64 flex-shrink-0">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Button
                          key={category.id}
                          variant={activeCategory === category.id ? "default" : "ghost"}
                          className={`w-full justify-start ${
                            !category.enabled ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            activeCategory === category.id 
                              ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }`}
                          onClick={() => handleCategoryChange(category.id)}
                          disabled={!category.enabled}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {category.name}
                          {!category.enabled && <Lock className="h-3 w-3 ml-auto" />}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search Bar */}
              <Card className="mb-6 bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search for items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchQuery && (
                    <div className="mt-4">
                      {isSearching ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                          ))}
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((item, index) => (
                            <div key={`search-${item.id}-${index}`} onClick={() => handleItemSelect(item.id, 'items')}>
                              {renderItemCard(item, index)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No items found</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Filters (Disabled for now) */}
              <Card className="mb-6 bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span className="text-sm">Tier</span>
                    <ChevronDown className="h-4 w-4" />
                    <Separator orientation="vertical" className="h-4 bg-slate-600" />
                    <span className="text-sm">Rarity</span>
                    <ChevronDown className="h-4 w-4" />
                    <Separator orientation="vertical" className="h-4 bg-slate-600" />
                    <span className="text-sm">Acquisition</span>
                    <ChevronDown className="h-4 w-4" />
                    <Separator orientation="vertical" className="h-4 bg-slate-600" />
                    <span className="text-sm">Bonus</span>
                    <ChevronDown className="h-4 w-4" />
                    <Separator orientation="vertical" className="h-4 bg-slate-600" />
                    <span className="text-sm">Perks</span>
                    <ChevronDown className="h-4 w-4" />
                    <Separator orientation="vertical" className="h-4 bg-slate-600" />
                    <span className="text-sm">Named</span>
                    <ChevronDown className="h-4 w-4" />
                    <Separator orientation="vertical" className="h-4 bg-slate-600" />
                    <span className="text-sm">Upgradeable</span>
                    <ChevronDown className="h-4 w-4" />
                    <Separator orientation="vertical" className="h-4 bg-slate-600" />
                    <span className="text-sm">Seasonal</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              {/* Items Grid */}
              {!searchQuery && (
                <div>
                  {isLoadingCategory ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full bg-slate-700" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryData.data.map((item, index) => (
                        <div key={`category-${item.id}-${index}`}>
                          {renderItemCard(item, index)}
                        </div>
                      ))}
                    </div>
                  )}

                  {renderPagination()}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Database;
