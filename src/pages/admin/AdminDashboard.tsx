import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Lock,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Eye,
  GripVertical,
  LogOut,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import buildsData from '@/data/builds.json';

type BuildEmbed = 'iframe' | 'link';

interface Build {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  link: string;
  embed: BuildEmbed;
  iframeHeight: number;
  tags: string[];
  notes: string;
  youtube: string;
  featured: boolean;
  updatedAt: string;
}

const API_ENDPOINT = '/builds_config.php';
const today = () => new Date().toISOString().split('T')[0];

const normalizeBuild = (build: Build): Build => ({
  ...build,
  category: build.category ?? '',
  subCategory: build.subCategory ?? '',
  tags: Array.isArray(build.tags) ? build.tags : [],
});

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [builds, setBuilds] = useState<Build[]>(() =>
    (buildsData as Build[]).map(normalizeBuild)
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingBuild, setEditingBuild] = useState<Build | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);

  const loadBuildsFromServer = useCallback(
    async (suppressErrors = false) => {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINT, { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Failed to fetch builds');
        }

        const payload = (await response.json()) as { builds?: Build[]; categories?: string[]; isAdmin?: boolean };
        if (Array.isArray(payload.builds)) {
          setBuilds(payload.builds.map(normalizeBuild));
        }

        if (Array.isArray(payload.categories)) {
          setCategories(payload.categories);
        }

        if (typeof payload.isAdmin === 'boolean') {
          setIsAuthenticated(payload.isAdmin);
        }
      } catch (error) {
        console.error('Failed to load builds', error);
        if (!suppressErrors) {
          toast({
            title: 'Failed to load builds',
            description: 'Using bundled data for now. Verify the PHP endpoint is reachable.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  useEffect(() => {
    void loadBuildsFromServer();
  }, [loadBuildsFromServer]);

  const handleLogin = async () => {
    if (!password.trim()) {
      toast({
        title: 'Password required',
        description: 'Enter the admin password to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('login', '1');
      formData.append('password', password);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const payload = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? 'Incorrect password');
      }

      setIsAuthenticated(true);
      setPassword('');
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });

      await loadBuildsFromServer(true);
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Unable to login.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('logout', '1');

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Failed to logout.');
      }

      setIsAuthenticated(false);
      setPassword('');
      setEditingBuild(null);
      setShowForm(false);
      toast({
        title: 'Logged Out',
        description: 'Admin session ended.',
      });

      await loadBuildsFromServer(true);
    } catch (error) {
      console.error('Logout failed', error);
      toast({
        title: 'Logout Failed',
        description: error instanceof Error ? error.message : 'Unable to logout.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const persistBuilds = async (
    nextBuilds: Build[],
    options: {
      success?: { title: string; description?: string };
      failureTitle?: string;
    } = {}
  ): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextBuilds),
        credentials: 'include',
      });

      const payload = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error ?? 'Failed to save builds.');
      }

      setBuilds(nextBuilds.map(normalizeBuild));
      if (options.success) {
        toast(options.success);
      }
      return true;
    } catch (error) {
      console.error('Failed to persist builds', error);
      toast({
        title: options.failureTitle ?? 'Save Failed',
        description: error instanceof Error ? error.message : 'Unable to save builds.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const persistCategories = async (
    nextCategories: string[],
    options: {
      success?: { title: string; description?: string };
      failureTitle?: string;
    } = {}
  ): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextCategories),
        credentials: 'include',
      });

      const payload = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error ?? 'Failed to save categories.');
      }

      setCategories(nextCategories);
      if (options.success) {
        toast(options.success);
      }
      return true;
    } catch (error) {
      console.error('Failed to persist categories', error);
      toast({
        title: options.failureTitle ?? 'Save Failed',
        description: error instanceof Error ? error.message : 'Unable to save categories.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateBuildId = (title: string, category: string, subCategory: string): string => {
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '-') // Replace special characters with dash
        .replace(/\s+/g, '-') // Replace spaces with dash
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    };

    const normalizedTitle = normalizeText(title);
    const normalizedCategory = normalizeText(category);
    const normalizedSubCategory = normalizeText(subCategory);

    if (subCategory && subCategory.trim()) {
      return `${normalizedTitle}-${normalizedCategory}-${normalizedSubCategory}`;
    } else {
      return `${normalizedTitle}-${normalizedCategory}`;
    }
  };

  const handleCreateBuild = () => {
    const newBuild: Build = {
      id: '', // Will be generated when title/category are filled
      title: '',
      category: '',
      subCategory: '',
      link: '',
      embed: 'iframe',
      iframeHeight: 900,
      tags: [],
      notes: '',
      youtube: '',
      featured: false,
      updatedAt: today(),
    };
    setEditingBuild(newBuild);
    setShowForm(true);
  };

  const handleEditBuild = (build: Build) => {
    setEditingBuild({ ...build });
    setShowForm(true);
  };

  const handleSaveBuild = async () => {
    if (!editingBuild) return;

    if (!editingBuild.title || !editingBuild.link || !editingBuild.category) {
      toast({
        title: "Validation Error",
        description: "Title, category, and link are required",
        variant: "destructive",
      });
      return;
    }

    const preparedBuild = normalizeBuild({
      ...editingBuild,
      updatedAt: today(),
    });

    const nextBuilds = builds.some(build => build.id === preparedBuild.id)
      ? builds.map(build => (build.id === preparedBuild.id ? preparedBuild : build))
      : [...builds, preparedBuild];

    const succeeded = await persistBuilds(nextBuilds, {
      success: {
        title: "Build Saved",
        description: `Build "${preparedBuild.title}" has been saved`,
      },
      failureTitle: 'Save Failed',
    });

    if (succeeded) {
      setEditingBuild(null);
      setShowForm(false);
    }
  };

  const handleDeleteBuild = async (id: string) => {
    if (!confirm('Are you sure you want to delete this build?')) {
      return;
    }

    const deletedBuild = builds.find(b => b.id === id);
    const nextBuilds = builds.filter(b => b.id !== id);

    const succeeded = await persistBuilds(nextBuilds, {
      success: {
        title: "Build Deleted",
        description: deletedBuild
          ? `Build "${deletedBuild.title}" has been removed`
          : 'Build has been removed',
      },
      failureTitle: 'Delete Failed',
    });

    if (succeeded && editingBuild?.id === id) {
      setEditingBuild(null);
      setShowForm(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(builds, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'builds.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "builds.json has been downloaded",
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as Build[];
        const normalizedData = importedData.map(normalizeBuild);

        const succeeded = await persistBuilds(normalizedData, {
          success: {
            title: "Data Imported",
            description: "Builds data has been imported successfully",
          },
          failureTitle: 'Import Failed',
        });

        if (!succeeded) {
          return;
        }
      } catch (error) {
        console.error('Failed to import builds', error);
        toast({
          title: "Import Error",
          description: error instanceof Error ? error.message : 'Invalid JSON file',
          variant: "destructive",
        });
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      toast({
        title: "Import Error",
        description: 'Unable to read the selected file.',
        variant: 'destructive',
      });
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const updateBuildField = <K extends keyof Build>(field: K, value: Build[K]) => {
    setEditingBuild(prev => {
      if (!prev) return prev;
      
      const updatedBuild = {
        ...prev,
        [field]: value,
      };

      // Auto-generate ID when title, category, or subcategory changes
      if (field === 'title' || field === 'category' || field === 'subCategory') {
        const newId = generateBuildId(
          field === 'title' ? value as string : updatedBuild.title,
          field === 'category' ? value as string : updatedBuild.category,
          field === 'subCategory' ? value as string : updatedBuild.subCategory
        );
        updatedBuild.id = newId;
      }

      return updatedBuild;
    });
  };

  const addTag = (tag: string) => {
    if (!editingBuild || !tag.trim()) return;
    const newTag = tag.trim();
    if (!editingBuild.tags.includes(newTag)) {
      setEditingBuild({
        ...editingBuild,
        tags: [...editingBuild.tags, newTag],
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (!editingBuild) return;
    setEditingBuild({
      ...editingBuild,
      tags: editingBuild.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const moveCategoryUp = (index: number) => {
    if (index <= 0) return;
    const newCategories = [...categories];
    [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
    setCategories(newCategories);
  };

  const moveCategoryDown = (index: number) => {
    if (index >= categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    setCategories(newCategories);
  };

  const addCategory = (category: string) => {
    if (!category.trim() || categories.includes(category.trim())) return;
    setCategories([...categories, category.trim()]);
  };

  const removeCategory = (index: number) => {
    if (!confirm('Are you sure you want to remove this category? This will not affect existing builds.')) {
      return;
    }
    setCategories(categories.filter((_, i) => i !== index));
  };

  const saveCategories = async () => {
    const succeeded = await persistCategories(categories, {
      success: {
        title: "Categories Saved",
        description: "Category order has been updated",
      },
      failureTitle: 'Save Failed',
    });

    if (succeeded) {
      setShowCategoryManagement(false);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl">
              <Lock className="mr-2 h-6 w-6" />
              Admin Access
            </CardTitle>
            <CardDescription>
              Enter the admin password to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isProcessing) {
                    handleLogin();
                  }
                }}
                placeholder="Enter admin password"
                disabled={isProcessing}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" disabled={isProcessing}>
              Login
            </Button>
            <p className="text-xs text-muted-foreground text-center">
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage S9 builds and content</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleLogout} variant="outline" disabled={isProcessing}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={() => setShowCategoryManagement(true)} variant="outline" disabled={isProcessing || isLoading}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button onClick={handleCreateBuild} disabled={isProcessing || isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            New Build
          </Button>
          <Button onClick={handleExportData} variant="outline" disabled={isProcessing}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            <Button variant="outline" disabled={isProcessing}>
              <Upload className="mr-2 h-4 w-4" />
              Import JSON
            </Button>
          </div>
        </div>

        {/* Edit Form Modal */}
        {showForm && editingBuild && (
          <Card>
            <CardHeader>
              <CardTitle>
                {builds.find(b => b.id === editingBuild.id) ? 'Edit Build' : 'Create New Build'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editingBuild.title}
                    onChange={(e) => updateBuildField('title', e.target.value)}
                    placeholder="Build title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={editingBuild.category}
                    onChange={(e) => updateBuildField('category', e.target.value)}
                    placeholder="e.g., PvP Meta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={editingBuild.subCategory}
                    onChange={(e) => updateBuildField('subCategory', e.target.value)}
                    placeholder="e.g., Beginner"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Generated Build ID</Label>
                  <div className="p-2 bg-muted rounded-md font-mono text-sm">
                    {editingBuild.id || 'Enter title and category to generate ID'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from title, category, and subcategory
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Build Link *</Label>
                  <Input
                    id="link"
                    value={editingBuild.link}
                    onChange={(e) => updateBuildField('link', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embed">Embed Type</Label>
                  <Select value={editingBuild.embed} onValueChange={(value: 'iframe' | 'link') => updateBuildField('embed', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iframe">Iframe</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Iframe Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={editingBuild.iframeHeight}
                    onChange={(e) => updateBuildField('iframeHeight', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube Link</Label>
                  <Input
                    id="youtube"
                    value={editingBuild.youtube}
                    onChange={(e) => updateBuildField('youtube', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Featured Build</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingBuild.featured}
                      onCheckedChange={(checked) => updateBuildField('featured', checked)}
                    />
                    <span className="text-sm">{editingBuild.featured ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingBuild.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        Ã—
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add tag"]') as HTMLInputElement;
                      addTag(input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Markdown supported)</Label>
                <Textarea
                  id="notes"
                  value={editingBuild.notes}
                  onChange={(e) => updateBuildField('notes', e.target.value)}
                  placeholder="Build description and notes..."
                  className="min-h-32"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveBuild} disabled={isProcessing}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Build
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} disabled={isProcessing}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Management Modal */}
        {showCategoryManagement && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>
                Reorder categories to change their display order in the builds page dropdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Category */}
              <div className="space-y-2">
                <Label htmlFor="newCategory">Add New Category</Label>
                <div className="flex gap-2">
                  <Input
                    id="newCategory"
                    placeholder="Enter category name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addCategory(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('newCategory') as HTMLInputElement;
                      addCategory(input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                <Label>Category Order</Label>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div
                      key={category}
                      className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/30"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 font-medium">{category}</span>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveCategoryUp(index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveCategoryDown(index)}
                          disabled={index === categories.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveCategories} disabled={isProcessing}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Categories
                </Button>
                <Button variant="outline" onClick={() => setShowCategoryManagement(false)} disabled={isProcessing}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Builds List */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Builds ({builds.length})</CardTitle>
            <CardDescription>
              Drag to reorder, click to edit, or delete builds
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-sm text-muted-foreground mb-4">Loading builds from the server...</p>
            )}
            <div className="space-y-4">
              {builds.map((build, index) => (
                <div
                  key={build.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium truncate">{build.title}</h3>
                      {build.featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                      {build.category && (
                        <Badge variant="secondary">{build.category}</Badge>
                      )}
                      {build.subCategory && (
                        <Badge variant="secondary" className="bg-muted text-foreground">
                          {build.subCategory}
                        </Badge>
                      )}
                      <Badge variant="outline">{build.embed}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {build.link}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {build.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {build.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{build.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/new-world-builds?build=${build.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBuild(build)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBuild(build.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Important Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Data Persistence:</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                <li>Changes you make here are written to <code>src/data/builds.json</code> immediately.</li>
                <li>Export JSON whenever you want an offline backup or to share builds.</li>
                <li>Commit the updated JSON to publish changes on static deployments.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Data Management:</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                <li>Import JSON replaces the current list with the uploaded file.</li>
                <li>Download a fresh export before making large edits.</li>
                <li>Featured builds appear at the top of the builds selector.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;





