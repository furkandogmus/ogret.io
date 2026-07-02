# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> Search Page E2E Tests >> should display total search results and result cards
- Location: tests/search.spec.ts:10:3

# Error details

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> /root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/tmp/playwright_chromiumdev_profile-zXDcy0 --remote-debugging-pipe --no-startup-window
<launched> pid=17487
[pid=17487][err] [0702/181659.988994:WARNING:media/gpu/vaapi/vaapi_wrapper.cc:1643] drmGetDevices2() has not found any devices
[pid=17487][err] [0702/181659.994496:WARNING:sandbox/policy/linux/sandbox_linux.cc:404] InitializeSandbox() called with multiple threads in process gpu-process.
[pid=17487][err] [0702/181700.306460:ERROR:gpu/ipc/client/command_buffer_proxy_impl.cc:285] ContextResult::kTransientFailure: Failed to send GpuControl.CreateCommandBuffer.
[pid=17487][err] [0702/181701.488234:INFO:CONSOLE:789] "[vite] connecting...", source: http://localhost:5173/@vite/client (789)
[pid=17487][err] [0702/181701.529534:INFO:CONSOLE:912] "[vite] connected.", source: http://localhost:5173/@vite/client (912)
[pid=17487][err] [0702/181702.569021:INFO:CONSOLE:21609] "%cDownload the React DevTools for a better development experience: https://reactjs.org/link/react-devtools font-weight:bold", source: http://localhost:5173/node_modules/.vite/deps/chunk-BH4GTE34.js?v=eea154e2 (21609)
[pid=17487] <gracefully close start>
```

```
Error: Channel closed
```