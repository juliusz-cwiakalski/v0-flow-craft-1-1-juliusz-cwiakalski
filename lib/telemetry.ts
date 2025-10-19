export interface TelemetryEvent {
  event: string
  payload: Record<string, unknown>
  timestamp: Date
}

class TelemetryAdapter {
  track(event: string, payload: Record<string, unknown> = {}) {
    const telemetryEvent: TelemetryEvent = {
      event,
      payload,
      timestamp: new Date(),
    }

    // V0 implementation: console logging only
    console.log("[Telemetry]", telemetryEvent)
  }
}

export const telemetry = new TelemetryAdapter()

export function trackEvent(event: string, payload: Record<string, unknown> = {}) {
  telemetry.track(event, payload)
}
