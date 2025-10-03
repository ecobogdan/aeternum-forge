import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Swords,
  Shield,
  Sparkles,
  Home,
  Shirt,
  Pickaxe,
  Apple,
  Package,
  PawPrint,
  Gem,
  Wand2,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { simpleNwdbService } from '@/services/simpleNwdbService';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  name: string;
  icon?: string;
  iconHiRes?: string;
  tier?: number;
  rarity?: number | string;
  gearScore?: number;
  gearScoreMax?: number;
  gearScoreMin?: number;
  perks?: Array<{
    id: string;
    name?: string;
    icon?: string;
  }>;
  itemType?: string;
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: any;
  subcategories?: Array<{
    id: string;
    name: string;
    icon: any;
  }>;
}

const rarityColors: Record<number | string, string> = {
  0: 'text-gray-400',
  1: 'text-green-400',
  2: 'text-blue-400',
  3: 'text-purple-400',
  4: 'text-orange-400',
  5: 'text-fuchsia-400',
  100: 'text-red-400',
  'Common': 'text-gray-400',
  'Uncommon': 'text-green-400',
  'Rare': 'text-blue-400',
  'Epic': 'text-purple-400',
  'Legendary': 'text-orange-400',
  'Artifact': 'text-red-400',
};

const rarityNames: Record<number, string> = {
  0: 'Common',
  1: 'Uncommon',
  2: 'Rare',
  3: 'Epic',
  4: 'Legendary',
  100: 'Artifact',
};

const tierToRoman: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

const categories: CategoryConfig[] = [
  {
    id: 'items',
    name: 'Items',
    icon: Package,
    subcategories: [
      { id: 'all', name: 'All Items', icon: Package },
      { id: 'cosmetics', name: 'Cosmetics', icon: Sparkles },
      { id: 'mounts', name: 'Mount Items', icon: PawPrint },
      { id: 'weapons', name: 'Weapons', icon: Swords },
      { id: 'armor', name: 'Armors', icon: Shield },
      { id: 'tools', name: 'Tools', icon: Pickaxe },
      { id: 'consumables', name: 'Consumables', icon: Apple },
      { id: 'resources', name: 'Resources', icon: Gem },
      { id: 'housing', name: 'Housing', icon: Home },
    ],
  },
];

const Database = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['items']));
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const itemsPerPage = 20;

  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await simpleNwdbService.getItems({
        limit: 1000,
        itemType: selectedCategory === 'all' ? undefined : selectedCategory,
      });
      
      const itemsData = response?.data || [];
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Item];
      let bVal: any = b[sortColumn as keyof Item];

      if (sortColumn === 'name') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }

      if (sortColumn === 'rarity') {
        aVal = typeof aVal === 'string' ? Object.keys(rarityNames).find(k => rarityNames[Number(k)] === aVal) || 0 : aVal || 0;
        bVal = typeof bVal === 'string' ? Object.keys(rarityNames).find(k => rarityNames[Number(k)] === bVal) || 0 : bVal || 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getImageUrl = (item: Item) => {
    const iconPath = item.iconHiRes || item.icon;
    if (!iconPath) return '';
    if (iconPath.startsWith('http')) return iconPath;
    return `https://cdn.nwdb.info${iconPath}`;
  };

  const getRarityDisplay = (rarity: number | string | undefined): string => {
    if (typeof rarity === 'number') {
      return rarityNames[rarity] || 'Common';
    }
    return rarity || 'Common';
  };

  const getGearScoreDisplay = (item: Item): string => {
    if (item.gearScoreMin && item.gearScoreMax) {
      return `${item.gearScoreMin}-${item.gearScoreMax}`;
    }
    if (item.gearScore) {
      return `${item.gearScore}`;
    }
    return '-';
  };

  return (
    <Layout>
      <div className="flex min-h-screen w-full bg-background">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border/50 bg-gradient-to-b from-card via-card to-card/80 backdrop-blur-sm overflow-y-auto shadow-xl">
          <div className="p-6 border-b border-border/50">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-gold-primary to-gold-secondary bg-clip-text text-transparent mb-1">
              Database
            </h1>
            <p className="text-xs text-muted-foreground">Explore Aeternum's items</p>
          </div>

          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Filter</h2>
              <Button
                variant="outline"
                className="w-full justify-start text-sm hover:bg-accent/50 hover:border-primary/50 transition-all"
                size="sm"
              >
                <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
                Added In Patch
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </div>

            <nav className="space-y-2">
              {categories.map(category => (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg transition-all group"
                  >
                    <ChevronRightIcon
                      className={cn(
                        'h-4 w-4 mr-2 transition-all text-muted-foreground group-hover:text-primary',
                        expandedCategories.has(category.id) && 'rotate-90 text-primary'
                      )}
                    />
                    <category.icon className="h-4 w-4 mr-2 text-primary" />
                    <span>{category.name}</span>
                  </button>

                  {expandedCategories.has(category.id) && category.subcategories && (
                    <div className="ml-8 mt-1 space-y-1 animate-accordion-down">
                      {category.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedCategory(sub.id);
                            setCurrentPage(1);
                          }}
                          className={cn(
                            'flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all',
                            selectedCategory === sub.id
                              ? 'bg-gradient-to-r from-primary/20 to-gold-secondary/10 border border-primary/30 text-primary font-medium shadow-sm'
                              : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <sub.icon className={cn(
                            "h-4 w-4 mr-2",
                            selectedCategory === sub.id ? "text-primary" : ""
                          )} />
                          <span>{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gradient-to-br from-background via-background to-background/95">
          {/* Header with Search */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {categories.find(c => c.subcategories?.find(s => s.id === selectedCategory))
                    ?.subcategories?.find(s => s.id === selectedCategory)?.name || 'All Items'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredItems.length} items found
                </p>
              </div>
            </div>
            
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for items, weapons, armor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 h-12 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-t-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_200px_120px_100px_120px] gap-4 px-6 py-4 bg-gradient-to-r from-secondary/50 to-secondary/30 border-b border-border/50 font-semibold text-sm uppercase tracking-wider">
              <div className="w-12"></div>
              <button
                onClick={() => handleSort('name')}
                className="flex items-center hover:text-primary transition-all group text-left"
              >
                Name
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              </button>
              <div className="text-center text-muted-foreground">Perks</div>
              <button
                onClick={() => handleSort('rarity')}
                className="flex items-center justify-center hover:text-primary transition-all group"
              >
                Rarity
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleSort('tier')}
                className="flex items-center justify-center hover:text-primary transition-all group"
              >
                Tier
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              </button>
              <div className="text-center text-muted-foreground">Gear Score</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border/30 bg-gradient-to-b from-card/30 to-card/50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_200px_120px_100px_120px] gap-4 px-6 py-4 items-center">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20 mx-auto" />
                    <Skeleton className="h-5 w-12 mx-auto" />
                    <Skeleton className="h-5 w-20 mx-auto" />
                  </div>
                ))
              ) : paginatedItems.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No items found</p>
                </div>
              ) : (
                paginatedItems.map((item) => {
                  const rarityColor = rarityColors[item.rarity ?? 0] || 'text-gray-400';
                  const rarityDisplay = getRarityDisplay(item.rarity);
                  const gearScore = getGearScoreDisplay(item);
                  const tierDisplay = item.tier ? tierToRoman[item.tier] || item.tier : '-';

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[auto_1fr_200px_120px_100px_120px] gap-4 px-6 py-4 items-center hover:bg-gradient-to-r hover:from-accent/40 hover:to-accent/20 transition-all cursor-pointer group border-l-2 border-transparent hover:border-primary/50"
                      onClick={() => navigate(`/item/${item.id}`)}
                    >
                      {/* Icon */}
                      <div className="relative w-12 h-12 bg-gradient-to-br from-secondary to-secondary/50 border border-border/50 rounded-lg flex items-center justify-center p-1 shadow-sm group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/10 transition-all">
                        {item.icon || item.iconHiRes ? (
                          <img
                            src={getImageUrl(item)}
                            alt={item.name}
                            className="w-full h-full object-contain drop-shadow-sm"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex items-center gap-2">
                        <span className={cn('font-semibold text-base group-hover:translate-x-1 transition-transform', rarityColor)}>
                          {item.name}
                        </span>
                      </div>

                      {/* Perks */}
                      <div className="flex items-center gap-1.5 justify-center">
                        {item.perks && item.perks.length > 0 ? (
                          item.perks.slice(0, 4).map((perk, idx) => (
                            <div
                              key={`${perk.id}-${idx}`}
                              className="relative w-9 h-9 bg-gradient-to-br from-background to-secondary/30 border border-border/50 rounded-md flex items-center justify-center hover:border-primary/40 hover:scale-110 transition-all shadow-sm"
                              title={perk.name}
                            >
                              {perk.icon ? (
                                <img
                                  src={perk.icon.startsWith('http') ? perk.icon : `https://cdn.nwdb.info${perk.icon}`}
                                  alt={perk.name}
                                  className="w-full h-full object-contain p-0.5"
                                />
                              ) : (
                                <Wand2 className="w-4 h-4 text-primary/70" />
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground/50 text-sm">-</span>
                        )}
                      </div>

                      {/* Rarity */}
                      <div className={cn('text-center font-semibold text-sm', rarityColor)}>
                        {rarityDisplay}
                      </div>

                      {/* Tier */}
                      <div className="text-center font-bold text-primary/90">
                        {tierDisplay}
                      </div>

                      {/* Gear Score */}
                      <div className="text-center text-muted-foreground font-medium">
                        {gearScore}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          {!loading && filteredItems.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hover:border-primary/50 transition-all disabled:opacity-30"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="hover:border-primary/50 transition-all disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-10 h-10 transition-all",
                        currentPage === pageNum 
                          ? "bg-gradient-to-r from-primary to-gold-secondary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30" 
                          : "hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="hover:border-primary/50 transition-all disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="hover:border-primary/50 transition-all disabled:opacity-30"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default Database;
