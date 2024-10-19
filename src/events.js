import EventEmitter from "eventemitter3";

const Emitter = new EventEmitter();

export function dispatch(id, ...args) {
  Emitter.emit(id, ...args);
}

export function listen(id, callback) {
  const onEvent = (...args) => {
    callback(...args);
  };

  Emitter.addListener(id, onEvent);

  return () => {
    Emitter.removeListener(id, onEvent);
  };
}
