import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Build {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  items: Record<string, any>;
  attributes: {
    strength: number;
    dexterity: number;
    intelligence: number;
    focus: number;
    constitution: number;
  };
  abilities: any[];
  created_at: string;
  updated_at: string;
}

const RARITY_COLORS = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-orange-500',
  artifact: 'bg-red-500',
};

export function BuildsDisplay() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchBuilds();
  }, []);

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-builds', {
        body: { action: 'list' },
      });

      if (error) throw error;
      
      setBuilds(data.builds || []);
    } catch (error) {
      console.error('Error fetching builds:', error);
      toast.error('Failed to load builds');
    } finally {
      setLoading(false);
    }
  };

  const filteredBuilds = builds.filter(build => {
    const matchesSearch = build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         build.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || build.category === categoryFilter;
    const matchesSubcategory = subcategoryFilter === 'all' || build.subcategory === subcategoryFilter;
    
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const categories = [...new Set(builds.map(build => build.category))].filter(Boolean);
  const subcategories = [...new Set(builds.map(build => build.subcategory))].filter(Boolean);

  const renderItemSlot = (item: any, slotName: string) => {
    if (!item) return null;

    const rarityColor = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || 'bg-gray-500';
    
    return (
      <div key={slotName} className="flex items-center gap-2 p-2 bg-muted rounded">
        <div className={`w-8 h-8 rounded ${rarityColor} flex items-center justify-center text-white text-xs font-bold`}>
          {item.icon ? (
            <img 
              src={`https://cdn.nwdb.info/${item.icon}`} 
              alt={item.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            item.tier || '?'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{item.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{item.rarity}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading builds...</div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Community Builds - New World Aeternum</title>
        <meta name="description" content="Browse and discover community-created builds for New World Aeternum" />
      </Helmet>
      
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Community Builds</h1>
            <p className="text-muted-foreground">
              Discover powerful build configurations created by the community
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search builds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Builds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuilds.map((build) => {
              const totalAttributes = Object.values(build.attributes).reduce((sum, value) => sum + value, 0);
              const mainItems = ['helmet', 'chest', 'weapon1', 'weapon2'];
              
              return (
                <Card key={build.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {build.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {build.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary">{build.category}</Badge>
                      {build.subcategory && (
                        <Badge variant="outline">{build.subcategory}</Badge>
                      )}
                      {build.abilities && (
                        <Badge variant="outline">{build.abilities.length} abilities</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Key Items Preview */}
                    {Object.keys(build.items).length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Key Equipment</h4>
                        <div className="space-y-1">
                          {mainItems.map(slot => 
                            build.items[slot] ? renderItemSlot(build.items[slot], slot) : null
                          ).filter(Boolean)}
                        </div>
                      </div>
                    )}
                    
                    {/* Attributes Summary */}
                    {totalAttributes > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Attributes ({totalAttributes} points)</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(build.attributes)
                            .filter(([, value]) => value > 0)
                            .map(([attr, value]) => (
                              <div key={attr} className="flex justify-between">
                                <span className="capitalize">{attr}:</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Updated Date */}
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Updated: {new Date(build.updated_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredBuilds.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {builds.length === 0 ? 'No builds available yet.' : 'No builds match your search criteria.'}
              </div>
              {searchTerm || categoryFilter !== 'all' || subcategoryFilter !== 'all' ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setSubcategoryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}