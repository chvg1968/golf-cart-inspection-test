export const isIOS = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';
  
  // Detectar iOS por user agent
  const iosUserAgent = /iphone|ipad|ipod/.test(userAgent);
  
  // Detectar iOS por platform (más confiable en algunos casos)
  const iosPlatform = /iphone|ipad|ipod|mac/.test(platform) && 'ontouchend' in document;
  
  // Detectar iOS 13+ que puede reportarse como Mac
  const ios13Plus = /mac/.test(platform) && 'ontouchend' in document && window.navigator.maxTouchPoints > 1;
  
  return iosUserAgent || iosPlatform || ios13Plus;
};

export const isSafari = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isSafariUA = userAgent.includes("safari") && !userAgent.includes("chrome") && !userAgent.includes("firefox");
  
  // Verificación adicional para Safari en iOS
  const isWebKit = 'WebkitAppearance' in document.documentElement.style;
  const hasTouch = 'ontouchstart' in window;
  
  return isSafariUA || (isIOS() && isWebKit && hasTouch);
};

export const isIOSChrome = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return isIOS() && userAgent.includes("crios");
};

export const isIOSFirefox = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return isIOS() && userAgent.includes("fxios");
};

export const getIOSBrowser = (): 'safari' | 'chrome' | 'firefox' | 'other' => {
  if (!isIOS()) return 'other';
  
  if (isIOSChrome()) return 'chrome';
  if (isIOSFirefox()) return 'firefox';
  if (isSafari()) return 'safari';
  
  return 'other';
};
