---
name: generate_patent_provisional
description: Consolidates architectural discussions into USPTO-ready provisional drafts.
---

# Generate Patent Provisional Skill

## Overview
This skill guides you through the process of taking architectural discussions, designs, and decisions, and consolidating them into a structured, USPTO-ready provisional patent application draft.

## Parameters
When this skill is invoked, ensure you use or gather the following details:
- **`project_name`** (string): The name of the project, system, or invention.
- **`technical_claims`** (array): A list of the core novel technical features, processes, or architectural components to claim.
- **`security_tier`** (string - Deterministic/Probabilistic): The security architecture tier and its specifics.
- **`infrastructure_context`** (string - e.g., Azure/Databricks): The deployment environment and specific infrastructure services utilized.

## Instructions
When generating a patent provisional, execute the following steps:

### 1. Information Gathering & Synthesis
Analyze the current conversation, architectural documents, or code base to synthesize the context for the `project_name`. Ensure you understand the `infrastructure_context` and the `security_tier` involved. 

### 2. Drafting Process
Draft the provisional application using formal, definitive patent language. Structure the draft into the following required sections:

*   **Title of the Invention**: A concise, descriptive title based on the `project_name` and the primary technical achievement.
*   **Field of the Invention**: A brief statement of the technical field to which the invention pertains.
*   **Background of the Invention**: Describe the technical problem being solved and the limitations of current approaches.
*   **Summary of the Invention**: A high-level overview of the solution, focusing on the core architectural innovations.
*   **Detailed Description**: 
    *   A comprehensive, embodiment-focused explanation of the architecture.
    *   Detailed integration of the `infrastructure_context` (how the cloud or local infrastructure enables the invention).
    *   Detailed integration of the `security_tier` (how deterministic or probabilistic security measures are enforced and why they are novel).
- **Claims**: 
    - Translate the items in `technical_claims` into formal claim language.
    - Include at least one broad independent claim (e.g., "A system for [purpose], comprising: [elements]...").
    - Include multiple dependent claims that expand on specific infrastructure or security attributes.
- **Abstract**: A brief summary (typically ~150 words) outlining the invention's primary utility.

### 3. Diagram Generation (Visual Aids)

Create architectural diagrams that are strict black and white (zero grey) to comply with USPTO drawing requirements. 
- Use Mermaid diagrams with black lines and white backgrounds (no shading or greyscale).
- Ensure all text, lines, labels, and borders use a high-contrast black color (`#000000`) on a pure white background (`#FFFFFF`).
- Include clear block diagram representations of the `infrastructure_context` and the flow/components relevant to the `technical_claims`.

### 4. Artifact Generation
Always output the drafted provisional patent application as a markdown Artifact stored in the `artifacts` directory. Use a descriptive filename, such as `provisional_patent_[project_name].md`.

### 5. User Review
Present the artifact to the user and prompt them for review, asking if any specific architectural nuances or alternative embodiments should be incorporated into the claims or detailed description.
