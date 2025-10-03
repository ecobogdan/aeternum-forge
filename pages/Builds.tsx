import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BuildsSidebar from '@/components/BuildsSidebar';
import { siteUrl } from '@/config/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Copy, Youtube, Star, ChevronDown, ChevronLeft, Check, Menu, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import buildsData from '@/data/builds.json';

const ALL_SUBCATEGORY_KEY = '__all__';

interface Build {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  link: string;
  embed: 'iframe' | 'link';
  iframeHeight: number;
  tags: string[];
  notes: string;
  youtube: string;
  featured: boolean;
  updatedAt: string;
}

const API_ENDPOINT = '/builds_config.php';
const normalizeBuild = (build: Build): Build => ({
  ...build,
  category: build.category ?? '',
  subCategory: build.subCategory ?? '',
  tags: Array.isArray(build.tags) ? build.tags : [],
});

const Builds = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBuild, setSelectedBuild] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [categorySubSelections, setCategorySubSelections] = useState<Record<string, string>>({});
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [categoryView, setCategoryView] = useState<'subcategories' | 'builds'>('builds');
  const [builds, setBuilds] = useState<Build[]>(() =>
    (buildsData as Build[]).map(normalizeBuild)
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();

  // Set default sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false); // Hidden by default on mobile
    } else {
      setSidebarOpen(true); // Visible by default on desktop
    }
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchBuilds = async () => {
      setIsLoadingBuilds(true);
      try {
        const response = await fetch(API_ENDPOINT, { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Failed to fetch builds');
        }

        const payload = (await response.json()) as { builds?: Build[]; categories?: string[] };
        if (!Array.isArray(payload.builds)) {
          throw new Error('Invalid builds payload');
        }

        if (!cancelled) {
          setBuilds(payload.builds.map(normalizeBuild));
          if (Array.isArray(payload.categories)) {
            setCategories(payload.categories);
          }
          setLoadError(null);
        }
      } catch (error) {
        console.error('Failed to load builds', error);
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Unable to fetch builds.');
          toast({
            title: 'Failed to load latest builds',
            description: 'Showing bundled data. Try refreshing the page.',
            variant: 'destructive',
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBuilds(false);
        }
      }
    };

    fetchBuilds();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizeCategory = (category?: string) =>
    category && category.trim().length > 0 ? category : 'Uncategorized';


  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    builds.forEach(build => build.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [builds]);

  const buildsMatchingTags = useMemo(() => {
    if (selectedTags.length === 0) return builds;
    return builds.filter(build =>
      selectedTags.every(tag => build.tags.includes(tag))
    );
  }, [builds, selectedTags]);

const categoryData = useMemo(() => {
  const grouped = new Map<string, Build[]>();

  buildsMatchingTags.forEach((build) => {
    const key = normalizeCategory(build.category);
    const existing = grouped.get(key);

    if (existing) {
      existing.push(build);
    } else {
      grouped.set(key, [build]);
    }
  });

  // Use configured categories order, but filter to only include categories that have builds
  const availableCategories = categories.filter(cat => grouped.has(cat));

  return { grouped, categories: availableCategories };
}, [buildsMatchingTags, categories]);

const availableCategories = categoryData.categories;
const groupedBuilds = categoryData.grouped;

const getSubCategories = useCallback(
  (category: string) => {
    const buildsInCategory = groupedBuilds.get(category) ?? [];
    const unique = new Set<string>();
    buildsInCategory.forEach((build) => {
      const key = (build.subCategory ?? '').trim();
      if (key) {
        unique.add(key);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  },
  [groupedBuilds]
);

useEffect(() => {
  if (availableCategories.length === 0) {
    setActiveCategory('');
    setOpenCategory(null);
    return;
  }

  if (!activeCategory || !availableCategories.includes(activeCategory)) {
    setActiveCategory(availableCategories[0]);
  }
}, [availableCategories, activeCategory]);

const currentBuild = useMemo(() => {
  if (!selectedBuild) return null;
  return builds.find((build) => build.id === selectedBuild) || null;
}, [selectedBuild, builds]);

const currentBuildCategory = currentBuild ? normalizeCategory(currentBuild.category) : '';

useEffect(() => {
  if (!selectedBuild) return;
  const build = builds.find((item) => item.id === selectedBuild);
  if (!build) return;

  const normalizedCategory = normalizeCategory(build.category);
  const normalizedSubCategory = (build.subCategory ?? '').trim() || ALL_SUBCATEGORY_KEY;

  setActiveCategory(normalizedCategory);
  setCategorySubSelections((prev) => {
    if (prev[normalizedCategory] === normalizedSubCategory) {
      return prev;
    }
    return { ...prev, [normalizedCategory]: normalizedSubCategory };
  });
  setCategoryView('builds');
}, [selectedBuild, builds]);

useEffect(() => {
  if (!activeCategory) return;
  const subCategories = getSubCategories(activeCategory);
  const currentSelection = categorySubSelections[activeCategory];

  if (subCategories.length === 0) {
    if (currentSelection) {
      setCategorySubSelections((prev) => {
        const next = { ...prev };
        delete next[activeCategory];
        return next;
      });
    }
    setCategoryView('builds');
    return;
  }

  if (currentSelection && currentSelection !== ALL_SUBCATEGORY_KEY && !subCategories.includes(currentSelection)) {
    setCategorySubSelections((prev) => {
      const next = { ...prev };
      delete next[activeCategory];
      return next;
    });
    setCategoryView('subcategories');
  } else if (!currentSelection) {
    setCategoryView('subcategories');
  }
}, [activeCategory, categorySubSelections, getSubCategories]);

useEffect(() => {
  if (isLoadingBuilds) {
    return;
  }

  if (buildsMatchingTags.length === 0) {
    if (selectedBuild) {
      setSelectedBuild('');
      setSearchParams({});
    }
    return;
  }

  if (selectedBuild && !buildsMatchingTags.some((build) => build.id === selectedBuild)) {
    setSelectedBuild('');
    setSearchParams({});
  }
}, [buildsMatchingTags, selectedBuild, setSearchParams, isLoadingBuilds]);

const filteredBuildsByCategory = useCallback(
  (category: string) => {
    const buildsInCategory = groupedBuilds.get(category) ?? [];
    const selectedSub = categorySubSelections[category];
    if (!selectedSub || selectedSub === ALL_SUBCATEGORY_KEY) {
      return buildsInCategory;
    }
    return buildsInCategory.filter(
      (build) => (build.subCategory ?? '').trim() === selectedSub
    );
  },
  [groupedBuilds, categorySubSelections]
);

const handleCategoryOpenChange = useCallback(
  (category: string, open: boolean) => {
    if (open) {
      setActiveCategory(category);
      const subCategories = getSubCategories(category);
      const selectedSub = categorySubSelections[category];
      const hasSelection =
        selectedSub && (selectedSub === ALL_SUBCATEGORY_KEY || subCategories.includes(selectedSub));
      setCategoryView(subCategories.length > 0 && !hasSelection ? 'subcategories' : 'builds');
      setOpenCategory(category);
    } else {
      setOpenCategory((prev) => (prev === category ? null : prev));
    }
  },
  [categorySubSelections, getSubCategories]
);

const handleSubCategorySelect = useCallback(
  (category: string, subCategory: string) => {
    setCategorySubSelections((prev) => ({ ...prev, [category]: subCategory }));
    setCategoryView('builds');

    const availableBuilds =
      subCategory === ALL_SUBCATEGORY_KEY
        ? groupedBuilds.get(category) ?? []
        : (groupedBuilds.get(category) ?? []).filter(
            (build) => (build.subCategory ?? '').trim() === subCategory
          );

    if (selectedBuild && !availableBuilds.some((build) => build.id === selectedBuild)) {
      setSelectedBuild('');
      setSearchParams({});
    }
  },
  [groupedBuilds, selectedBuild, setSearchParams]
);

const handleBuildSelect = useCallback(
  (build: Build) => {
    const normalizedCategory = normalizeCategory(build.category);
    const normalizedSubCategory = (build.subCategory ?? '').trim() || ALL_SUBCATEGORY_KEY;
    setCategorySubSelections((prev) => ({ ...prev, [normalizedCategory]: normalizedSubCategory }));
    setSelectedBuild(build.id);
    setSearchParams({ build: build.id });
    setActiveCategory(normalizedCategory);
    setOpenCategory(null);
    setCategoryView('builds');
  },
  [setSearchParams]
);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const iframeEl = iframeRef.current;
      if (!iframeEl || !iframeEl.contentWindow || event.source !== iframeEl.contentWindow) {
        return;
      }

      let payload: unknown = event.data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      if (!payload || typeof payload !== 'object') {
        return;
      }

      const { type, height } = payload as { type?: string; height?: number | string };
      if (type !== 'nw-buddy-resize') {
        return;
      }

      const numericHeight =
        typeof height === 'number'
          ? height
          : typeof height === 'string'
            ? Number.parseFloat(height)
            : Number.NaN;

      if (Number.isFinite(numericHeight) && numericHeight > 0) {
        if (iframeRef.current && containerRef.current) {
          // Set the iframe height to exactly match the content height
          const exactHeight = Math.ceil(numericHeight);
          iframeRef.current.style.height = `${exactHeight}px`;
          
          // Update the scaling container height to match the iframe
          const scalingContainer = iframeRef.current.parentElement;
          if (scalingContainer) {
            scalingContainer.style.height = `${exactHeight}px`;
          }
          
          // Update the outer container height to match the scaled content (100% of original)
          const scaledHeight = Math.ceil(exactHeight * 1.0);
          containerRef.current.style.height = `${scaledHeight}px`;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);



  // Handle deep linking via query param
  useEffect(() => {
    if (isLoadingBuilds || builds.length === 0) {
      return;
    }

    const buildId = searchParams.get('build');

    if (!buildId) {
      return;
    }

    if (buildId === selectedBuild) {
      return;
    }

    const foundBuild = builds.find((build) => build.id === buildId);
    if (foundBuild) {
      setSelectedBuild(buildId);
    } else {
      setSelectedBuild('');
      setSearchParams({});
    }
  }, [searchParams, builds, selectedBuild, setSearchParams, isLoadingBuilds]);
  const copyBuildLink = () => {
    const url = `${window.location.origin}/new-world-builds?build=${selectedBuild}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Build link copied to clipboard",
    });
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const formatNotes = (notes: string) => {
    // Simple markdown parsing for **bold** text and line breaks
    return notes
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  

  return (
    <Layout 
      title="S9 Builds - New World Builds"
      description="Discover the best Season 9 builds for New World Aeternum. Optimized for PvP, PvE, and all playstyles."
      canonical="/new-world-builds"
      keywords={["New World builds", "New World Season 9", "Best New World builds", "LLangi builds"]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Season 9 New World Builds",
        description: "Curated Season 9 builds for PvE and PvP with filters, notes, and video guides.",
        url: `${siteUrl}/builds`,
        inLanguage: "en",
        isPartOf: siteUrl,
        about: "New World builds"
      }}
    >

          {/* Twitch Badge */}
      <div className="flex justify-center">
        <a
          href="https://www.twitch.tv/llangi"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-purple-600/90 text-white text-sm font-medium shadow-lg hover:bg-purple-700 transition text-center"
        >
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4 2L2 6v14h6v2h4l2-2h4l4-4V2H4zm16 12l-2 2h-4l-2 2H8v-2H4V4h16v10z" />
          </svg>
          <span className="leading-none">Question? Watch me Live on Twitch!</span>
        </a>
      </div>

      <div className="w-full max-w-none px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
            Season 9 Meta Builds
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover optimized builds for every playstyle. Each build includes detailed explanations, 
            gear recommendations, and gameplay strategies.
          </p>
        </div>

        

        {/* Build Content Area with Sidebar */}
        <div className="flex gap-4 lg:gap-6 max-w-[140rem] mx-auto">
          {/* Sidebar */}
          <BuildsSidebar
            builds={buildsMatchingTags}
            categories={availableCategories}
            selectedBuild={selectedBuild}
            onBuildSelect={handleBuildSelect}
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
          

          {/* Floating Toggle Button - Only show when sidebar is closed */}
          <div
            className={cn(
              "fixed left-2 md:left-4 top-32 z-30 transition-all duration-300 ease-in-out",
              sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/20 backdrop-blur-sm border border-border/40 hover:bg-background/40 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Show builds navigation"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-[4] space-y-4 lg:space-y-6 min-w-0">
            {/* Header with Toggle Button */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold">Build Selector & Filters</h2>
              </div>
            </div>

            

            {/* Build Selector & Filters */}
            <div className="space-y-6">
        {loadError && (
          <Card className="border-destructive/40 bg-destructive/10">
            <CardContent className="py-3">
              <p className="text-sm text-destructive">
                Unable to fetch the latest builds. Showing bundled data instead.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-start gap-3">
          {availableCategories.map((category) => {
            const buildsInCategory = groupedBuilds.get(category) ?? [];
            if (buildsInCategory.length === 0) {
              return (
                <Button
                  key={category}
                  variant="outline"
                  className="min-w-[120px] justify-between"
                  disabled
                >
                  <span>{category}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              );
            }

            const subCategories = getSubCategories(category);
            const currentSelection = categorySubSelections[category] ?? '';
            const filteredBuilds = filteredBuildsByCategory(category);
            const isOpen = openCategory === category;
            const showSubcategories =
              isOpen && subCategories.length > 0 && categoryView === 'subcategories';

            return (
              <Popover
                key={category}
                open={isOpen}
                onOpenChange={(open) => handleCategoryOpenChange(category, open)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant={openCategory ? (openCategory === category ? 'default' : 'outline') : currentBuildCategory === category ? 'default' : 'outline'}
                    className="min-w-[120px] justify-between"
                  >
                    <span>{category}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0">
                  <Command>
                    {showSubcategories ? (
                      <CommandList>
                        <CommandGroup heading="Subcategories">
                          {subCategories.map((subCategory) => (
                            <CommandItem
                              key={subCategory}
                              value={subCategory}
                              onSelect={() => handleSubCategorySelect(category, subCategory)}
                            >
                              {subCategory} - {category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    ) : (
                      <>
                        {subCategories.length > 0 && (
                          <div className="flex items-center justify-between px-3 py-2 border-b">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2"
                              onClick={() => setCategoryView('subcategories')}
                            >
                              <ChevronLeft className="mr-1 h-4 w-4" />
                              Subcategories
                            </Button>
                            <span className="text-xs text-muted-foreground uppercase">
                              {currentSelection && currentSelection !== ALL_SUBCATEGORY_KEY
                                ? currentSelection
                                : 'All builds'}
                            </span>
                          </div>
                        )}
                        <CommandList>
                          {filteredBuilds.length === 0 ? (
                            <CommandEmpty>No builds available.</CommandEmpty>
                          ) : (
                            <CommandGroup heading="Builds">
                              {filteredBuilds.map((build) => (
                                <CommandItem
                                  key={build.id}
                                  value={build.id}
                                  onSelect={() => handleBuildSelect(build)}
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">{build.title}</span>
                                    {build.subCategory && (
                                      <span className="text-xs text-muted-foreground">
                                        {build.subCategory}
                                      </span>
                                    )}
                                  </div>
                                  {build.featured && (
                                    <Star className="ml-auto h-4 w-4 text-gold-primary" />
                                  )}
                                  {selectedBuild === build.id && (
                                    <Check className="ml-2 h-4 w-4 text-primary" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            );
          })}

          {currentBuild && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyBuildLink}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </div>


{/* Build Display */}
        {currentBuild && (
          <div className="space-y-6">
            {/* Build Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-2xl">{currentBuild.title}</CardTitle>
                      {currentBuild.featured && (
                        <Badge className="bg-gold-primary text-primary-foreground">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base">
                      Last updated: {currentBuild.updatedAt
                        ? new Date(currentBuild.updatedAt).toLocaleDateString()
                        : 'Not specified'}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {currentBuild.category && (
                        <Badge variant="secondary">{currentBuild.category}</Badge>
                      )}
                      {currentBuild.subCategory && (
                        <Badge variant="outline">{currentBuild.subCategory}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Build Embed */}
            <Card>
              <CardContent className="p-6 overflow-visible">
                {currentBuild.embed === 'iframe' ? (
                  <div className="w-full overflow-hidden" ref={containerRef}>
                    <div className="transform scale-[1.0] origin-top-left" style={{ width: '100%' }}>
                      <iframe
                        ref={iframeRef}
                        src={currentBuild.link}
                        width="100%"
                        height="100%"
                        className="border rounded-lg w-full"
                        style={{ height: '800px' }}
                        loading="lazy"
                        title={`${currentBuild.title} Build Planner`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <h3 className="text-xl font-semibold">External Build Planner</h3>
                    <p className="text-muted-foreground">
                      This build is hosted on an external planner. Click the button below to view it.
                    </p>
                    <Button asChild size="lg">
                      <a href={currentBuild.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Open in New Tab
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Build Notes */}
            {currentBuild.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Build Guide & Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatNotes(currentBuild.notes) }}
                  />
                </CardContent>
              </Card>
            )}

            {/* YouTube Video */}
            {currentBuild.youtube && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Youtube className="h-5 w-5 mr-2 text-red-500" />
                    Video Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden" style={{ aspectRatio: '16/9', height: 'auto' }}>
                    <div className="transform scale-[1.0] origin-top-left" style={{ width: '100%', height: '100%' }}>
                      <iframe
                        src={currentBuild.youtube.replace('watch?v=', 'embed/')}
                        width="100%"
                        height="100%"
                        className="rounded-lg"
                        loading="lazy"
                        title={`${currentBuild.title} Video Guide`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* No builds message */}
        {buildsMatchingTags.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">
                No builds found matching your filters.
              </p>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Related Links */}
        <Card className="bg-gradient-mystical">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Need More Help?</h3>
            <p className="text-foreground/80">
              Check out our comprehensive guides and optimization tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary">
                <Link to="/guides/new-world-new-player-guide">
                  New Player Guide
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10">
                <Link to="/tools/new-world-armor-weight-calculator">
                  Armor Calculator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Builds;

























