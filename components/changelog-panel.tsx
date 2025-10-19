"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { releases, type ReleaseItemKind } from "@/lib/changelog"

interface ChangelogPanelProps {
  onNavigate: (view: string) => void
}

const kindColors: Record<ReleaseItemKind, string> = {
  New: "bg-green-500/10 text-green-700 border-green-500/20",
  Improved: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  Fixed: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  Notice: "bg-purple-500/10 text-purple-700 border-purple-500/20",
}

export function ChangelogPanel({ onNavigate }: ChangelogPanelProps) {
  const handleCTA = (item: (typeof releases)[0]["items"][0]) => {
    if (item.cta?.href) {
      // Navigate to the href (deep link)
      window.location.href = item.cta.href
    } else if (item.deeplink) {
      onNavigate(item.deeplink.view)
    }
  }

  if (releases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-lg text-muted-foreground">No updates yet.</p>
          <p className="text-sm text-muted-foreground">Check back later for new features and improvements.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground">Stay up to date with the latest features and improvements in FlowCraft.</p>
      </div>

      <div className="space-y-8">
        {releases.map((release) => (
          <Card key={release.version}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Version {release.version}</CardTitle>
                <Badge variant="outline">
                  {new Date(release.dateISO).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {release.items.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className={kindColors[item.kind]}>
                        {item.kind}
                      </Badge>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                        <div className="flex items-center gap-3 pt-2">
                          {item.cta && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCTA(item)}
                              disabled={!item.deeplink && !item.cta.href}
                            >
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
