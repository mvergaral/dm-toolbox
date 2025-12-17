# DM Toolbox

A local-first, offline-capable desktop application designed to streamline tabletop role-playing game management. Built for Dungeon Masters who value privacy, speed, and reliability.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.3.1-blue.svg)](https://github.com/mvergaral/dm-toolbox)

## Overview

DM Toolbox is an open-source utility that replaces scattered notes and browser tabs with a unified dashboard. It operates entirely offline, storing data locally on your device to ensure zero latency and complete data ownership.

Whether you are running a complex combat encounter or planning the next arc of your campaign, DM Toolbox provides the essential utilities without the bloat of web-based VTTs.

## Key Features

### Campaign Management
Organize multiple campaigns simultaneously. Each campaign acts as a self-contained workspace with its own configuration, entities, and session logs.

### Advanced Combat Tracker
A robust initiative tracker designed to speed up encounters:
- **Automated Turn Management**: Automatically skips defeated combatants.
- **Condition Tracking**: Monitor status effects (Blinded, Stunned, etc.) with visual indicators.
- **Dynamic Stats**: Quick HP adjustments and initiative calculations.
- **Multi-Entity Support**: Rapidly add groups of monsters with auto-incrementing names.

### Session Planning
Write and organize session notes using a full-featured Markdown editor.
- **Entity Linking**: Directly reference NPCs and Combat Encounters within your session notes for quick access during gameplay.
- **Status Workflow**: Track sessions from "Planned" to "Completed".

### Entity Database
Maintain a persistent library of assets:
- **Player Characters**: Track basic stats and player details.
- **Bestiary & NPCs**: Create reusable templates for monsters and non-player characters.

### Internationalization
Fully localized interface available in **English** and **Spanish**.

## Installation

### For Users
Download the latest executable for Windows, macOS, or Linux from the [Releases](https://github.com/mvergaral/dm-toolbox/releases) page or support the development by purchasing it on [Itch.io](https://itch.io).

### For Developers
DM Toolbox is built with Electron, React, and TypeScript.

1. **Clone the repository**
   ```bash
   git clone https://github.com/mvergaral/dm-toolbox.git
   cd dm-toolbox
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Build for production**
   ```bash
   pnpm build:win  # Windows
   pnpm build:mac  # macOS
   pnpm build:linux # Linux
   ```

## Tech Stack

- **Runtime**: Electron
- **Frontend**: React, TypeScript, Tailwind CSS
- **Build Tool**: Vite (Electron-Vite)
- **Database**: RxDB (Local-first NoSQL)
- **State/Routing**: React Router DOM

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*DM Toolbox is an independent project and is not affiliated with Wizards of the Coast or any specific TTRPG publisher.*
