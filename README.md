# NexusVPN Desktop

NexusVPN Desktop packages the existing dashboard as a Windows application. It does not create or host a VPN server, and the dashboard's Connect buttons do not establish a VPN tunnel. Downloaded `.ovpn` configurations require a compatible OpenVPN client and a reachable VPN Gate server.

## Build on Windows

Install Node.js 22 or newer, then run:

```powershell
npm install
npm start
```

Create the Windows installer with:

```powershell
npm run dist
```

The installer will be written to `dist/NexusVPN-Setup-1.0.0.exe`.

## Publish a downloadable release on GitHub

1. Create a GitHub repository and upload this project, including `package.json`, `electron/`, and `.github/workflows/`.
2. Push a version tag such as `v1.0.0`.
3. The **Build Windows app** workflow will create a GitHub Release containing `NexusVPN-Setup-1.0.0.exe`.

Alternatively, run the workflow manually from the repository's **Actions** tab. That creates a downloadable build artifact; a version tag is required to publish a GitHub Release.