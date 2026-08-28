# Windows desktop build

The desktop shell loads the compiled interface directly from disk. It does not
start a local web server and does not require an internet connection at runtime.

## Create the portable Windows application

This command creates `release/win-unpacked/`, containing the Windows executable
and all supporting files:

```text
pnpm --filter @workspace/tabletop-command package:windows
```

The folder can be zipped, copied to a Windows laptop, extracted, and run without
installation.

## Create the optional Windows installer

Run this from a Windows build environment:

```text
pnpm --filter @workspace/tabletop-command package:windows:installer
```

The NSIS installer is written to `artifacts/tabletop-command/release/`.

## Exercise-room setup

1. Connect the projector or second monitor.
2. In Windows Display settings, select **Extend these displays**.
3. Launch Tabletop Command Center.
4. The moderator console opens on the primary laptop display.
5. The participant display opens full-screen on the external display.

If no external display is connected, both windows open on the primary display
so the room view can still be previewed.