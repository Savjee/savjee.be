---
layout: post
title: "Running OpenClaw on Linux (Securely): My Practical Setup Guide"
description: "A practical, security-focused guide for running OpenClaw on a Linux machine without buying dedicated Apple hardware. Covers VLAN isolation, memory setup, browser config, OAuth access, and maintenance."
tags: [AI, Linux, Self-hosting, Security]
---

I wanted a practical OpenClaw setup that is:

- self-hosted
- reasonably secure
- affordable
- maintainable over time

This guide is for technical people who want to run OpenClaw on Linux without buying a dedicated Mac Mini for no reason.

This is a living guide. I update it as my setup evolves.
<!--more-->


## Installation

My preferred setup is OpenClaw inside a Proxmox VM.

Why a VM?

- easy snapshots before upgrades
- easy rollback when something breaks
- cleaner isolation from the rest of your environment

## Security

### Isolate OpenClaw with VLANs

You don’t want to give OpenClaw full unrestricted access to your network.
Even if your own prompts are safe, prompt injection attacks are real.

#### UniFi

1. Create a separate network (example: `Untrusted servers`) and assign a VLAN ID.
2. Go to **Ports**, find the Proxmox uplink port.
3. Set **Tagged VLAN Management** to:
   - `Allow All`, or
   - `Custom` if you want to limit available networks.

#### Proxmox

1. Go to host → **Network** → your bridge (`vmbr0` in most setups).
2. Enable **VLAN aware**.
3. Open your OpenClaw VM → **Hardware** → **Network Device**.
4. Set **VLAN Tag** to the VLAN ID configured in UniFi.
5. Reboot the VM.

#### Validate segmentation

- From trusted network → SSH into VM should work if allowed.
- From VM → reaching your personal devices should be blocked by policy.

## Memory

### Install QMD

```bash
npm install -g @tobilu/qmd
```

### Enable QMD backend

```bash
openclaw config set memory.backend "qmd"
openclaw memory status
openclaw memory index
```

The first index can take a while.

### Memory files that matter

At minimum, maintain these files consistently:

- `AGENTS.md`
- `HEARTBEAT.md`
- `MEMORY.md`
- `USER.md`
- `IDENTITY.md`

If these are stale, your agent gets inconsistent quickly.

## Browser

### Setup headless browser in OpenClaw

```bash
openclaw config set browser.enabled true
openclaw config set browser.defaultProfile '"openclaw"'
openclaw config set browser.headless true
openclaw config set browser.noSandbox true
openclaw gateway restart
```

### Install Google Chrome on Linux

I prefer Google Chrome over Chromium here.

```bash
curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg

cat <<EOF | sudo tee /etc/apt/sources.list.d/google-chrome.sources
Types: deb
URIs: https://dl.google.com/linux/chrome/deb/
Suites: stable
Components: main
Architectures: amd64
Signed-By: /usr/share/keyrings/google-chrome.gpg
EOF

sudo apt update
sudo apt install google-chrome-stable
```

Point OpenClaw to Chrome:

```bash
openclaw config set browser.executablePath "/usr/bin/google-chrome"
openclaw browser stop
openclaw gateway restart
```

## Configuration

Core configuration areas I tune early:

- memory backend (`qmd`)
- browser mode (headless + executable path)
- communication channels
- heartbeat behavior and report cadence

Tip: keep your configuration changes in a private changelog so you can undo bad experiments fast.

## AI providers

Set up providers with least privilege and explicit billing awareness.

My practical rules:

- start with one default model
- add fallbacks only when needed
- monitor spend from day one
- avoid adding five providers “just because”

## Skills

Skills are leverage, but also complexity.

My approach:

- enable only what I actively use
- document custom skills and assumptions
- remove dead skills periodically

## Agents

Use clear role boundaries.

Examples:

- main assistant (day-to-day)
- focused automation agent (single workflow)
- optional watcher/cron agent

Avoid creating too many overlapping agents. You’ll lose observability.

## Communication

### Setup Telegram

I use Telegram for quick updates and commands.

Good defaults:

- concise status updates
- proactive alerts only on blockers/urgency
- avoid noisy micro-updates

### Telegram group chat

Treat group chats as group chats, not your private command line.

- respond when useful
- stay quiet when no value
- avoid leaking private context

## Monitoring

If it runs unattended, you need basic observability.

What I monitor:

- gateway up/down
- auth/token failures
- failing cron runs
- message delivery failures

## Dashboard access

### SSH

- key-based auth only
- disable password auth where possible

### Cloudflare Access

Put web UIs behind identity-aware access where possible.

### Local access

Keep a local recovery path in case cloud access fails.

### Tailscale

Tailscale is a clean way to access your host securely without opening random ports.

## GitHub

### Connect as an app/bot (not your personal account)

Safer permissions, cleaner audit trail, easier revoke.

If a workflow breaks, you can rotate app credentials without touching your personal GitHub setup.

## Google Workspace

### Setup `gog`

On Linux, I set these env vars:

```bash
export GOG_KEYRING_PASSWORD='your-strong-secret'
export GOG_ACCOUNT='you@example.com'
```

Then in Google Cloud:

1. Enable APIs:
   - Google Drive API
   - Google Docs API
   - Google Sheets API
2. Create OAuth 2.0 Client (Desktop app)
3. Store credentials JSON in a secure location

Authenticate:

```bash
gog auth add you@example.com --services drive,docs,sheets --drive-scope=file --force-consent --manual
```

Why `--drive-scope=file` matters:

- OpenClaw can modify files it created/opened via the app
- avoids broad full-drive access

For headless servers, `--manual` is useful because you can paste redirect URLs.

## Maintenance checklist

Run this regularly:

- review memory files
- prune stale skills/config
- validate VLAN isolation still behaves as expected
- check token health (GitHub/Google/etc.)
- keep docs and runbooks current

## Final thoughts

OpenClaw can be extremely useful on a Linux homelab setup.

You don’t need expensive hardware.
You do need discipline around security boundaries, memory hygiene, and operations.

If you build those foundations first, everything else gets easier.
