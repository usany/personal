// src/client/store.ts
function createStore(initial) {
  let state = {
    ...initial
  };
  const subscribers = /* @__PURE__ */ new Set();
  return {
    getState() {
      return state;
    },
    setState(patch) {
      let changed = false;
      for (const key of Object.keys(patch)) {
        if (patch[key] !== void 0 && !Object.is(state[key], patch[key])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = {
        ...state,
        ...patch
      };
      for (const fn of Array.from(subscribers)) fn(state);
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => {
        subscribers.delete(fn);
      };
    }
  };
}

// src/client/api.ts
var ApiCallError = class extends Error {
  code;
  details;
  constructor(code, message, details) {
    super(message);
    this.name = "ApiCallError";
    this.code = code;
    this.details = details;
  }
};
function toStoreError(err) {
  if (err instanceof ApiCallError) return {
    code: err.code,
    message: err.message
  };
  if (err instanceof Error) return {
    code: "INTERNAL_ERROR",
    message: err.message
  };
  return {
    code: "INTERNAL_ERROR",
    message: "Something went wrong."
  };
}
async function unwrap(res) {
  let body;
  try {
    body = await res.json();
  } catch {
    throw new ApiCallError("INTERNAL_ERROR", `The server returned a malformed response (HTTP ${res.status}).`);
  }
  if (!body || typeof body !== "object" || !("ok" in body)) {
    throw new ApiCallError("INTERNAL_ERROR", "The server returned an unrecognised response.");
  }
  if (body.ok === false) {
    throw new ApiCallError(body.error.code, body.error.message, body.error.details);
  }
  return body.data;
}
async function requestScreenshot(payload) {
  const body = {
    url: payload.url,
    width: payload.width,
    height: payload.height,
    format: payload.format,
    fullPage: payload.fullPage
  };
  if (payload.format === "jpeg") body.quality = payload.quality;
  let res;
  try {
    res = await fetch("/api/screenshot", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch {
    throw new ApiCallError("INTERNAL_ERROR", "Could not reach the screenshot service.");
  }
  return await unwrap(res);
}
async function fetchStatus() {
  let res;
  try {
    res = await fetch("/api/status", {
      headers: {
        accept: "application/json"
      }
    });
  } catch {
    throw new ApiCallError("INTERNAL_ERROR", "Could not reach the screenshot service.");
  }
  return await unwrap(res);
}

// src/client/dom.ts
var win = globalThis;
function $(testid, root = document) {
  const el = root.querySelector(`[data-testid="${testid}"]`);
  if (!el) throw new Error(`[dom] no element with data-testid="${testid}"`);
  return el;
}
function on(target, type, handler) {
  target.addEventListener(type, handler);
  return () => target.removeEventListener(type, handler);
}
function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}
function setHidden(el, hidden) {
  if (el.hidden !== hidden) el.hidden = hidden;
}
function setData(el, key, value) {
  if (el.dataset[key] !== value) el.dataset[key] = value;
}
function debounce(fn, ms) {
  let timer;
  return {
    run() {
      if (timer !== void 0) win.clearTimeout(timer);
      timer = win.setTimeout(() => {
        timer = void 0;
        fn();
      }, ms);
    },
    cancel() {
      if (timer !== void 0) win.clearTimeout(timer);
      timer = void 0;
    }
  };
}
function formatKb(bytes) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
function formatSeconds(ms) {
  return `${(ms / 1e3).toFixed(1)}s`;
}
function preloadImage(src) {
  if (!src) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

// src/client/components/urlInput.ts
var VALIDATE_DEBOUNCE_MS = 400;
var AUTO_CAPTURE_IDLE_MS = 900;
var INVALID_MESSAGE = "Enter a valid http(s) URL";
var HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
var IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
function validateUrlShape(raw) {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return {
    valid: false,
    reason: INVALID_MESSAGE
  };
  const candidate = HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      valid: false,
      reason: INVALID_MESSAGE
    };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      reason: INVALID_MESSAGE
    };
  }
  const host = parsed.hostname;
  const plausibleHost = host === "localhost" || IPV4.test(host) || host.startsWith("[") || /\.[a-z]{2,}$/i.test(host);
  if (!plausibleHost) return {
    valid: false,
    reason: INVALID_MESSAGE
  };
  return {
    valid: true,
    normalized: parsed.href
  };
}
function mountUrlInput(root, store, actions) {
  const input = $("url-input", root);
  const errorEl = $("url-error", root);
  const autoToggle = $("auto-capture-toggle", root);
  const commit = () => {
    const value = input.value;
    const check = validateUrlShape(value);
    store.setState({
      url: value
    });
    const showError = value.trim().length > 0 && !check.valid;
    setText(errorEl, check.reason ?? INVALID_MESSAGE);
    setHidden(errorEl, !showError);
  };
  const validateLater = debounce(commit, VALIDATE_DEBOUNCE_MS);
  const autoCaptureLater = debounce(() => {
    const state = store.getState();
    if (!state.autoCapture) return;
    if (state.status === "loading") return;
    if (!validateUrlShape(input.value).valid) return;
    commit();
    void actions.capture();
  }, AUTO_CAPTURE_IDLE_MS);
  on(input, "input", () => {
    validateLater.run();
    autoCaptureLater.cancel();
    if (store.getState().autoCapture) autoCaptureLater.run();
  });
  on(input, "blur", () => {
    validateLater.cancel();
    commit();
  });
  on(input, "keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    validateLater.cancel();
    autoCaptureLater.cancel();
    commit();
    void actions.capture();
  });
  on(autoToggle, "change", () => {
    const enabled = autoToggle.checked;
    store.setState({
      autoCapture: enabled
    });
    if (!enabled) autoCaptureLater.cancel();
  });
  store.subscribe((state) => {
    if (document.activeElement !== input && input.value !== state.url) {
      input.value = state.url;
    }
    if (autoToggle.checked !== state.autoCapture) autoToggle.checked = state.autoCapture;
  });
  input.value = store.getState().url;
  autoToggle.checked = store.getState().autoCapture;
  setHidden(errorEl, true);
}

// src/client/actions.ts
function createActions(store) {
  return {
    async capture(options = {}) {
      const state = store.getState();
      if (state.status === "loading") return false;
      const check = validateUrlShape(state.url);
      if (!check.valid) {
        store.setState({
          status: "error",
          result: null,
          error: {
            code: "INVALID_URL",
            message: check.reason ?? "Enter a valid http(s) URL"
          }
        });
        return false;
      }
      const format = options.format ?? state.format;
      store.setState({
        status: "loading",
        error: null,
        format
      });
      try {
        const data = await requestScreenshot({
          // Sent as typed (trimmed). The server owns normalization and echoes
          // back both `requestedUrl` and the resolved `url`.
          url: state.url.trim(),
          width: state.width,
          height: state.height,
          format,
          quality: state.quality,
          fullPage: state.fullPage
        });
        await preloadImage(data.image);
        store.setState({
          status: "success",
          result: data,
          error: null
        });
        return true;
      } catch (err) {
        store.setState({
          status: "error",
          result: null,
          error: toStoreError(err)
        });
        return false;
      }
    }
  };
}

// src/client/components/sizeControls.ts
var SIZE_STORAGE_KEY = "urlshot:size";
var SIZE_LIMITS = {
  minWidth: 200,
  maxWidth: 5e3,
  minHeight: 200,
  maxHeight: 2e4
};
var FALLBACK = {
  width: 1280,
  height: 720
};
function getScreenDefaults() {
  const screen = win.screen;
  const width = screen?.width ?? win.innerWidth ?? FALLBACK.width;
  const height = screen?.height ?? win.innerHeight ?? FALLBACK.height;
  return {
    width: Math.round(width) || FALLBACK.width,
    height: Math.round(height) || FALLBACK.height
  };
}
function readStoredSize() {
  try {
    const raw = win.localStorage?.getItem(SIZE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(parsed?.width) || !Number.isFinite(parsed?.height)) return null;
    return {
      width: Math.round(parsed.width),
      height: Math.round(parsed.height)
    };
  } catch {
    return null;
  }
}
function writeStoredSize(size) {
  try {
    win.localStorage?.setItem(SIZE_STORAGE_KEY, JSON.stringify(size));
  } catch {
  }
}
function getInitialSize() {
  return readStoredSize() ?? getScreenDefaults();
}
function describeProblem(size) {
  const { minWidth, maxWidth, minHeight, maxHeight } = SIZE_LIMITS;
  if (!Number.isFinite(size.width) || size.width < minWidth || size.width > maxWidth) {
    return `Width must be between ${minWidth} and ${maxWidth}.`;
  }
  if (!Number.isFinite(size.height) || size.height < minHeight || size.height > maxHeight) {
    return `Height must be between ${minHeight} and ${maxHeight}.`;
  }
  return null;
}
function mountSizeControls(root, store) {
  const widthInput = $("width-input", root);
  const heightInput = $("height-input", root);
  const resetBtn = $("reset-size-btn", root);
  const errorEl = $("dimension-error", root);
  const fullPageToggle = $("fullpage-toggle", root);
  const readInputs = () => ({
    width: Number.parseInt(widthInput.value, 10),
    height: Number.parseInt(heightInput.value, 10)
  });
  const commit = () => {
    const size = readInputs();
    const problem = describeProblem(size);
    setText(errorEl, problem ?? "");
    setHidden(errorEl, problem === null);
    if (problem === null) {
      store.setState(size);
      writeStoredSize(size);
    }
  };
  on(widthInput, "input", commit);
  on(heightInput, "input", commit);
  on(resetBtn, "click", () => {
    const defaults = getScreenDefaults();
    widthInput.value = String(defaults.width);
    heightInput.value = String(defaults.height);
    store.setState(defaults);
    writeStoredSize(defaults);
    setHidden(errorEl, describeProblem(defaults) === null);
  });
  on(fullPageToggle, "change", () => {
    store.setState({
      fullPage: fullPageToggle.checked
    });
  });
  store.subscribe((state) => {
    if (document.activeElement !== widthInput && widthInput.value !== String(state.width)) {
      widthInput.value = String(state.width);
    }
    if (document.activeElement !== heightInput && heightInput.value !== String(state.height)) {
      heightInput.value = String(state.height);
    }
    if (fullPageToggle.checked !== state.fullPage) fullPageToggle.checked = state.fullPage;
  });
  const initial = store.getState();
  widthInput.value = String(initial.width);
  heightInput.value = String(initial.height);
  fullPageToggle.checked = initial.fullPage;
  setHidden(errorEl, describeProblem(initial) === null);
}

// src/client/components/formatSelector.ts
var QUALITY_MIN = 1;
var QUALITY_MAX = 100;
function coerceFormat(value) {
  return value === "jpeg" || value === "jpg" ? "jpeg" : "png";
}
function mountFormatSelector(root, store) {
  const select = $("format-select", root);
  const qualityRow = $("quality-row", root);
  const slider = $("quality-slider", root);
  const valueLabel = $("quality-value", root);
  on(select, "change", () => {
    store.setState({
      format: coerceFormat(select.value)
    });
  });
  on(slider, "input", () => {
    const parsed = Number.parseInt(slider.value, 10);
    if (!Number.isFinite(parsed)) return;
    store.setState({
      quality: Math.min(QUALITY_MAX, Math.max(QUALITY_MIN, parsed))
    });
  });
  const render = (state) => {
    if (select.value !== state.format) select.value = state.format;
    setHidden(qualityRow, state.format !== "jpeg");
    const quality = String(state.quality);
    if (slider.value !== quality) slider.value = quality;
    setText(valueLabel, quality);
  };
  store.subscribe(render);
  render(store.getState());
}

// src/client/components/previewPane.ts
function formatMeta(data) {
  return [
    `${data.width} \xD7 ${data.height}`,
    data.format.toUpperCase(),
    formatKb(data.bytes),
    formatSeconds(data.durationMs)
  ].join(" \xB7 ");
}
function mountPreviewPane(root, store) {
  const empty = $("preview-empty", root);
  const spinner = $("loading-spinner", root);
  const image = $("preview-image", root);
  const meta = $("preview-meta", root);
  const errorEl = $("preview-error", root);
  const render = (state) => {
    const hasResult = state.status === "success" && state.result !== null;
    setHidden(empty, state.status !== "idle");
    setHidden(spinner, state.status !== "loading");
    setHidden(image, !hasResult);
    setHidden(meta, !hasResult);
    setHidden(errorEl, state.status !== "error");
    if (hasResult && state.result) {
      const result = state.result;
      const src = result.image ?? "";
      if (src && image.getAttribute("src") !== src) image.src = src;
      image.alt = `Screenshot of ${result.url}`;
      setText(meta, formatMeta(result));
    } else {
      if (image.hasAttribute("src")) image.removeAttribute("src");
      setText(meta, "");
    }
    if (state.status === "error" && state.error) {
      setText(errorEl, state.error.message);
    }
  };
  store.subscribe(render);
  render(store.getState());
}

// src/client/components/downloadBar.ts
function mountDownloadBar(root, store, actions) {
  const bar = $("download-bar", root);
  const anchor = $("download-btn", root);
  const pngBtn = $("download-png-btn", root);
  const jpegBtn = $("download-jpeg-btn", root);
  const render = (state) => {
    const result = state.status === "success" ? state.result : null;
    setHidden(bar, result === null);
    if (!result) {
      anchor.removeAttribute("href");
      anchor.removeAttribute("download");
      return;
    }
    if (anchor.getAttribute("href") !== result.downloadUrl) anchor.href = result.downloadUrl;
    if (anchor.getAttribute("download") !== result.filename) {
      anchor.setAttribute("download", result.filename);
    }
  };
  const downloadAs = async (format) => {
    const current = store.getState().result;
    if (!current || current.format !== format) {
      const ok = await actions.capture({
        format
      });
      if (!ok) return;
    }
    const href = anchor.getAttribute("href");
    if (href) anchor.click();
  };
  on(pngBtn, "click", () => void downloadAs("png"));
  on(jpegBtn, "click", () => void downloadAs("jpeg"));
  store.subscribe(render);
  render(store.getState());
}

// src/client/components/statusBanner.ts
var LABELS = {
  ready: "Ready",
  starting: "Starting\u2026",
  degraded: "Degraded",
  unreachable: "Unreachable",
  checking: "Checking\u2026"
};
function mountStatusBanner(root, store, actions) {
  const banner = $("status-banner", root);
  const text = $("status-text", root);
  const captureBtn = $("capture-btn", root);
  const setBannerState = (key) => {
    setData(banner, "status", key);
    setText(text, LABELS[key] ?? key);
    setHidden(banner, false);
  };
  const render = (state) => {
    setData(captureBtn, "state", state.status);
    const urlOk = validateUrlShape(state.url).valid;
    const busy = state.status === "loading";
    captureBtn.disabled = busy || !urlOk;
    captureBtn.setAttribute("aria-busy", busy ? "true" : "false");
    setText(captureBtn, busy ? "Capturing\u2026" : "Capture");
  };
  on(captureBtn, "click", () => void actions.capture());
  store.subscribe(render);
  render(store.getState());
  setBannerState("checking");
  void fetchStatus().then((status) => setBannerState(status.status)).catch(() => setBannerState("unreachable"));
}

// src/client/main.ts
function initialState() {
  const { width, height } = getInitialSize();
  return {
    url: "",
    width,
    height,
    format: "png",
    quality: 90,
    fullPage: false,
    // OFF by default: auto-capture means a chromium navigation per typing pause.
    autoCapture: false,
    status: "idle",
    result: null,
    error: null
  };
}
function start() {
  const store = createStore(initialState());
  const actions = createActions(store);
  mountStatusBanner(document, store, actions);
  mountUrlInput(document, store, actions);
  mountSizeControls(document, store);
  mountFormatSelector(document, store);
  mountPreviewPane(document, store);
  mountDownloadBar(document, store, actions);
  globalThis.__APP__ = {
    getState: () => store.getState()
  };
}
start();
