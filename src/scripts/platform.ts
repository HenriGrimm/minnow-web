/* Platform detection for the hero's primary CTA (spec §6.2 §0).
   `navigator.userAgentData` first (accurate, includes the
   `architecture` field); the UA-string fallback covers Safari/Firefox,
   where userAgentData is absent. Apple Silicon is split from Intel —
   the download links differ per arch. */

export type Platform = 'windows' | 'macos-arm' | 'macos-intel' | 'linux' | 'unknown';

interface UADataLike {
  platform?: string;
  architecture?: string;
}

/** A human-readable label for the hero CTA ("Download for macOS", etc.).
 *  macos-arm and macos-intel share the label — the arch only changes the
 *  target of the download link, not what the visitor reads. */
export function platformLabel(platform: Platform): string {
  switch (platform) {
    case 'windows': return 'Download for Windows';
    case 'macos-arm':
    case 'macos-intel': return 'Download for macOS';
    case 'linux': return 'Download for Linux';
    case 'unknown': return 'Download for macOS';
  }
}

export function detectPlatform(): Platform {
  if (typeof navigator !== 'undefined') {
    const data = (navigator as Navigator & { userAgentData?: UADataLike }).userAgentData;
    if (data && typeof data.platform === 'string' && data.platform) {
      const p = data.platform.toLowerCase();
      if (p === 'win32' || p === 'windows') return 'windows';
      if (p === 'macos') {
        // architecture is 'arm' on Apple Silicon, 'x86' on Intel (Chrome).
        const arch = (data.architecture ?? '').toLowerCase();
        return arch === 'arm' || arch === 'arm64' ? 'macos-arm' : 'macos-intel';
      }
      if (p === 'linux') return 'linux';
    }
  }
  if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') return 'unknown';
  const ua = navigator.userAgent;
  // Apple Silicon Macs report "Intel Mac OS X" (the JS runtime is translated
  // on x64), so the arch split is best-effort: M-series Chrome on macOS
  // carries a "Mobile" substring in some builds — treat the plain
  // "Intel Mac OS X" string as Intel, which is the common case.
  if (/iPhone|iPad|iPod/.test(ua)) return 'unknown';
  if (/Mac OS X|Macintosh/.test(ua)) return /arm|silicon/i.test(ua) ? 'macos-arm' : 'macos-intel';
  if (/Windows/.test(ua)) return 'windows';
  if (/Linux|Android/i.test(ua)) return 'linux';
  return 'unknown';
}