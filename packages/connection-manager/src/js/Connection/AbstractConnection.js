import { EventEmitter } from "events";
import { INIT, STARTED, DONE, CANCELLED } from "./StateConstants";

/**
 * AbstractConnection provides some default properties/methods used by Connection Manager
 *
 * Events which MUST be fired by all SubClasses:
 * OPEN: when the connection actually blocks a pipe
 * CLOSE: when the connection frees its pipe
 * ERROR: when an error occurs
 */
export default class AbstractConnection extends EventEmitter {
  constructor(url) {
    super();

    if (this.constructor === AbstractConnection) {
      throw new Error("Can't instantiate abstract class!");
    }

    if (!url) {
      throw new Error("Can't instantiate without given URL!");
    }
    Object.defineProperty(this, "url", {
      get: () => url
    });

    const created = Date.now();
    Object.defineProperty(this, "created", {
      get: () => created
    });

    let state = INIT;
    Object.defineProperty(this, "state", {
      get: () => state,
      set: _state => {
        if (![INIT, STARTED, DONE, CANCELLED].includes(_state)) {
          throw new Error("Cant set Connection into unknown state.");
        }
        state = _state;
      }
    });

    const symbol = Symbol("Connection:" + this.url + this.created);
    Object.defineProperty(this, "symbol", {
      get: () => symbol
    });
  }
  static get INIT() {
    return INIT;
  }
  static get STARTED() {
    return STARTED;
  }
  static get DONE() {
    return DONE;
  }
  static get CANCELLED() {
    return CANCELLED;
  }

  // Abstract Methods
  /* eslint-disable no-unused-vars */
  /**
   * Opens the connection
   * @param {string} token – Authentication token
   */
  open(token) {}
  /**
   * Closes the connection
   */
  close() {}
  /**
   * Resets the connection
   */
  reset() {}
}
