export type XhrEventLoadStart = {
  type: 'loadstart';
};

export type XhrEventLoad = {
  type: 'load';
};

export type XhrEventLoadEnd = {
  type: 'loadend';
};

export type XhrEventProgress = {
  type: 'progress';
  payload: unknown;
};

export type XhrEventError = {
  type: 'error';
  payload: Error;
};

export type XhrEventAbort = {
  type: 'abort';
};

export type XhrEvent =
  | XhrEventLoadStart
  | XhrEventLoad
  | XhrEventLoadEnd
  | XhrEventProgress
  | XhrEventError
  | XhrEventAbort;

export type XhrEventListener = (event: XhrEvent) => void;
export type ExtendedFetchPreferences = {
  eventListener?: XhrEventListener
}