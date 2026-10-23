# ReliefGraph AI – Engineering Documentation Index

Welcome to the engineering and architectural documentation for **ReliefGraph AI**, an intelligent disaster response, emergency triage, and dynamic supply-chain coordination platform.

---

## Documentation Directory

| Document | Description | Format / Standards |
| :--- | :--- | :--- |
| **[SRS (Software Requirements Specification)](SRS.md)** | Functional and non-functional requirements, user stories, interface specifications, safety constraints, and validation matrix. | IEEE Std 830-1998 format |
| **[DFD (Data Flow Diagrams)](DFD.md)** | Level 0 (Context Diagram), Level 1 (High-Level Subsystem Flow), Level 2 (Decomposed Process Flows), and comprehensive Data Dictionary. | Mermaid & Markdown |
| **[Architecture & System Design](ARCHITECTURE.md)** | High-level system architecture, client/server tiers, data store fallback mechanisms, AI extraction pipelines, failure modes, and sequence diagrams. | Mermaid & C4-style diagrams |
| **[API Documentation](API_DOCUMENTATION.md)** | Complete RESTful API specification, request/response JSON schemas, query filters, error codes, and practical cURL examples. | OpenAPI / REST spec |
| **[Database Schema & Models](DATABASE_SCHEMA.md)** | Mongoose collections, data types, indexes, cross-collection relationships, and in-memory dual-layer storage parity. | Entity-Relationship & JSON |
| **[Deployment & Operations Guide](DEPLOYMENT_GUIDE.md)** | Step-by-step setup instructions for offline development, local standalone execution, and production multi-container Docker Compose. | DevOps & SysAdmin Guide |

---

## System Quick Reference

```
ReliefGraph AI Architecture Overview
========================================================================
[ Citizen / Responder Reports ]
               │
               ▼
   [ Express.js REST API ] ──► [ AI Pipeline: Gemini Flash / Heuristics ]
               │                                      │
               ├──────────────────────────────────────┘
               ▼
     [ Hybrid Data Store ] (MongoDB 7.0 / In-Memory MemoryCollection)
               │
       ┌───────┴────────────────────────┐
       ▼                                ▼
[ Leaflet GIS Spatial Engine ]   [ Vis-Network Knowledge Graph ]
       │                                │
       └───────────────┬────────────────┘
                       ▼
         [ React 19 / Vite Dashboard ]
```
