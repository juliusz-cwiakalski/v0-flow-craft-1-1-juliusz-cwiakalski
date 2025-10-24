/**
 * @jest-environment jsdom
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { StatusHistoryPanel } from "./issue-card-status-history-panel"
import type { Issue } from "@/types"

describe("StatusHistoryPanel", () => {
  it("shows no history message when empty", () => {
    const issue: Issue = {
      id: "TSK-1",
      title: "Test",
      description: "desc",
      priority: "P2",
      status: "Todo",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [],
    }
    render(<StatusHistoryPanel issue={issue} />)
    expect(screen.getByText(/No change history available/)).toBeInTheDocument()
  })

  it("renders all change types with values", () => {
    const issue: Issue = {
      id: "TSK-2",
      title: "Test",
      description: "desc",
      priority: "P2",
      status: "Done",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        {
          field: "status",
          from: "Todo",
          to: "Done",
          atISO: "2025-01-01T00:00:00Z",
          changedBy: "alice"
        },
        {
          field: "title",
          from: "Test",
          to: "Test Updated",
          atISO: "2025-01-02T00:00:00Z",
          changedBy: "bob"
        },
        {
          field: "assignee",
          from: null,
          to: "user-1",
          atISO: "2025-01-03T00:00:00Z",
        },
      ],
    }
    render(<StatusHistoryPanel issue={issue} />)
    expect(screen.getByText("1.01.2025, 01:00:00")).toBeInTheDocument()
    expect(screen.getByText(/Status/)).toBeInTheDocument()
    expect(screen.getByText(/Todo.*Done/)).toBeInTheDocument()
    expect(screen.getByText(/by alice/)).toBeInTheDocument()
    expect(screen.getByText("2.01.2025, 01:00:00")).toBeInTheDocument()
    expect(screen.getByText("title")).toBeInTheDocument()
    expect(screen.getByText(/Test.*Test Updated/)).toBeInTheDocument()
    expect(screen.getByText(/by bob/)).toBeInTheDocument()
    expect(screen.getByText("3.01.2025, 01:00:00")).toBeInTheDocument()
    expect(screen.getByText("assignee")).toBeInTheDocument()
    expect(screen.getByText(/null.*user-1/)).toBeInTheDocument()
  })
})
