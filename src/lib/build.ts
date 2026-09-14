declare const __BUILD_SHA__: string | undefined;

export const BUILD_SHA: string =
  typeof __BUILD_SHA__ !== 'undefined' && __BUILD_SHA__ ? __BUILD_SHA__ : 'dev';