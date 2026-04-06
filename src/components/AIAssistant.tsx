"use client";

import { useState } from 'react';
import { Sparkles, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[40] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all hover:scale-110 flex items-center justify-center group"
        aria-label="AI Assistant"
      >
        <div className="relative">
          <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
        </div>
      </button>

      {/* AI Assistant Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/20 p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader>
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <Sparkles className="text-primary h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-headline text-center text-primary">
                REVOPZ AI Assistant
              </DialogTitle>
              <DialogDescription className="text-center text-lg pt-2 leading-relaxed">
                We’re currently building our smart assistant to help you choose the right products, answer your questions, and guide you better.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6 rounded-2xl bg-muted/50 border border-border text-center">
              <p className="text-sm font-medium text-foreground/80">
                Stay tuned — something exciting is coming soon!
              </p>
            </div>

            <DialogFooter className="sm:justify-center">
              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-8 py-6 h-auto text-base font-bold bg-primary hover:bg-primary/90"
              >
                Got it!
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
