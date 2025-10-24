"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Release, ReleaseItemKind } from "@/lib/changelog"

interface WhatsNewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  releases: Release[] // Changed from single release to array of releases
  onDismiss: (dontShowAgain: boolean) => void
  onNavigate: (view: string) => void
  onViewChangelog: () => void
}

const kindColors: Record<ReleaseItemKind, string> = {
  New: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400 dark:border-green-500/30",
  Improved: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  Fixed: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
  Notice: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
}

export function WhatsNewModal({
  open,
  onOpenChange,
  releases, // Now accepts array of releases
  onDismiss,
  onNavigate,
  onViewChangelog,
}: WhatsNewModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleDismiss = () => {
    onDismiss(dontShowAgain)
    onOpenChange(false)
  }

  const handleCTA = (item: Release["items"][0]) => {
    if (item.cta?.href) {
      // Navigate to the href (deep link)
      window.location.href = item.cta.href
      onOpenChange(false)
    } else if (item.deeplink) {
      onNavigate(item.deeplink.view)
      onOpenChange(false)
    }
  }

  const titleText =
    releases.length > 1
      ? `What's New in FlowCraft v${releases[0].version}`
      : `What's New in FlowCraft v${releases[0].version}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl p-0 gap-0 flex flex-col h-[90vh] sm:h-[85vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl pr-8">{titleText}</DialogTitle>
            <DialogDescription className="text-sm">
              {releases.length > 1
                ? `${releases.length} new versions with updates`
                : new Date(releases[0].dateISO).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 min-h-0">
          <div className="space-y-6 sm:space-y-8 pb-4">
            {releases.map((release) => (
              <div key={release.version} className="space-y-4">
                {releases.length > 1 && (
                  <div className="border-b pb-2 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold">Version {release.version}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(release.dateISO).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                <div className="space-y-5 sm:space-y-6">
                  {release.items.map((item) => (
                    <div key={item.id} className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                        <Badge variant="outline" className={`${kindColors[item.kind]} shrink-0 w-fit text-xs`}>
                          {item.kind}
                        </Badge>
                        <div className="flex-1 min-w-0 space-y-2">
                          <h3 className="font-semibold text-base sm:text-lg leading-tight">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-1">
                            {item.cta && (
                              <Button
                                size="sm"
                                onClick={() => handleCTA(item)}
                                disabled={!item.deeplink && !item.cta.href}
                                className="w-fit text-xs sm:text-sm"
                              >
                                {item.cta.label}
                              </Button>
                            )}
                            {item.howToFind && (
                              <p className="text-xs text-muted-foreground leading-snug">
                                💡 {item.howToFind}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Footer - Always at Bottom */}
        <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3">
            {/* Checkbox - Better wrapping on mobile */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                className="mt-0.5 shrink-0"
              />
              <Label 
                htmlFor="dont-show" 
                className="text-xs sm:text-sm text-muted-foreground cursor-pointer leading-snug"
              >
                Don&apos;t show again for this version
              </Label>
            </div>
            
            {/* Action Buttons - Fully Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={onViewChangelog}
                className="w-full sm:w-auto text-xs sm:text-sm order-2 sm:order-1"
              >
                View all updates
              </Button>
              <a
                href="https://github.com/juliusz-cwiakalski/v0-flow-craft-1-1-juliusz-cwiakalski/blob/main/doc/spec/specification.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground border rounded-md bg-background transition-colors w-full sm:w-auto order-3 sm:order-2"
              >
                System Specification
              </a>
              <Button 
                onClick={handleDismiss}
                className="w-full sm:w-auto text-xs sm:text-sm order-1 sm:order-3 sm:ml-auto"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
