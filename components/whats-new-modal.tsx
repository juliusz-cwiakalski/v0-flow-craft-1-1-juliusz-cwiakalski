"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  release: Release
  onDismiss: (dontShowAgain: boolean) => void
  onNavigate: (view: string) => void
  onViewChangelog: () => void
}

const kindColors: Record<ReleaseItemKind, string> = {
  New: "bg-green-500/10 text-green-700 border-green-500/20",
  Improved: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  Fixed: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  Notice: "bg-purple-500/10 text-purple-700 border-purple-500/20",
}

export function WhatsNewModal({
  open,
  onOpenChange,
  release,
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
    if (item.deeplink) {
      onNavigate(item.deeplink.view)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">What's New in FlowCraft v{release.version}</DialogTitle>
          <DialogDescription>
            {new Date(release.dateISO).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {release.items.map((item) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className={kindColors[item.kind]}>
                  {item.kind}
                </Badge>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                  <div className="flex items-center gap-3 pt-2">
                    {item.cta && (
                      <Button size="sm" onClick={() => handleCTA(item)} disabled={!item.deeplink}>
                        {item.cta.label}
                      </Button>
                    )}
                    {item.howToFind && <p className="text-xs text-muted-foreground">💡 {item.howToFind}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 mr-auto">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <Label htmlFor="dont-show" className="text-sm text-muted-foreground cursor-pointer">
              Don't show again for this version
            </Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onViewChangelog}>
              View all updates
            </Button>
            <Button onClick={handleDismiss}>Got it</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
