import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface BuildsSidebarProps {
  builds: Build[];
  categories: string[];
  selectedBuild: string;
  onBuildSelect: (build: Build) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const BuildsSidebar: React.FC<BuildsSidebarProps> = ({
  builds,
  categories,
  selectedBuild,
  onBuildSelect,
  isOpen,
  onToggle,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Group builds by category and subcategory
  const groupedBuilds = React.useMemo(() => {
    const grouped = new Map<string, Map<string, Build[]>>();
    
    builds.forEach((build) => {
      const category = build.category || 'Uncategorized';
      const subCategory = build.subCategory || 'General';
      
      if (!grouped.has(category)) {
        grouped.set(category, new Map());
      }
      
      const categoryMap = grouped.get(category)!;
      if (!categoryMap.has(subCategory)) {
        categoryMap.set(subCategory, []);
      }
      
      categoryMap.get(subCategory)!.push(build);
    });
    
    return grouped;
  }, [builds]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategory(prev => prev === category ? null : category);
  }, []);

  const toggleSubCategory = useCallback((subCategoryKey: string) => {
    setExpandedSubCategory(prev => prev === subCategoryKey ? null : subCategoryKey);
  }, []);

  // Auto-expand categories that contain the selected build
  React.useEffect(() => {
    if (selectedBuild) {
      const build = builds.find(b => b.id === selectedBuild);
      if (build) {
        const category = build.category || 'Uncategorized';
        setExpandedCategory(category);
        
        if (build.subCategory) {
          const subCategoryKey = `${category}-${build.subCategory}`;
          setExpandedSubCategory(subCategoryKey);
        }
      }
    }
  }, [selectedBuild, builds]);

  const sidebarContent = (
    <Card className="sticky top-24 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Builds Navigation</CardTitle>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.map((category) => {
          const categoryBuilds = groupedBuilds.get(category);
          if (!categoryBuilds || categoryBuilds.size === 0) return null;

          const isExpanded = expandedCategory === category;
          const totalBuilds = Array.from(categoryBuilds.values()).flat().length;

          return (
            <Collapsible
              key={category}
              open={isExpanded}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {totalBuilds}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-4">
                {Array.from(categoryBuilds.entries()).map(([subCategory, builds]) => {
                  const subCategoryKey = `${category}-${subCategory}`;
                  const isSubExpanded = expandedSubCategory === subCategoryKey;
                  const hasSubCategories = subCategory !== 'General' && subCategory !== '';

                  if (!hasSubCategories) {
                    // Direct builds without subcategories
                    return (
                      <div key={subCategory} className="space-y-1">
                        {builds.map((build) => (
                          <Button
                            key={build.id}
                            variant={selectedBuild === build.id ? "default" : "ghost"}
                            className="w-full justify-start text-left p-2 h-auto"
                            onClick={() => onBuildSelect(build)}
                          >
                            <div className="flex items-center space-x-2 w-full">
                              <span className="text-sm truncate">{build.title}</span>
                              {build.featured && (
                                <Star className="h-3 w-3 text-gold-primary flex-shrink-0" />
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <Collapsible
                      key={subCategory}
                      open={isSubExpanded}
                      onOpenChange={() => toggleSubCategory(subCategoryKey)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-2 h-auto"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{subCategory}</span>
                            <Badge variant="outline" className="text-xs">
                              {builds.length}
                            </Badge>
                          </div>
                          {isSubExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-4">
                        {builds.map((build) => (
                          <Button
                            key={build.id}
                            variant={selectedBuild === build.id ? "default" : "ghost"}
                            className="w-full justify-start text-left p-2 h-auto"
                            onClick={() => onBuildSelect(build)}
                          >
                            <div className="flex items-center space-x-2 w-full">
                              <span className="text-sm truncate">{build.title}</span>
                              {build.featured && (
                                <Star className="h-3 w-3 text-gold-primary flex-shrink-0" />
                              )}
                            </div>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
        
        {/* Mobile sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Builds Navigation</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto flex-1">
              {categories.map((category) => {
                const categoryBuilds = groupedBuilds.get(category);
                if (!categoryBuilds || categoryBuilds.size === 0) return null;

                const isExpanded = expandedCategory === category;
                const totalBuilds = Array.from(categoryBuilds.values()).flat().length;

                return (
                  <Collapsible
                    key={category}
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-2 h-auto"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{category}</span>
                          <Badge variant="secondary" className="text-xs">
                            {totalBuilds}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-4">
                      {Array.from(categoryBuilds.entries()).map(([subCategory, builds]) => {
                        const subCategoryKey = `${category}-${subCategory}`;
                        const isSubExpanded = expandedSubCategory === subCategoryKey;
                        const hasSubCategories = subCategory !== 'General' && subCategory !== '';

                        if (!hasSubCategories) {
                          // Direct builds without subcategories
                          return (
                            <div key={subCategory} className="space-y-1">
                              {builds.map((build) => (
                                <Button
                                  key={build.id}
                                  variant={selectedBuild === build.id ? "default" : "ghost"}
                                  className="w-full justify-start text-left p-2 h-auto"
                                  onClick={() => onBuildSelect(build)}
                                >
                                  <div className="flex items-center space-x-2 w-full">
                                    <span className="text-sm truncate">{build.title}</span>
                                    {build.featured && (
                                      <Star className="h-3 w-3 text-gold-primary flex-shrink-0" />
                                    )}
                                  </div>
                                </Button>
                              ))}
                            </div>
                          );
                        }

                        return (
                          <Collapsible
                            key={subCategory}
                            open={isSubExpanded}
                            onOpenChange={() => toggleSubCategory(subCategoryKey)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-between p-2 h-auto"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">{subCategory}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {builds.length}
                                  </Badge>
                                </div>
                                {isSubExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-1 ml-4">
                              {builds.map((build) => (
                                <Button
                                  key={build.id}
                                  variant={selectedBuild === build.id ? "default" : "ghost"}
                                  className="w-full justify-start text-left p-2 h-auto"
                                  onClick={() => onBuildSelect(build)}
                                >
                                  <div className="flex items-center space-x-2 w-full">
                                    <span className="text-sm truncate">{build.title}</span>
                                    {build.featured && (
                                      <Star className="h-3 w-3 text-gold-primary flex-shrink-0" />
                                    )}
                                  </div>
                                </Button>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "w-56 transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {sidebarContent}
    </div>
  );
};

export default BuildsSidebar;
