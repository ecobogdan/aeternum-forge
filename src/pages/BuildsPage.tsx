import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { ExternalLink, Copy, Star, Calendar, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Build {
  id: string;
  title: string;
  link: string;
  embed: "iframe" | "link";
  iframeHeight?: number;
  tags: string[];
  notes?: string;
  youtube?: string;
  updatedAt: string;
  featured?: boolean;
}

const BuildsPage = () => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [filteredBuilds, setFilteredBuilds] = useState<Build[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const response = await fetch('/data/builds.json');
        const buildsData = await response.json();
        setBuilds(buildsData);
        setFilteredBuilds(buildsData);
      } catch (error) {
        toast({
          title: "Error loading builds",
          description: "Could not load build data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [toast]);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredBuilds(builds);
    } else {
      setFilteredBuilds(builds.filter(build => 
        selectedTags.some(tag => build.tags.includes(tag))
      ));
    }
  }, [selectedTags, builds]);

  const allTags = Array.from(new Set(builds.flatMap(build => build.tags))).sort();
  const featuredBuilds = builds.filter(build => build.featured);
  const regularBuilds = filteredBuilds.filter(build => !build.featured);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const copyBuildLink = (link: string, title: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: `${title} link copied to clipboard`,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading builds...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Season 9 <span className="text-primary">Builds</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover optimized character builds for New World: Aeternum Season 9. 
            Each build includes detailed breakdowns, gameplay tips, and interactive previews.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Filter by Tags:</h3>
          <div className="flex flex-wrap gap-3">
            {allTags.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Featured Builds */}
        {featuredBuilds.length > 0 && selectedTags.length === 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Featured Builds</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredBuilds.map(build => (
                <BuildCard key={build.id} build={build} copyBuildLink={copyBuildLink} />
              ))}
            </div>
          </div>
        )}

        {/* All Builds */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            {selectedTags.length > 0 ? 'Filtered Builds' : 'All Builds'}
          </h2>
          {filteredBuilds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No builds match the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {regularBuilds.map(build => (
                <BuildCard key={build.id} build={build} copyBuildLink={copyBuildLink} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const BuildCard = ({ build, copyBuildLink }: { build: Build; copyBuildLink: (link: string, title: string) => void }) => {
  return (
    <Card className="gradient-card border-gaming-border hover:shadow-gold transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            {build.title}
            {build.featured && <Star className="h-5 w-5 text-primary" />}
          </CardTitle>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            {new Date(build.updatedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {build.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Build Embed */}
        {build.embed === "iframe" ? (
          <div className="rounded-lg overflow-hidden border border-gaming-border">
            <iframe 
              src={build.link}
              width="100%"
              height={build.iframeHeight || 500}
              frameBorder="0"
              title={build.title}
              className="w-full"
            />
          </div>
        ) : (
          <div className="text-center py-8 border border-gaming-border rounded-lg bg-gaming-surface">
            <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">View this build on external site</p>
            <Button variant="gold" asChild>
              <a href={build.link} target="_blank" rel="noopener noreferrer">
                Open Build
              </a>
            </Button>
          </div>
        )}

        {/* YouTube Video */}
        {build.youtube && (
          <div className="rounded-lg overflow-hidden border border-gaming-border">
            <div className="flex items-center gap-2 p-2 bg-gaming-surface">
              <Youtube className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Video Guide</span>
            </div>
            <iframe 
              src={build.youtube}
              width="100%"
              height="300"
              frameBorder="0"
              title={`${build.title} - Video Guide`}
              className="w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Notes */}
        {build.notes && (
          <div className="p-4 bg-gaming-surface rounded-lg border border-gaming-border">
            <p className="text-sm text-muted-foreground leading-relaxed">{build.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => copyBuildLink(build.link, build.title)}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="gaming" size="sm" asChild className="flex-1">
            <a href={build.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Build
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildsPage;