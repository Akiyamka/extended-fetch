export type XhrEventLoadStart = {
  type: 'loadstart';
  payload: ProgressEvent<EventTarget>;
};

export type XhrEventLoad = {
  type: 'load';
  payload: ProgressEvent<EventTarget>;
};

export type XhrEventLoadEnd = {
  type: 'loadend';
  payload: ProgressEvent<EventTarget>;
};

export type XhrEventProgress = {
  type: 'progress';
  payload: ProgressEvent<EventTarget>;
};

export type XhrEventError = {
  type: 'error';
  payload: ProgressEvent<EventTarget>;
};

export type XhrEventAbort = {
  type: 'abort';
  payload: ProgressEvent<EventTarget>;
};

export type XhrEventTimeout = {
  type: 'timeout';
  payload: ProgressEvent<EventTarget>;
};

export type XhrEvent =
  | XhrEventLoadStart
  | XhrEventLoad
  | XhrEventLoadEnd
  | XhrEventProgress
  | XhrEventError
  | XhrEventAbort
  | XhrEventTimeout;

export type XhrEventListener = (event: XhrEvent) => void;
export type ExtendedFetchPreferences = {
  eventListener?: XhrEventListener
}