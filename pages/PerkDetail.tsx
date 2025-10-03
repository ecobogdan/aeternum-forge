import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Shield, Swords, Heart, Zap, Target, Gem, Lock, Book, Star, MapPin, Hammer, Sword, Pickaxe, Fish, TreePine, Wheat, Skull, Trophy, Gift, ShoppingCart, Crown, Award, Tag, Info } from 'lucide-react';
import { siteUrl } from '@/config/seo';
import { simpleNwdbService } from '@/services/simpleNwdbService';
import { itemDataService } from '@/services/itemDataService';

interface Perk {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rarity?: string;
  type?: string;
  itemType?: string;
  tier?: number;
  ScalingPerGearScore?: string;
  condition?: string;
  perkItemClassInclude?: string[];
  ExclusiveLabels?: string[];
  craftMod?: string;
}

const rarityColors = {
  'Common': 'bg-gray-500',
  'Uncommon': 'bg-green-500',
  'Rare': 'bg-blue-500',
  'Epic': 'bg-purple-500',
  'Legendary': 'bg-orange-500',
  'Artifact': 'bg-red-500',
};

const rarityTextColors = {
  'Common': 'text-gray-400',
  'Uncommon': 'text-green-400',
  'Rare': 'text-blue-400',
  'Epic': 'text-purple-400',
  'Legendary': 'text-orange-400',
  'Artifact': 'text-red-400',
};

export default function PerkDetail() {
  const { perkId } = useParams<{ perkId: string }>();
  const navigate = useNavigate();
  const [perk, setPerk] = useState<Perk | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch perk details
  const fetchPerkDetails = useCallback(async (id: string): Promise<Perk | null> => {
    try {
      // Skip if this is not a perk ID
      if (!id || !id.startsWith('perkid_')) {
        console.log('Not a perk ID:', id);
        return null;
      }
      
      const responseData = await simpleNwdbService.getPerkDetails(id);
      
      if (responseData.error) {
        console.error('Error fetching perk details:', responseData.error);
        return null;
      }

      const data = responseData.data || responseData;
      
      // Debug: Log the data structure to understand the format
      console.log('Perk data structure:', data);
      console.log('perkItemClassInclude:', data.perkItemClassInclude, 'type:', typeof data.perkItemClassInclude);
      console.log('ExclusiveLabels:', data.ExclusiveLabels, 'type:', typeof data.ExclusiveLabels);
      console.log('itemsWithPerk:', data.itemsWithPerk, 'type:', typeof data.itemsWithPerk);
      console.log('itemsWithPerk[0]:', data.itemsWithPerk?.[0], 'type:', typeof data.itemsWithPerk?.[0]);
      
      // Helper function to safely convert data to array
      const safeArray = (value: any): string[] => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
          } catch {
            return [value];
          }
        }
        return [];
      };
      
      // Helper function to safely extract craft mod name
      const safeCraftMod = (value: any): string | undefined => {
        if (typeof value === 'string') return value;
        if (value && typeof value === 'object') {
          return value.name || value.id || String(value);
        }
        return undefined;
      };
      
      // Calculate perk multiplier for a standard gear score (700 for max level)
      const standardGS = 700;
      const perkMultiplier = itemDataService.perkMultiplier(
        standardGS,
        data.ScalingPerGearScore,
        data.id,
        data.description
      );
      
      // Apply the same description evaluation as in item pages
      const processedDescription = itemDataService.evalPerkDescription(
        data.description,
        perkMultiplier
      );
      
      return {
        id: data.id || id,
        name: data.name || 'Unknown Perk',
        description: processedDescription || 'No description available',
        icon: data.icon || data.iconHiRes,
        rarity: data.rarity || 'Common',
        type: data.type || 'perk',
        itemType: data.itemType || 'Unknown',
        tier: data.tier || 0,
        ScalingPerGearScore: data.ScalingPerGearScore,
        condition: data.condition,
        perkItemClassInclude: safeArray(data.perkItemClassInclude),
        ExclusiveLabels: safeArray(data.ExclusiveLabels),
        craftMod: safeCraftMod(data.itemsWithPerk?.[0]),
      };
    } catch (error) {
      console.error('Error fetching perk details:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (perkId) {
      setIsLoading(true);
      fetchPerkDetails(perkId).then((perkData) => {
        setPerk(perkData);
        setIsLoading(false);
      });
    }
  }, [perkId, fetchPerkDetails]);

  const getImageUrl = (perk: Perk) => {
    if (perk.icon) {
      return perk.icon.startsWith('http') ? perk.icon : `https://cdn.nwdb.info/db/images/live/v56/${perk.icon}.png`;
    }
    return '/placeholder.svg';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <Card className="rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur">
              <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                  <Skeleton className="w-24 h-24 rounded-lg" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!perk) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <Link
                to="/new-world-database"
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Database</span>
              </Link>
            </div>
            <Card className="rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur">
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Perk Not Found</h1>
                <p className="text-slate-400 mb-6">
                  The perk you're looking for doesn't exist or couldn't be loaded.
                </p>
                <Link
                  to="/new-world-database"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Return to Database
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/new-world-database"
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Database</span>
            </Link>
          </div>

          {/* Perk Details */}
          <Card className="rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-start space-x-3">
                {/* Perk Icon */}
                <div className="relative">
                  <img
                    src={getImageUrl(perk)}
                    alt={perk.name}
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                    rarityColors[perk.rarity as keyof typeof rarityColors] || 'bg-gray-500'
                  }`}>
                    <span className="text-xs font-bold text-white">
                      {perk.tier || '?'}
                    </span>
                  </div>
                </div>

                {/* Perk Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-lg font-bold text-white">{perk.name}</h1>
                    <span className="text-sm text-slate-400">{perk.type}</span>
                  </div>
                  
                  <div className="text-xs text-slate-300">
                    <span><strong>Item Type:</strong> {perk.itemType}</span>
                  </div>
                  
                  {perk.ScalingPerGearScore && (
                    <div className="text-xs text-slate-400 mt-1">
                      <span>Scales with Gear Score</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="my-4 border-b border-slate-700/60" />

              {/* Description */}
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  {perk.description}
                </p>
                {perk.ScalingPerGearScore && (
                  <p className="text-xs text-slate-400 italic">
                    * Values shown are calculated for Gear Score 700 (max level)
                  </p>
                )}
              </div>

              {/* Condition */}
              {perk.condition && (
                <>
                  <div className="my-4 border-b border-slate-700/60" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Condition:</span>
                      <span className="text-sm text-white">{perk.condition}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Compatible With */}
              {perk.perkItemClassInclude && Array.isArray(perk.perkItemClassInclude) && perk.perkItemClassInclude.length > 0 && (
                <>
                  <div className="my-4 border-b border-slate-700/60" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Compatible With:</span>
                      <span className="text-sm text-white">
                        {perk.perkItemClassInclude.join(', ')}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Exclusive Labels */}
              {perk.ExclusiveLabels && Array.isArray(perk.ExclusiveLabels) && perk.ExclusiveLabels.length > 0 && (
                <>
                  <div className="my-4 border-b border-slate-700/60" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Exclusive Labels:</span>
                      <div className="flex flex-wrap gap-1">
                        {perk.ExclusiveLabels.map((label, index) => (
                          <Badge key={index} variant="outline" className="bg-red-900/50 text-red-300 border-red-700 text-xs px-1 py-0">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Craft Mod */}
              {perk.craftMod && (
                <>
                  <div className="my-4 border-b border-slate-700/60" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Craft Mod:</span>
                      <span className="text-sm text-green-400">{perk.craftMod}</span>
                    </div>
                  </div>
                </>
              )}


            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
