import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuildItemsSection } from '@/components/admin/BuildItemsSection';
import { AttributesSection } from '@/components/admin/AttributesSection';
import { AbilitiesSection } from '@/components/admin/AbilitiesSection';
import { Plus, Save, List } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BuildData {
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
}

export default function AdminDashboard() {
  const [buildData, setBuildData] = useState<BuildData>({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    items: {},
    attributes: {
      strength: 0,
      dexterity: 0,
      intelligence: 0,
      focus: 0,
      constitution: 0,
    },
    abilities: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveBuild = async () => {
    if (!buildData.name || !buildData.category) {
      toast.error('Please fill in name and category');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manage-builds', {
        body: {
          action: 'create',
          buildData,
        },
      });

      if (error) throw error;

      toast.success('Build saved successfully!');
      setBuildData({
        name: '',
        category: '',
        subcategory: '',
        description: '',
        items: {},
        attributes: {
          strength: 0,
          dexterity: 0,
          intelligence: 0,
          focus: 0,
          constitution: 0,
        },
        abilities: [],
      });
    } catch (error) {
      console.error('Error saving build:', error);
      toast.error('Failed to save build');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - New World Builds</title>
        <meta name="description" content="Create and manage New World builds" />
      </Helmet>
      
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Create and manage New World builds</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Build Information
                  </CardTitle>
                  <CardDescription>
                    Basic details about your build
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="build-name">Build Name</Label>
                    <Input
                      id="build-name"
                      value={buildData.name}
                      onChange={(e) => setBuildData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter build name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={buildData.category}
                      onChange={(e) => setBuildData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="PvP, PvE, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={buildData.subcategory}
                      onChange={(e) => setBuildData(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder="Tank, DPS, Support, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="w-full min-h-[100px] p-2 border rounded-md bg-background"
                      value={buildData.description}
                      onChange={(e) => setBuildData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your build..."
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSaveBuild} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Build'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Tabs defaultValue="items" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="items">Items & Gear</TabsTrigger>
                  <TabsTrigger value="attributes">Attributes</TabsTrigger>
                  <TabsTrigger value="abilities">Abilities</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items" className="space-y-6">
                  <BuildItemsSection 
                    items={buildData.items}
                    onItemsChange={(items) => setBuildData(prev => ({ ...prev, items }))}
                  />
                </TabsContent>
                
                <TabsContent value="attributes" className="space-y-6">
                  <AttributesSection 
                    attributes={buildData.attributes}
                    onAttributesChange={(attributes) => setBuildData(prev => ({ ...prev, attributes }))}
                  />
                </TabsContent>
                
                <TabsContent value="abilities" className="space-y-6">
                  <AbilitiesSection 
                    abilities={buildData.abilities}
                    onAbilitiesChange={(abilities) => setBuildData(prev => ({ ...prev, abilities }))}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}