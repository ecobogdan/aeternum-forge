import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Shield, Swords, Heart, Zap, Target, Gem, Lock, Book, Star, MapPin, Hammer, Sword, Pickaxe, Fish, TreePine, Wheat, Skull, Trophy, Gift, ShoppingCart, Crown, Award, Tag } from 'lucide-react';
import { siteUrl } from '@/config/seo';
import { itemDataService, EnhancedItem, AcquisitionData, AttributesData } from '@/services/itemDataService';
import { simpleNwdbService } from '@/services/simpleNwdbService';

// Use the enhanced item interface from the service
type Item = EnhancedItem;

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

const ItemDetail = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [artifactObjectives, setArtifactObjectives] = useState<string[]>([]);

  // Fetch item details using the enhanced service
  const fetchItemDetails = useCallback(async (id: string): Promise<Item | null> => {
    try {
      // Skip if this is a perk ID
      if (id && id.startsWith('perkid_')) {
        console.log('Skipping perk ID in ItemDetail:', id);
        return null;
      }
      
      const responseData = await simpleNwdbService.getItemDetails(id);
      
      if (responseData.error) {
        console.error('Error fetching item details:', responseData.error);
        return null;
      }
      
      // The API returns data in a 'data' property
      const data = responseData.data || responseData;
      
      console.log('ItemDetail - Item data:', data);
      console.log('ItemDetail - Rarity value:', data.rarity, 'type:', typeof data.rarity);
      
      // Use the enhanced item data service to process the data
      const enhancedItem = itemDataService.buildItemInfo(data);
      
      // Check if this is an artifact and fetch objectives
      if (enhancedItem.rarity === 100 || enhancedItem.rarity === 'Artifact') {
        try {
          // For now, skip artifact objectives to avoid complexity
          // const objectives = await nwdbService.fetchArtifactObjectives(id);
          setArtifactObjectives([]);
        } catch (error) {
          console.error('Error fetching artifact objectives:', error);
        }
      }
      
      return enhancedItem;
    } catch (error) {
      console.error('Error fetching item details:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (itemId) {
      setIsLoading(true);
      fetchItemDetails(itemId).then((itemData) => {
        setItem(itemData);
        setIsLoading(false);
      });
    }
  }, [itemId, fetchItemDetails]);

  const getImageUrl = (item: Item) => {
    // Use the iconUrl from the enhanced item data
    if (item.iconUrl) {
      return item.iconUrl;
    }
    
    // Fallback to placeholder
    console.log('No icon URL available for item:', item.name);
    return '/placeholder.svg';
  };

  // Get rarity numeric value for color mapping
  const getRarityNumeric = (rarity: string | number): number => {
    console.log('ItemDetail - Getting rarity numeric for:', rarity, 'type:', typeof rarity);
    
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
    console.log('ItemDetail - Mapped rarity:', rarity, 'to numeric:', result);
    return result;
  };

  // Get rarity outline classes
  const getRarityOutlineClasses = (rarity: string | number): string => {
    const numericRarity = getRarityNumeric(rarity);
    const classes = rarityOutlineColors[numericRarity as keyof typeof rarityOutlineColors] || rarityOutlineColors[0];
    console.log('ItemDetail - Rarity outline classes for', rarity, ':', classes);
    return classes;
  };

  // Get rarity text color classes
  const getRarityTextClasses = (rarity: string | number): string => {
    const numericRarity = getRarityNumeric(rarity);
    const classes = rarityTextColors[numericRarity as keyof typeof rarityTextColors] || rarityTextColors[0];
    console.log('ItemDetail - Rarity text classes for', rarity, ':', classes);
    return classes;
  };

  // Helper function to render acquisition data
  const renderAcquisitionData = (acquisition: AcquisitionData) => {
    const sections = [];

    if (acquisition.craftedAt?.length) {
      sections.push(
        <div key="crafted" className="space-y-2">
          <div className="flex items-center space-x-2 text-blue-400">
            <Hammer className="h-4 w-4" />
            <span className="font-medium">Crafted At</span>
          </div>
          <div className="space-y-1 ml-6">
            {acquisition.craftedAt.map((craft, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-sm">
                  {craft.link ? (
                    <a href={craft.link} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">
                      {craft.name} <ExternalLink className="h-3 w-3 inline ml-1" />
                    </a>
                  ) : (
                    craft.name
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (acquisition.droppedBy?.length) {
      sections.push(
        <div key="droppedBy" className="space-y-2">
          <div className="flex items-center space-x-2 text-red-400">
            <Skull className="h-4 w-4" />
            <span className="font-medium">Dropped By</span>
          </div>
          <div className="space-y-1 ml-6">
            {acquisition.droppedBy.map((drop, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <span className="text-sm">
                  {drop.link ? (
                    <a href={drop.link} target="_blank" rel="noopener noreferrer" className="text-red-300 hover:text-red-200">
                      {drop.name} <ExternalLink className="h-3 w-3 inline ml-1" />
                    </a>
                  ) : (
                    drop.name
                  )}
                  {drop.level && <span className="text-gray-400 ml-2">(Level {drop.level})</span>}
                  {drop.area && <span className="text-gray-400 ml-2">in {drop.area}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (acquisition.gatheredFrom?.length) {
      sections.push(
        <div key="gathered" className="space-y-2">
          <div className="flex items-center space-x-2 text-green-400">
            <Pickaxe className="h-4 w-4" />
            <span className="font-medium">Gathered From</span>
          </div>
          <div className="space-y-1 ml-6">
            {acquisition.gatheredFrom.map((gather, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-sm">
                  {gather.link ? (
                    <a href={gather.link} target="_blank" rel="noopener noreferrer" className="text-green-300 hover:text-green-200">
                      {gather.name} <ExternalLink className="h-3 w-3 inline ml-1" />
                    </a>
                  ) : (
                    gather.name
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (acquisition.questReward?.length) {
      sections.push(
        <div key="quest" className="space-y-2">
          <div className="flex items-center space-x-2 text-purple-400">
            <Book className="h-4 w-4" />
            <span className="font-medium">Quest Reward</span>
          </div>
          <div className="space-y-1 ml-6">
            {acquisition.questReward.map((quest, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span className="text-sm">{quest}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (acquisition.seasonRewards?.length) {
      sections.push(
        <div key="season" className="space-y-2">
          <div className="flex items-center space-x-2 text-yellow-400">
            <Crown className="h-4 w-4" />
            <span className="font-medium">Season Rewards</span>
          </div>
          <div className="space-y-1 ml-6">
            {acquisition.seasonRewards.map((reward, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <span className="text-sm">
                  Season {reward.season} - Level {reward.level} ({reward.type})
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return sections;
  };

  // Helper function to render attributes data
  const renderAttributesData = (attributes: AttributesData) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-blue-400">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Attributes</span>
        </div>
        <div className="ml-6 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span className="text-sm">
              {attributes.points} points ({attributes.source === 'magnify' ? 'Magnify' : 'Stat Curve'})
              {attributes.base && ` - Base: ${attributes.base}`}
            </span>
          </div>
          {attributes.byAttr && Object.keys(attributes.byAttr).length > 0 && (
            <div className="ml-4 space-y-1">
              {Object.entries(attributes.byAttr).map(([attr, points]) => (
                <div key={attr} className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                  <span className="text-xs text-gray-300">
                    {attr}: {points} points
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout
        title="Loading Item - New World Database"
        description="Loading item details..."
        canonical={`${siteUrl}/new-world-database`}
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-6">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-8 w-64 mb-4" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout
        title="Item Not Found - New World Database"
        description="The requested item could not be found."
        canonical={`${siteUrl}/new-world-database`}
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8">
                  <h1 className="text-2xl font-bold text-white mb-4">Item Not Found</h1>
                  <p className="text-gray-400 mb-6">The requested item could not be found.</p>
                  <Link to="/new-world-database">
                    <Button>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Database
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${item.name} - New World Database`}
      description={item.description || `View details for ${item.name} in the New World database.`}
      canonical={`${siteUrl}/new-world-database/item/${item.id}`}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link to="/new-world-database">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Database
              </Button>
            </Link>
          </div>

          {/* Item Details */}
          <div className="max-w-4xl mx-auto">
            <Card className={`bg-slate-800/50 border-slate-700 ${getRarityOutlineClasses(item.rarity)}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <img 
                      src={getImageUrl(item)} 
                      alt={item.name}
                      className="w-20 h-20 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className={`text-3xl mb-1 ${getRarityTextClasses(item.rarity)}`}>{item.name}</CardTitle>
                    <div className="text-purple-400 font-medium mb-1">{item.rarity}</div>
                    {item.type && (
                      <div className="text-white text-sm mb-4">{item.type}</div>
                    )}
                    <div className="text-white text-sm">Tier {item.tier}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white">{item.gearScore}</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Flavor Text */}
                {item.description && (
                  <div className="border-t border-slate-600 pt-4">
                    <p className="text-orange-400 italic text-sm">{item.description}</p>
                  </div>
                )}

                {/* Artifact Objectives */}
                {artifactObjectives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <span>Artifact Objectives</span>
                    </h3>
                    <div className="space-y-2">
                      {artifactObjectives.map((objective, index) => (
                        <div key={index} className="flex items-start space-x-2 text-yellow-300">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                          <span className="text-sm">{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attributes Section */}
                {item.attributes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Attributes</h3>
                    {renderAttributesData(item.attributes)}
                  </div>
                )}

                {/* Perks Section */}
                {item.perks && item.perks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Gem className="h-5 w-5 text-purple-400" />
                      <span>Perks</span>
                    </h3>
                    <div className="space-y-3">
                      {item.perks.map((perk, index) => (
                        <div key={index} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {perk.link ? (
                                  <Link 
                                    to={perk.link}
                                    className="font-medium text-purple-300 hover:text-purple-200 transition-colors"
                                  >
                                    {perk.name || 'Unknown Perk'}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-purple-300">
                                    {perk.name || 'Unknown Perk'}
                                  </span>
                                )}
                              </div>
                              {perk.description && (
                                <p className="text-sm text-gray-300">{perk.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acquisition Data */}
                {item.acquisition && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-green-400" />
                      <span>Acquisition</span>
                    </h3>
                    <div className="space-y-4">
                      {renderAcquisitionData(item.acquisition)}
                    </div>
                  </div>
                )}

                {/* Item Classes */}
                {item.classes && item.classes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-blue-400" />
                      <span>Item Classes</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.classes.map((cls, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-900/50 text-blue-300 border-blue-700">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ItemDetail;
