# FlowCraft 1.1

A modern task management application prototype built with Next.js, Redux Toolkit, and v0.app.

## Live Application

**[https://v0-flow-craft-1-1-juliusz-cwiakals.vercel.app/](https://v0-flow-craft-1-1-juliusz-cwiakals.vercel.app/)**

## About This Project

This project is an enhancement of the [FlowCraft v1.0 base application](https://go.kaca.la/v0-flowcraft-1.0) provided by Piotr Kacała for the [AI Product Heroes](https://www.aiproductheroes.pl/) certification. My work involved a complete product discovery process and the implementation of strategic features on top of this foundation. See my [certification write-up](doc/certyfikat-ai-product-heroes/README.md) (in Polish) for a full description.

The core challenge I addressed: **FlowCraft is losing customers as their teams scale to 30-50 employees because they "outgrow" the tool.** This prototype directly addresses the root causes of this churn, which were identified through an innovative, AI-powered discovery process.

I implemented two key features to solve this:
- **Quick Capture with templates:** To reduce operational chaos and "work about work."
- **An advanced analytics Dashboard:** To provide managers with the "bird's-eye view" they were missing.

These changes, derived directly from a data-driven Opportunity Solution Tree, represent the first critical step in evolving FlowCraft into a platform that scales *with* its customers, rather than losing them.

**Created by:** [Juliusz Ćwiąkalski](https://www.linkedin.com/in/juliusz-cwiakalski/)

**Source Code:** [GitHub Repository](https://github.com/juliusz-cwiakalski/v0-flow-craft-1-1-juliusz-cwiakalski)

## Core Features

- **Issue Management**: Full CRUD operations for issues, including status tracking, acceptance criteria, and a complete, auditable change history.
- **Sprint Planning**: Organize work into sprints with a Kanban board for clear visualization and progress tracking.
- **Quick Capture**: A streamlined modal (press `Q`) for rapid issue creation using customizable templates, designed to make FlowCraft the single source of truth.
- **Analytics Dashboard**: A "bird's-eye view" of key metrics like Velocity, Cycle Time, and WIP Pressure, with project/team filtering to give managers strategic insights.
- **Settings & Administration**: Manage projects, teams, users, and issue templates to customize FlowCraft for a growing organization.
- **What's New Panel**: An in-app changelog to announce new features and drive adoption.

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **State Management:** Redux Toolkit with localStorage persistence
- **Styling:** Tailwind CSS v4
- **UI Components:** Custom component library
- **Deployment:** Vercel

## Development

This project is built and maintained using [v0.app](https://v0.app), an AI-powered development platform.

**Continue building:** [https://v0.app/chat/projects/ej5zKITdGsg](https://v0.app/chat/projects/ej5zKITdGsg)

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Project Documentation & Artifacts

This repository contains the complete "Golden Thread" of product discovery, from problem definition to a functional prototype.

- **[Certification Write-Up (PL)](doc/certyfikat-ai-product-heroes/README.md)**: The detailed project description submitted for the AI Product Heroes certification.

### 1. Product Discovery & Strategy
The complete discovery process, from AI-driven pain point analysis to the final roadmap.
- **[Product Discovery Overview](doc/product-discovery/README.md)**: An overview of the structured discovery workflow.
- **[Pain Point Analysis](doc/product-discovery/pain-points-analysis-notebookml.md)**: A deep dive into the core problems driving churn, synthesized using a custom AI-powered workflow.
- **[Opportunity Solution Tree (OST)](doc/product-discovery/ost-notebooklm.md)**: The strategic framework mapping user needs to potential solutions.
- **[Roadmap & Prioritization](doc/product-discovery/roadmap-notebooklm.md)**: Data-driven feature ranking using MoSCoW and RICE frameworks.

### 2. Specification & Design
- **[Functional Specification](doc/spec/specification.md)**: A detailed breakdown of all implemented features, data models, and user flows.
- **[Technical Design](doc/technical-design.md)**: A comprehensive overview of the application's architecture, data models, and component design.
- **[Product Experiments & PRDs](doc/changes)**: Definitions and Product Requirement Documents for the core experiments implemented in the prototype.
- **[Architecture Decision Records (ADRs)](doc/adr)**: Key architectural decisions made throughout the project.

## License

This is a prototype project for educational purposes.
