"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { simplifyProductDescription } from '@/ai/flows/product-description-simplifier';
import { Loader2, Wand2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContentSimplifierPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSimplify = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await simplifyProductDescription({ technicalDescription: input });
      setOutput(result.simplifiedDescription);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to simplify content. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      description: "Copied to clipboard!",
    });
  };

  return (
    <div className="w-full py-16 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6 max-w-[1000px]">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white">
            <Wand2 size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-headline">Content Simplifier</h1>
            <p className="text-muted-foreground">Transform complex technical jargon into customer-friendly descriptions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Side */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Technical Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="tech-input">Paste technical specs or complex descriptions here:</Label>
              <Textarea 
                id="tech-input"
                className="min-h-[300px] bg-background text-base"
                placeholder="Example: The Pure Sine Wave 3kVA Inverter utilizes multi-tap isolated toroidal transform with a peak efficiency rating of 96.5% and 10ms transfer logic..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSimplify} 
                className="w-full bg-primary hover:bg-primary/90 py-6 h-auto"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" size={18} />}
                {isLoading ? 'Processing...' : 'Simplify Content'}
              </Button>
            </CardFooter>
          </Card>

          {/* Output Side */}
          <Card className="bg-card border-primary/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1 w-full bg-primary/20 overflow-hidden">
              {isLoading && <div className="h-full bg-primary animate-pulse w-full" />}
            </div>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-primary">Customer Friendly Version</CardTitle>
              {output && (
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  {isCopied ? <Check className="text-green-500" /> : <Copy size={18} />}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {output ? (
                <div className="prose prose-invert max-w-none text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {output}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[340px] text-center text-muted-foreground">
                  <Wand2 size={40} className="mb-4 opacity-20" />
                  <p>Generated content will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}