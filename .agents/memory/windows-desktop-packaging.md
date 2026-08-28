---
name: Windows desktop packaging
description: Platform-specific packaging constraint for the offline Electron application.
---

Use the portable `win-unpacked` ZIP as the reliable Windows deliverable when building in Replit's Linux environment. Build the optional NSIS installer on Windows.

**Why:** Electron can assemble the Windows executable on Linux, but the final NSIS step invokes Wine. The available Nix Wine wrapper failed while running the generated installer, after the executable itself had already packaged successfully.

**How to apply:** For Replit builds, create the Windows directory target and zip it. Only promise an NSIS setup executable after running the installer build on a Windows machine.