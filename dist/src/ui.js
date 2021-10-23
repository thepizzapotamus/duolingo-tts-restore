(function () {
  'use strict';

  "function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout;

  /**
   * A function that does nothing.
   *
   * @returns {void}
   */
  const noop = () => {};
  /**
   * @type {Function}
   * @param {*} value A value.
   * @returns {boolean} Whether the given value is a valid, finite number.
   */

  const isNumber = _arg => {
    return 'number' === typeof _arg && Number.isFinite(_arg);
  };
  /**
   * @type {Function}
   * @param {*} value A value.
   * @returns {boolean} Whether the given value is a string.
   */

  const isString = _arg5 => {
    return 'string' === typeof _arg5;
  };
  /**
   * @type {Function}
   * @param {*} value The tested value.
   * @returns {boolean} Whether the given value is an array.
   */

  const isArray = Array.isArray;
  /**
   * @type {Function}
   * @param {*} value The tested value.
   * @returns {boolean} Whether the given value is an object. This excludes Arrays, but not Dates or RegExps.
   */

  const isObject = _arg2 => {
    return 'object' === typeof _arg2 && !!_arg2 && !isArray(_arg2);
  };
  /**
   * @type {Function}
   * @param {*} value The tested value.
   * @returns {boolean} Whether the given value is a function.
   */

  const isFunction = _arg6 => {
    return 'function' === typeof _arg6;
  };
  /**
   * @type {Function}
   * @param {object} Object The tested object.
   * @param {string} name The name of a property.
   * @returns {boolean} Whether the given object has the specified property as its own.
   */

  const hasObjectProperty = (_arg7, _arg8) => {
    return Object.prototype.hasOwnProperty.call(_arg7, _arg8);
  };
  /**
   * @param {object} object A Plain Old Javascript Object.
   * @returns {boolean} Whether the given object is empty.
   */

  const isEmptyObject = object => {
    for (let key in object) {
      if (hasObjectProperty(object, key)) {
        return false;
      }
    }

    return true;
  };
  /**
   * @param {string} url A URL of any shape.
   * @returns {string} The corresponding path.
   */

  const getUrlPath = url => {
    let path = null;

    if (url.charAt(0) === '/') {
      if (url.charAt(1) === '/') {
        url = `https://${url}`;
      } else {
        path = url;
      }
    }

    if (null === path) {
      try {
        path = new URL(url).pathname;
      } catch (error) {
        path = url;
      }
    }

    return path;
  };

  /**
   * @type {string}
   */

  const UNIQUE_KEY_PREFIX = '__duo-toolbox__-';
  /**
   * @type {Function}
   * @param {string} baseKey A key.
   * @returns {string} The given key, uniquely prefixed.
   */

  const getUniqueKey = _arg => {
    return `${UNIQUE_KEY_PREFIX}${_arg}`;
  };
  /**
   * @type {string}
   */

  const KEY_GLOBAL_VARIABLES = getUniqueKey('global_variables');
  /**
   * @param {string} key A variable key.
   * @param {*=} defaultValue The default value to return if the variable has not been set yet.
   * @returns {*} The value of the given variable.
   */

  const getSharedGlobalVariable = (key, defaultValue) => {
    if (!isObject(window[KEY_GLOBAL_VARIABLES])) {
      window[KEY_GLOBAL_VARIABLES] = {};
    }

    return !hasObjectProperty(window[KEY_GLOBAL_VARIABLES], key) ? defaultValue : window[KEY_GLOBAL_VARIABLES][key];
  };
  /**
   * @param {string} key A variable key.
   * @param {*} value The new variable value.
   * @returns {void}
   */

  const setSharedGlobalVariable = (key, value) => {
    if (!isObject(window[KEY_GLOBAL_VARIABLES])) {
      window[KEY_GLOBAL_VARIABLES] = {};
    }

    window[KEY_GLOBAL_VARIABLES][key] = value;
  };
  /**
   * @param {string} key A variable key.
   * @param {Function} callback A function usable to calculate the new value of the variable, given the old one.
   * @param {*=} defaultValue The default value to use if the variable has not been set yet.
   * @returns {*} The updated value.
   */

  const updateSharedGlobalVariable = (key, callback, defaultValue) => {
    const updatedValue = callback(getSharedGlobalVariable(key, defaultValue));
    setSharedGlobalVariable(key, updatedValue);
    return updatedValue;
  };
  /**
   * @param {string} key They key of a counter.
   * @returns {number} The next value of the counter, starting at 1 if it was not used yet.
   */

  const bumpGlobalCounter = key => updateSharedGlobalVariable(`__counter::${key}__`, _arg2 => {
    return _arg2 + 1;
  }, 0);
  /**
   * @type {string}
   */

  const KEY_PENDING_GLOBAL_LISTENERS = 'pending_global_listeners';
  /**
   * Registers a listener for when a global variable is defined and matches a given predicate.
   *
   * This only has an effect if no up-to-date listener was already registered with the same ID.
   *
   * @param {string} name The name of a global variable.
   * @param {Function} predicate The predicate that the variable must match.
   * @param {Function} callback The function to be called once the variable is defined and matches the predicate.
   * @param {string} listenerId The listener ID.
   * @param {number} listenerVersion The listener version. Only the most recent listener for a given ID will be called.
   * @returns {void}
   */

  const onceGlobalDefined = (name, predicate, callback, listenerId, listenerVersion = 1) => {
    if (hasObjectProperty(window, name) && predicate(window[name])) {
      callback(window[name]);
    } else {
      updateSharedGlobalVariable(KEY_PENDING_GLOBAL_LISTENERS, (listeners = {}) => {
        var _listeners$name$liste;

        if (!listeners[name]) {
          listeners[name] = {};
          let currentValue = window[name]; // Add a getter and a setter on the window to detect when the variable is changed.

          Object.defineProperty(window, name, {
            get: () => currentValue,
            set: value => {
              if (predicate(value)) {
                Object.defineProperty(window, name, {
                  value,
                  configurable: true,
                  enumerable: true,
                  writable: true
                });
                Object.values(listeners[name]).forEach(_it => {
                  return _it.callback(value);
                });
              } else {
                currentValue = value;
              }
            },
            configurable: true
          });
        }

        if (listenerVersion > (Number((_listeners$name$liste = listeners[name][listenerId]) === null || _listeners$name$liste === void 0 ? void 0 : _listeners$name$liste.version) || 0)) {
          listeners[name][listenerId] = {
            callback,
            version: listenerVersion
          };
        }

        return listeners;
      });
    }
  };
  /**
   * @type {string}
   */


  const KEY_ORIGINAL_FUNCTION = getUniqueKey('original_function');
  /**
   * @type {string}
   */

  const KEY_OVERRIDE_VERSION = getUniqueKey('override_version');
  /**
   * Applies an override to a (global) function hosted by a specific object.
   *
   * The override is only applied if necessary, and if the function exists.
   *
   * @param {Object} host The object that hosts the function to override.
   * @param {string} name The name of the function to override.
   * @param {Function} applyOverride A callback responsible for overriding the original function.
   * @param {number} overrideVersion The override version. Only the most recent override will take effect.
   * @returns {void}
   */

  const overrideFunction = (host, name, applyOverride, overrideVersion = 1) => {
    var _host$name;

    if (!isObject(host)) {
      return;
    }

    if (overrideVersion > (Number((_host$name = host[name]) === null || _host$name === void 0 ? void 0 : _host$name[KEY_OVERRIDE_VERSION]) || 0)) {
      var _host$name2;

      const original = ((_host$name2 = host[name]) === null || _host$name2 === void 0 ? void 0 : _host$name2[KEY_ORIGINAL_FUNCTION]) || host[name] || noop;
      host[name] = applyOverride(original);
      host[name][KEY_ORIGINAL_FUNCTION] = original;
      host[name][KEY_OVERRIDE_VERSION] = overrideVersion;
    }
  };
  /**
   * Applies an override to an instance method belonging to an interface available in the global (window) scope.
   *
   * The override is only applied if necessary, once the interface is defined, and if the method exists.
   *
   * @param {string} constructorName The name of the constructor whose prototype holds the method to override.
   * @param {string} methodName The name of the instance method to override.
   * @param {Function} applyOverride A callback responsible for overriding the original method.
   * @param {number} overrideVersion The override version. More recent overrides take precedence over older ones.
   * @returns {void}
   */

  const overrideInstanceMethod = (constructorName, methodName, applyOverride, overrideVersion = 1) => onceGlobalDefined(constructorName, isFunction, _arg4 => {
    return overrideFunction(_arg4 === null || _arg4 === void 0 ? void 0 : _arg4.prototype, methodName, applyOverride, overrideVersion);
  }, `instance_method:${methodName}`, overrideVersion);
  /**
   * Applies an override to the descriptor of an object property.
   *
   * The override is only applied if necessary. If the property does not exist yet, it will be initialized.
   *
   * @param {object} host The object that owns the property to override.
   * @param {string} name The name of the property to override.
   * @param {Function} applyOverride A callback responsible for overriding the original property descriptor.
   * @param {number} overrideVersion The override version. Only the most recent override will take effect.
   * @returns {void}
   */

  const overrideOwnPropertyDescriptor = (host, name, applyOverride, overrideVersion = 1) => {
    if (!isObject(host)) {
      return;
    }

    const overrideKey = getUniqueKey(`${name}_override_version`);

    if (overrideVersion > (Number(host[overrideKey]) || 0)) {
      Object.defineProperty(host, name, applyOverride(Object.getOwnPropertyDescriptor(host, name)));
    }
  };
  /**
   * @type {string}
   */

  const TOOLBOX_IFRAME_ID = getUniqueKey('logging_iframe');
  /**
   * @returns {HTMLElement}
   * An iframe element usable to access features that may not be accessible from the current context,
   * including (but not limited to) working logging methods and listening of localStorage changes.
   */

  const getToolboxIframe = () => {
    let toolboxIframe = document.getElementById(TOOLBOX_IFRAME_ID);

    if (!toolboxIframe || !toolboxIframe.isConnected) {
      toolboxIframe = document.createElement('iframe');
      toolboxIframe.id = TOOLBOX_IFRAME_ID;
      toolboxIframe.style.display = 'none';
      document.body.appendChild(toolboxIframe);
    }

    return toolboxIframe;
  };

  /**
   * @returns {Object} A console usable for logging data.
   */

  const getLoggingConsole = () => getToolboxIframe().contentWindow.console;
  /**
   * @param {...*} data The error data to log.
   * @returns {void}
   */

  const logError = (...data) => getLoggingConsole().error(...data);

  /**
   * @type {string}
   */
  /**
   * @param {object} challenge A challenge.
   * @returns {string} The language used by the statement of the challenge.
   */

  const getChallengeSourceLanguage = challenge => {
    var _challenge$metadata, _challenge$metadata2;

    return ((_challenge$metadata = challenge.metadata) === null || _challenge$metadata === void 0 ? void 0 : _challenge$metadata.source_language) || challenge.sourceLanguage || ((_challenge$metadata2 = challenge.metadata) === null || _challenge$metadata2 === void 0 ? void 0 : _challenge$metadata2.learning_language);
  };
  /**
   * @param {object} challenge A challenge.
   * @returns {string} The language used by the solution of the challenge.
   */

  const getChallengeTargetLanguage = challenge => {
    var _challenge$metadata3;

    return ((_challenge$metadata3 = challenge.metadata) === null || _challenge$metadata3 === void 0 ? void 0 : _challenge$metadata3.target_language) || challenge.targetLanguage || getChallengeSourceLanguage(challenge);
  };

  /**
   * @type {string}
   */

  const SOUND_TYPE_EFFECT = 'effect';
  /**
   * @type {string}
   */

  const SOUND_TYPE_TTS_SENTENCE = 'tts_sentence';
  /**
   * @type {string}
   */

  const SOUND_TYPE_TTS_WORD = 'tts_word';
  /**
   * @type {string}
   */

  const SOUND_TYPE_UNKNOWN = 'unknown';
  /**
   * @type {string}
   */

  const SOUND_SPEED_NORMAL = 'normal';
  /**
   * @type {string}
   */

  const SOUND_SPEED_SLOW = 'slow';
  /**
   * @type {string}
   */

  const SOUND_PLAYBACK_STRATEGY_AUDIO = 'audio';
  /**
   * @type {string}
   */

  const SOUND_PLAYBACK_STRATEGY_HOWLER = 'howler';
  /**
   * @type {string}
   */

  const SOUND_SETTING_RATE = 'rate';
  /**
   * @type {string}
   */

  const SOUND_SETTING_VOLUME = 'volume';
  /**
   * @type {string}
   */

  const FORCED_SETTING_KEY = getUniqueKey('forced_setting');
  /**
   * @param {*} value A setting value that was passed to a setter.
   * @returns {boolean} Whether the value is a forced setting value.
   */

  const isForcedSettingValue = value => isObject(value) && !!value[FORCED_SETTING_KEY];
  /**
   * @type {Function}
   * @param {object} forcedValue A forced setting value.
   * @returns {number} The corresponding base value.
   */


  const getForcedSettingBaseValue = _arg6 => {
    return _arg6.value;
  };
  /**
   * @type {Function}
   * @param {number} A base setting value.
   * @returns {object} The given value, wrapped in a layer that identifies it as a forced value.
   */


  const wrapForcedSettingBaseValue = _arg7 => {
    return {
      [FORCED_SETTING_KEY]: true,
      value: _arg7
    };
  };
  /**
   * @param {string} code The code of a sound setting.
   * @param {*} value A value for the given setting.
   * @returns {boolean} Whether the value is suitable for being applied to a "Howl" object from the "howler.js" library.
   */


  const isValidHowlSettingValue = (code, value) => SOUND_SETTING_RATE === code && isNumber(value) || SOUND_SETTING_VOLUME === code && value >= 0 && value <= 1;
  /**
   * Applies the necessary overrides to ensure that the forced setting values on "Audio" objects are correctly handled,
   * and reapplied / recalculated whenever necessary.
   *
   * @param {string} code The code of a sound setting.
   * @param {string} propertyName The name of the corresponding property on "Audio" objects.
   * @returns {void}
   */


  const applyAudioSettingPropertyOverride = (code, propertyName) => overrideOwnPropertyDescriptor(HTMLMediaElement, propertyName, originalDescriptor => ({ ...originalDescriptor,
    set: function (value) {
      const setting = SOUND_SETTINGS[code];

      if (isNumber(value)) {
        this[setting.originalValueKey] = value;

        if (hasObjectProperty(this, setting.valueKey)) {
          if (!this[setting.isRelativeKey]) {
            value = this[setting.valueKey];
          } else {
            value = clampSoundSettingValue(code, value * this[setting.valueKey]);
          }
        }
      } else if (isForcedSettingValue(value)) {
        value = getForcedSettingBaseValue(value);
      }

      if (isNumber(value)) {
        this[setting.listenerValueKey] = value;
      }

      originalDescriptor.set.call(this, value);
    }
  }));
  /**
   * Applies the necessary overrides to ensure that the forced setting values on "Howl" objects are correctly handled,
   * and reapplied / recalculated whenever necessary.
   *
   * @param {string} code The code of a sound setting.
   * @param {string} functionName The name of the function usable to manage the setting for "Howl" objects.
   * @returns {void}
   */


  const applyHowlSettingFunctionOverride = (code, functionName) => overrideInstanceMethod('Howl', functionName, originalHowlSetter => function () {
    const self = this;
    const args = arguments;
    const setting = SOUND_SETTINGS[code];
    let isForcedValueUpdate = false;
    const originalQueueSize = self._queue.length;

    if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
      if (self._getSoundIds().indexOf(args[0]) === -1) {
        if (isForcedSettingValue(args[0])) {
          isForcedValueUpdate = true;
          args[0] = getForcedSettingBaseValue(args[0]);
        } else if (isValidHowlSettingValue(code, args[0])) {
          self[setting.originalValueKey] = args[0];

          if (hasObjectProperty(self, setting.valueKey)) {
            isForcedValueUpdate = true;

            if (!self[setting.isRelativeKey]) {
              args[0] = self[setting.valueKey];
            } else {
              args[0] = clampSoundSettingValue(code, args[0] * self[setting.valueKey]);
            }
          }
        }

        if (isForcedValueUpdate) {
          self[setting.listenerValueKey] = args[0];
        }
      }
    }

    const result = originalHowlSetter.apply(self, arguments);

    if (isForcedValueUpdate && originalQueueSize < self._queue.length) {
      self._queue[self._queue.length - 1].action = function () {
        args[0] = wrapForcedSettingBaseValue(args[0]);
        self[functionName](...args);
      };
    }

    return result;
  });
  /**
   * @param {string} code The code of a sound setting.
   * @param {string} audioPropertyName The name of the corresponding property on "Audio" objects.
   * @param {string} howlFunctionName The name of the corresponding function on "Howl" objects.
   * @param {object} baseConfig The base configuration data for the setting.
   * @returns {object} Full configuration data for the given setting.
   */


  const prepareSoundSettingConfig = (code, audioPropertyName, howlFunctionName, baseConfig) => ({ ...baseConfig,
    functions: {
      [SOUND_PLAYBACK_STRATEGY_AUDIO]: {
        applyOverride: () => applyAudioSettingPropertyOverride(code, howlFunctionName),
        getter: _arg8 => {
          return _arg8[audioPropertyName];
        },
        setter: (_arg9, _arg10) => {
          return _arg9[audioPropertyName] = _arg10;
        },
        hasQueuedUpdate: () => false
      },
      [SOUND_PLAYBACK_STRATEGY_HOWLER]: {
        applyOverride: () => applyHowlSettingFunctionOverride(code, howlFunctionName),
        getter: _arg11 => {
          return _arg11[howlFunctionName]();
        },
        setter: (_it, _arg12) => {
          return _it[howlFunctionName](_arg12);
        },
        hasQueuedUpdate: _it3 => {
          return _it3._queue.find(_it3 => {
            return _it3.event === howlFunctionName;
          });
        }
      }
    },
    priorityKey: getUniqueKey(`${code}_priority`),
    isRelativeKey: getUniqueKey(`${code}_is_relative`),
    valueKey: getUniqueKey(`forced_${code}_value`),
    originalValueKey: getUniqueKey(`original_${code}_value`),
    listenerValueKey: getUniqueKey(`${code}_value`) // This value is used for compatibility with old versions.

  });
  /**
   * @type {Object}
   */


  const SOUND_SETTINGS = {
    [SOUND_SETTING_RATE]: prepareSoundSettingConfig(SOUND_SETTING_RATE, 'playbackRate', 'rate', {
      minValue: 0.5,
      maxValue: 4.0,
      defaultValue: 1.0
    }),
    [SOUND_SETTING_VOLUME]: prepareSoundSettingConfig(SOUND_SETTING_VOLUME, 'volume', 'volume', {
      minValue: 0.0,
      maxValue: 1.0,
      defaultValue: 1.0
    })
  };
  /**
   * @param {string} code The code of a sound setting.
   * @param {number} value A value for the given setting.
   * @returns {number} The given value, clamped if necessary.
   */

  const clampSoundSettingValue = (code, value) => !SOUND_SETTINGS[code] ? value : Math.max(SOUND_SETTINGS[code].minValue, Math.min(value, SOUND_SETTINGS[code].maxValue));

  /**
   * @type {string}
   */

  const KEY_EVENT_LISTENERS = 'event_listeners';
  /**
   * @returns {string} A unique ID usable for an event listener.
   */

  const getUniqueEventListenerId = () => `__listener::${bumpGlobalCounter('last_event_listener_id')}__`;
  /**
   * @type {Function}
   * @param {string} event An event type.
   * @returns {Object<string, Function[]>} The registered listeners for the given event type.
   */


  const getEventListeners = _arg5 => {
    var _getSharedGlobalVaria;

    return ((_getSharedGlobalVaria = getSharedGlobalVariable(KEY_EVENT_LISTENERS, {})) === null || _getSharedGlobalVaria === void 0 ? void 0 : _getSharedGlobalVaria[_arg5]) || {};
  };
  /**
   * @param {string} event An event type.
   * @param {Object<string, Function[]>} listeners The new set of listeners for the given event type.
   * @returns {void}
   */


  const setEventListeners = (event, listeners) => {
    updateSharedGlobalVariable(KEY_EVENT_LISTENERS, _arg6 => {
      return Object.assign(_arg6 || {}, {
        [event]: listeners
      });
    });
  };
  /**
   * @type {Function}
   * @param {string} event An event type.
   * @returns {boolean} Whether any listener is registered for the given event type.
   */


  const hasEventListeners = !isEmptyObject(_arg7 => {
    return getEventListeners(_arg7);
  });
  /**
   * @type {Function}
   * @param {string} event An event type.
   * @param {string} listenerId A listener ID.
   * @returns {boolean} Whether a listener with the given ID was registered for the given event type.
   */

  const hasEventListener = (_arg8, _arg9) => {
    return !!getEventListeners(_arg8)[_arg9];
  };
  /**
   * @param {string} event An event type.
   * @param {Function} callback The function to be called with the listeners registered for the given event type.
   * @returns {*|null} The result of the callback, if any listener exists for the given event type. Otherwise, null.
   */


  const withEventListeners = (event, callback) => {
    const listeners = getEventListeners(event);
    return isEmptyObject(listeners) ? null : callback(Object.values(listeners));
  };
  /**
   * Registers a new listener for some event type.
   *
   * If a listener with the same ID already exists for the given event type, it will be replaced.
   *
   * @param {string} event An event type.
   * @param {Function} callback The function to be called with the event payload when a matching event is dispatched.
   * @param {string=} listenerId The listener ID.
   * @returns {Function} A function usable to unregister the listener.
   */


  const registerEventListener = (event, callback, listenerId = getUniqueEventListenerId()) => {
    const listeners = getEventListeners(event);
    listeners[listenerId] = callback;
    setEventListeners(event, listeners);
    return () => unregisterEventListener(event, listenerId);
  };
  /**
   * Registers a new listener for some event type, derived from another base event type.
   *
   * If a listener with the same ID already exists for the given derived event type, it will be replaced.
   *
   * @param {string} derivedEvent The derived event type.
   * @param {string} baseEvent The base event type.
   * @param {Function} derivedCallback
   * The function to be called with the event payload when a matching derived event is dispatched.
   * @param {Function} mapPayload
   * The function usable to map the payloads of base events to the payloads of derived events.
   * This function must return an array of arguments, or anything else if the derived event should not be dispatched.
   * @param {Function=} registerBaseListener
   * The function usable to register the shared listener for base events, when necessary, given:
   * - the base event type,
   * - a callback,
   * - a listener ID.
   * @param {string=} derivedListenerId The ID of the listener for derived events.
   * @returns {Function} A function usable to unregister the listener for derived events.
   */


  const registerDerivedEventListener = (derivedEvent, baseEvent, derivedCallback, mapPayload, registerBaseListener = registerEventListener, derivedListenerId = getUniqueEventListenerId()) => {
    const baseListenerId = `__${baseEvent}::${derivedEvent}__`;

    if (!hasEventListener(baseEvent, baseListenerId)) {
      registerBaseListener(baseEvent, (...payload) => {
        const derivedPayload = mapPayload(...payload);
        isArray(derivedPayload) && dispatchEvent(derivedEvent, ...derivedPayload);
      }, baseListenerId);
    }

    const unregisterDerived = registerEventListener(derivedEvent, derivedCallback, derivedListenerId);
    return () => {
      unregisterDerived();

      if (!hasEventListeners(derivedEvent)) {
        unregisterEventListener(baseEvent, baseListenerId);
      }
    };
  };
  /**
   * @param {string} event An event type.
   * @param {string} listenerId A listener ID.
   * @returns {void}
   */


  const unregisterEventListener = (event, listenerId) => {
    const listeners = getEventListeners(event);
    delete listeners[listenerId];
    setEventListeners(event, listeners);
  };
  /**
   * @type {Function}
   * @param {string} event The event type.
   * @param {...*} payload The event payload.
   * @returns {Array|null} The results of calling the registered listeners, if there is any. Otherwise, null.
   */


  const dispatchEvent = (event, ...payload) => withEventListeners(event, listeners => listeners.flatMap(listener => {
    try {
      return [listener(...payload)];
    } catch (error) {
      return [];
    }
  }));
  /**
   * @type {string}
   */


  const EVENT_TYPE_USER_DATA_LOADED = 'user_data_loaded';
  /**
   * @type {string}
   */

  const EVENT_TYPE_PRACTICE_SESSION_LOADED = 'practice_session_loaded';
  /**
   * @type {string}
   */

  const EVENT_TYPE_PRACTICE_CHALLENGES_LOADED = 'practice_challenges_loaded';
  /**
   * @type {string}
   */

  const EVENT_TYPE_STORY_LOADED = 'story_loaded';
  /**
   * @type {string}
   */

  const EVENT_TYPE_FORUM_DISCUSSION_LOADED = 'forum_discussion_loaded';
  /**
   * @type {string}
   */

  const EVENT_TYPE_DICTIONARY_LEXEME_LOADED = 'dictionary_lexeme_loaded';
  /**
   * @type {string}
   */

  const EVENT_TYPE_SOUND_INITIALIZED = 'sound_initialized';
  /**
   * @type {string}
   */

  const EVENT_TYPE_SOUND_PLAYBACK_REQUESTED = 'sound_playback_requested';
  /**
   * @type {string}
   */

  const EVENT_TYPE_SOUND_PLAYBACK_CONFIRMED = 'sound_playback_confirmed';
  /**
   * @type {string}
   */

  const EVENT_TYPE_SOUND_PLAYBACK_CANCELLED = 'sound_playback_cancelled';
  /**
   * @type {object<string, RegExp>}
   */

  const XHR_REQUEST_EVENT_URL_REGEXPS = {
    [EVENT_TYPE_DICTIONARY_LEXEME_LOADED]: /\/api\/1\/dictionary_page/g,
    [EVENT_TYPE_FORUM_DISCUSSION_LOADED]: /\/comments\/([\d]+)/g,
    [EVENT_TYPE_PRACTICE_SESSION_LOADED]: /\/[\d]{4}-[\d]{2}-[\d]{2}\/sessions/g,
    [EVENT_TYPE_STORY_LOADED]: /\/api2\/stories/g,
    [EVENT_TYPE_USER_DATA_LOADED]: /\/[\d]{4}-[\d]{2}-[\d]{2}\/users\/[\d]+/g
  };
  /**
   * @param {string} event An event type based on XHR requests to some specific URLs.
   * @param {Function} callback The function to be called with the response data, when a matching request is made.
   * @param {string=} listenerId The listener ID.
   * @returns {Function} A function usable to unregister the listener.
   */

  const registerXhrRequestEventListener = (event, callback, listenerId = getUniqueEventListenerId()) => {
    overrideInstanceMethod('XMLHttpRequest', 'open', originalXhrOpen => function (method, url, async, user, password) {
      let event;

      for (const [requestEvent, urlRegExp] of Object.entries(XHR_REQUEST_EVENT_URL_REGEXPS)) {
        if (url.match(urlRegExp)) {
          event = requestEvent;
          break;
        }
      }

      if (event) {
        withEventListeners(event, listeners => {
          this.addEventListener('load', () => {
            try {
              const data = isObject(this.response) ? this.response : JSON.parse(this.responseText);
              listeners.forEach(_it => {
                return _it(data);
              });
            } catch (error) {
              logError(error, `Could not handle the XHR result (event: ${event}): `);
            }
          });
        });
      }

      return originalXhrOpen.call(this, method, url, async, user, password);
    });
    return registerEventListener(event, callback, listenerId);
  };
  /**
   * @type {Function}
   * @param {Function} callback The function to be called with the response data when a story is loaded.
   * @returns {Function} A function usable to stop being notified of newly loaded stories.
   */

  const onStoryLoaded = _arg12 => {
    return registerXhrRequestEventListener(EVENT_TYPE_STORY_LOADED, _arg12);
  };
  /**
   * @type {Function}
   * @param {Function} callback The function to be called with the response data when a forum discussion is loaded.
   * @returns {Function} A function usable to stop being notified of newly loaded forum discussions.
   */

  const onForumDiscussionLoaded = _arg13 => {
    return registerXhrRequestEventListener(EVENT_TYPE_FORUM_DISCUSSION_LOADED, _arg13);
  };
  /**
   * @type {Function}
   * @param {Function} callback The function to be called with the response data when a dictionary lexeme is loaded.
   * @returns {Function} A function usable to stop being notified of newly loaded dictionary lexemes.
   */

  const onDictionaryLexemeLoaded = _arg14 => {
    return registerXhrRequestEventListener(EVENT_TYPE_DICTIONARY_LEXEME_LOADED, _arg14);
  };
  /**
   * @type {Function}
   * @param {Function} callback The function to be called with the challenges data when a practice session is loaded.
   * @returns {Function} A function usable to stop being notified of newly loaded challenges.
   */

  const onPracticeChallengesLoaded = _arg16 => {
    return registerDerivedEventListener(EVENT_TYPE_PRACTICE_CHALLENGES_LOADED, EVENT_TYPE_PRACTICE_SESSION_LOADED, _arg16, sessionData => {
      let payload;

      if (isObject(sessionData)) {
        var _sessionData$adaptive;

        const challenges = [sessionData.challenges, sessionData.adaptiveChallenges, (_sessionData$adaptive = sessionData.adaptiveInterleavedChallenges) === null || _sessionData$adaptive === void 0 ? void 0 : _sessionData$adaptive.challenges].filter(isArray).flat();
        const sessionMetaData = sessionData.metadata || {};
        payload = [{
          challenges,
          sessionMetaData
        }];
      }

      return payload;
    }, registerXhrRequestEventListener);
  };
  /**
   * @typedef {Object} SoundData
   * @property {string} url The URL of the sound (that may be of any shape).
   * @property {string} type The type of the sound.
   * @property {string} speed The speed of the sound.
   * @property {string|null} language The language of the sound, in case of a sentence / word.
   */

  /**
   * @param {string} url The URL of the effect sound.
   * @returns {SoundData} Relevant data about the given sound.
   */

  const getEffectSoundData = url => ({
    url,
    type: SOUND_TYPE_EFFECT,
    speed: SOUND_SPEED_NORMAL,
    language: null
  });
  /**
   * @param {string} url The URL of the sentence sound.
   * @param {string} language The language of the sentence.
   * @returns {SoundData} Relevant data about the given sound.
   */


  const getNormalSentenceSoundData = (url, language) => ({
    url,
    type: SOUND_TYPE_TTS_SENTENCE,
    speed: SOUND_SPEED_NORMAL,
    language
  });
  /**
   * @param {string} url The URL of the sentence sound.
   * @param {string} language The language of the sentence.
   * @returns {SoundData} Relevant data about the given sound.
   */


  const getSlowSentenceSoundData = (url, language) => ({
    url,
    type: SOUND_TYPE_TTS_SENTENCE,
    speed: SOUND_SPEED_SLOW,
    language
  });
  /**
   * @param {string} url The URL of the word sound.
   * @param {string} language The language of the word.
   * @returns {SoundData} Relevant data about the given sound.
   */


  const getNormalWordSoundData = (url, language) => ({
    url,
    type: SOUND_TYPE_TTS_WORD,
    speed: SOUND_SPEED_NORMAL,
    language
  });
  /**
   * @type {Object<string, SoundData>}
   */


  const DEFAULT_SOUNDS_DATA_MAP = Object.fromEntries(['/sounds/7abe057dc8446ad325229edd6d8fd250.mp3', '/sounds/2aae0ea735c8e9ed884107d6f0a09e35.mp3', '/sounds/421d48c53ad6d52618dba715722278e0.mp3', '/sounds/37d8f0b39dcfe63872192c89653a93f6.mp3', '/sounds/0a27c1ee63dd220647e8410a0029aed2.mp3', '/sounds/a28ff0a501ef5f33ca78c0afc45ee53e.mp3', '/sounds/2e4669d8cf839272f0731f8afa488caf.mp3', '/sounds/f0b6ab4396d5891241ef4ca73b4de13a.mp3'].map(path => [path, getEffectSoundData(path)]));
  /**
   * @type {RegExp}
   */

  const URL_REGEXP_TTS_TOKEN = /\/duolingo-data\/tts\/(?<language>[a-z-_]+)\/token\//i;
  /**
   * @type {string}
   */

  const KEY_SOUNDS_DATA_MAP = 'sound_type_map';
  /**
   * @type {string}
   */

  const KEY_IS_HOWLER_USED = 'is_howler_used';
  /**
   * @returns {Object<string, SoundData>} Relevant data about all the detected sounds, by path on the corresponding CDNs.
   */

  const getSoundsDataMap = () => getSharedGlobalVariable(KEY_SOUNDS_DATA_MAP, DEFAULT_SOUNDS_DATA_MAP);
  /**
   * @param {string} path The path of a sound on its CDN.
   * @returns {SoundData|null} Relevant data about the given sound, if it was loaded and detected.
   */


  const getSoundData = path => {
    const soundData = getSoundsDataMap()[path];

    if (isObject(soundData)) {
      return soundData;
    }

    const tokenMatches = path.match(URL_REGEXP_TTS_TOKEN);

    if (tokenMatches) {
      return getNormalWordSoundData(path, tokenMatches.language);
    }

    return null;
  };
  /**
   * @param {SoundData[]} newData New data about a set of sounds.
   * @returns {void}
   */


  const registerSoundsData = newData => {
    const soundsData = getSoundsDataMap() || {};

    for (const soundData of newData) {
      soundsData[getUrlPath(soundData.url)] = soundData;
    }

    setSharedGlobalVariable(KEY_SOUNDS_DATA_MAP, soundsData);
  };
  /**
   * @type {string}
   */


  const KEY_SOUND_DETECTION_UNREGISTRATION_CALLBACKS = 'sound_detection_unregistration_callbacks';
  /**
   * @param {Object} sound The configuration of a speaker sound.
   * @param {string} type The type of the sound.
   * @param {string} language The language of the sound.
   * @returns {SoundData} Relevant data about the given sound.
   */

  const getSpeakerSoundData = (sound, type, language) => {
    var _sound$speed;

    return {
      url: sound.url,
      type,
      speed: ((_sound$speed = sound.speed) === null || _sound$speed === void 0 ? void 0 : _sound$speed.value) || SOUND_SPEED_NORMAL,
      language
    };
  };
  /**
   * @param {Array} challenges A list of challenges.
   * @returns {void}
   */


  const registerPracticeChallengesSoundsData = challenges => {
    const challengeSounds = [];

    for (const challenge of challenges) {
      var _challenge$metadata;

      const sourceLanguage = getChallengeSourceLanguage(challenge);
      const targetLanguage = getChallengeTargetLanguage(challenge);

      if (isString(challenge.tts)) {
        // The challenge statement.
        challengeSounds.push(getNormalSentenceSoundData(challenge.tts, sourceLanguage));
      }

      if (isString(challenge.slowTts)) {
        // The challenge statement, slowed down.
        challengeSounds.push(getSlowSentenceSoundData(challenge.slowTts, sourceLanguage));
      }

      if (isString(challenge.solutionTts)) {
        // The challenge solution.
        challengeSounds.push(getNormalSentenceSoundData(challenge.solutionTts, targetLanguage));
      }

      if (isArray(challenge.choices)) {
        // The possible choices for MCQ-like challenges, or the available words for the word banks.
        challengeSounds.push(challenge.choices.map(_it3 => {
          return _it3 === null || _it3 === void 0 ? void 0 : _it3.tts;
        }).filter(isString).map(_arg17 => {
          return getNormalWordSoundData(_arg17, targetLanguage);
        }));
      }

      if (isArray(challenge.tokens)) {
        // The words that make up the statement for most types of challenges.
        challengeSounds.push(challenge.tokens.map(_it4 => {
          return _it4 === null || _it4 === void 0 ? void 0 : _it4.tts;
        }).filter(isString).map(_arg18 => {
          return getNormalWordSoundData(_arg18, sourceLanguage);
        }));
      }

      if (isArray(challenge.questionTokens)) {
        // The words that make up the statement for the listening comprehension challenges.
        challengeSounds.push(challenge.questionTokens.map(_it5 => {
          return _it5 === null || _it5 === void 0 ? void 0 : _it5.tts;
        }).filter(isString).map(_arg19 => {
          return getNormalWordSoundData(_arg19, targetLanguage);
        }));
      }

      if (isArray((_challenge$metadata = challenge.metadata) === null || _challenge$metadata === void 0 ? void 0 : _challenge$metadata.speakers)) {
        // The sentences (and corresponding words) that make up a dialogue, voiced  by different speakers.
        for (const speaker of challenge.metadata.speakers) {
          var _speaker$tts, _speaker$tts2;

          if (isObject((_speaker$tts = speaker.tts) === null || _speaker$tts === void 0 ? void 0 : _speaker$tts.tokens)) {
            challengeSounds.push(Object.values(speaker.tts.tokens).filter(_arg20 => {
              return isString(_arg20.url);
            }).map(_arg21 => {
              return getSpeakerSoundData(_arg21, SOUND_TYPE_TTS_WORD, targetLanguage);
            }));
          }

          if (isArray((_speaker$tts2 = speaker.tts) === null || _speaker$tts2 === void 0 ? void 0 : _speaker$tts2.sentence)) {
            challengeSounds.push(speaker.tts.sentence.filter(_arg22 => {
              return isString(_arg22.url);
            }).map(_arg23 => {
              return getSpeakerSoundData(_arg23, SOUND_TYPE_TTS_SENTENCE, targetLanguage);
            }));
          }
        }
      }

      if (isArray(challenge.pairs)) {
        // The pairs of characters or words for matching challenges.
        challengeSounds.push(challenge.pairs.map(_it6 => {
          return _it6 === null || _it6 === void 0 ? void 0 : _it6.tts;
        }).filter(isString).map(_arg24 => {
          return getNormalWordSoundData(_arg24, targetLanguage);
        }));
      } // The "dialogue" data seems to be redundant with the "metadata.speakers" data, while less complete.

    }

    registerSoundsData(challengeSounds.flat());
  };
  /**
   * @param {object} story A story.
   * @returns {void}
   */


  const registerStorySoundsData = story => {
    const _ref = story.learningLanguage;
    isArray(story.elements) && registerSoundsData(story.elements.map(_it7 => {
      var _it7$line;

      return (_it7 === null || _it7 === void 0 ? void 0 : (_it7$line = _it7.line) === null || _it7$line === void 0 ? void 0 : _it7$line.content) || (_it7 === null || _it7 === void 0 ? void 0 : _it7.learningLanguageTitleContent);
    }).flatMap(_arg => {
      return [_arg === null || _arg === void 0 ? void 0 : _arg.audio, _arg === null || _arg === void 0 ? void 0 : _arg.audioPrefix, _arg === null || _arg === void 0 ? void 0 : _arg.audioSuffix];
    }).map(_it8 => {
      return _it8 === null || _it8 === void 0 ? void 0 : _it8.url;
    }).filter(isString).map(_arg25 => {
      return getNormalSentenceSoundData(_arg25, _ref);
    }));
  };
  /**
   * @param {object} discussion A forum discussion.
   * @returns {void}
   */


  const registerForumDiscussionSoundsData = discussion => {
    isString(discussion.tts_url) && registerSoundsData([getNormalSentenceSoundData(discussion.tts_url, discussion.sentence_language)]);
  };
  /**
   * @param {object} lexeme A dictionary lexeme.
   * @returns {void}
   */


  const registerDictionaryLexemeSoundsData = lexeme => {
    const lexemeSounds = [];
    const lexemeLanguage = lexeme.learning_language;

    if (isString(lexeme.tts)) {
      lexemeSounds.push(getNormalWordSoundData(lexeme.tts, lexemeLanguage));
    }

    if (isArray(lexeme.alternative_forms)) {
      lexemeSounds.push(lexeme.alternative_forms.map(_it9 => {
        return _it9 === null || _it9 === void 0 ? void 0 : _it9.tts;
      }).filter(isString).map(_arg26 => {
        return getNormalSentenceSoundData(_arg26, lexemeLanguage);
      }));
    }

    registerSoundsData(lexemeSounds.flat());
  };
  /**
   * Registers the event listeners required for detecting the sounds used for TTS sentences and words, if necessary.
   *
   * @returns {void}
   */


  const registerSoundDetectionListeners = () => {
    if (!getSharedGlobalVariable(KEY_SOUND_DETECTION_UNREGISTRATION_CALLBACKS)) {
      setSharedGlobalVariable(KEY_SOUND_DETECTION_UNREGISTRATION_CALLBACKS, [onStoryLoaded(_arg27 => {
        return registerStorySoundsData(_arg27);
      }), onForumDiscussionLoaded(_arg28 => {
        return registerForumDiscussionSoundsData(_arg28);
      }), onDictionaryLexemeLoaded(_arg29 => {
        return registerDictionaryLexemeSoundsData(_arg29);
      }), onPracticeChallengesLoaded(_arg30 => {
        return registerPracticeChallengesSoundsData(_arg30.challenges);
      })]);
    }
  };
  /**
   * Unregisters the event listeners dedicated to detecting the sounds used for TTS sentences and words,
   * if all the listeners for sound playback events have also been unregistered.
   *
   * @returns {void}
   */


  const unregisterUnusedSoundDetectionListeners = () => {
    const unregistrationCallbacks = getSharedGlobalVariable(KEY_SOUND_DETECTION_UNREGISTRATION_CALLBACKS);

    if (isArray(unregistrationCallbacks) && !hasEventListeners(EVENT_TYPE_SOUND_INITIALIZED) && !hasEventListeners(EVENT_TYPE_SOUND_PLAYBACK_REQUESTED) && !hasEventListeners(EVENT_TYPE_SOUND_PLAYBACK_CANCELLED) && !hasEventListeners(EVENT_TYPE_SOUND_PLAYBACK_CONFIRMED)) {
      unregistrationCallbacks.forEach(_it10 => {
        return _it10();
      });
      setSharedGlobalVariable(KEY_SOUND_DETECTION_UNREGISTRATION_CALLBACKS, null);
    }
  };
  /**
   * @param {*} sound A sound object, whose type depends on the playback strategy.
   * @param {string} url The sound URL.
   * @param {string} playbackStrategy The strategy used for playing the sound.
   * @returns {Object} The payload usable for events related to the given sound.
   */


  const getSoundEventPayload = (sound, url, playbackStrategy) => {
    const soundData = getSoundData(getUrlPath(url));
    return {
      url,
      type: (soundData === null || soundData === void 0 ? void 0 : soundData.type) || SOUND_TYPE_UNKNOWN,
      speed: (soundData === null || soundData === void 0 ? void 0 : soundData.speed) || SOUND_SPEED_NORMAL,
      language: soundData === null || soundData === void 0 ? void 0 : soundData.language,
      playbackStrategy,
      sound
    };
  };
  /**
   * @param {*} sound The sound to be played, whose type depends on the playback strategy.
   * @param {string} url The sound URL.
   * @param {string} playbackStrategy The strategy used for playing the sound.
   * @param {Function} play A callback usable to trigger the sound playback.
   * @returns {*|null} The result of calling the playback callback, or null if it was cancelled.
   */


  const processSoundPlayback = (sound, url, playbackStrategy, play) => {
    const payload = getSoundEventPayload(sound, url, playbackStrategy);
    let isCancelled = false;

    try {
      var _dispatchEvent;

      isCancelled = (_dispatchEvent = dispatchEvent(EVENT_TYPE_SOUND_PLAYBACK_REQUESTED, payload)) === null || _dispatchEvent === void 0 ? void 0 : _dispatchEvent.some(_it11 => {
        return false === _it11;
      });

      if (!isCancelled) {
        dispatchEvent(EVENT_TYPE_SOUND_PLAYBACK_CONFIRMED, payload);
      } else {
        dispatchEvent(EVENT_TYPE_SOUND_PLAYBACK_CANCELLED, payload);
      }
    } catch (error) {
      logError(error, `Could not handle playback for sound "${url}" (using "${playbackStrategy}"): `);
    }

    return isCancelled ? null : play();
  };
  /**
   * @param {Function} callback The function to be called when a sound is initialized
   * @returns {Function} A function usable to stop being notified of newly initialized sounds.
   */


  const onSoundInitialized = callback => {
    overrideInstanceMethod('Howl', 'init', originalHowlInit => function (config) {
      var _this$_parent;

      setSharedGlobalVariable(KEY_IS_HOWLER_USED, true);
      const result = originalHowlInit.call(this, config);
      const soundUrl = String(this._src || ((_this$_parent = this._parent) === null || _this$_parent === void 0 ? void 0 : _this$_parent._src) || '').trim();

      if ('' !== soundUrl) {
        dispatchEvent(EVENT_TYPE_SOUND_INITIALIZED, getSoundEventPayload(this, soundUrl, SOUND_PLAYBACK_STRATEGY_HOWLER));
      }

      return result;
    });

    registerSoundDetectionListeners();
    const unregisterDerived = registerEventListener(EVENT_TYPE_SOUND_INITIALIZED, callback);
    return () => {
      unregisterDerived();
      unregisterUnusedSoundDetectionListeners();
    };
  };
  /**
   * @param {string} event A type of sound playback event.
   * @param {Function} callback The function to be called with the event payload when a matching event is dispatched.
   * @returns {Function} A function usable to unregister the listener.
   */

  const registerSoundPlaybackEventListener = (event, callback) => {
    overrideInstanceMethod('Howl', 'play', originalHowlPlay => function (id) {
      var _this$_parent2;

      setSharedGlobalVariable(KEY_IS_HOWLER_USED, true);
      const soundUrl = String(this._src || ((_this$_parent2 = this._parent) === null || _this$_parent2 === void 0 ? void 0 : _this$_parent2._src) || '').trim();

      if ('' !== soundUrl) {
        return processSoundPlayback(this, soundUrl, SOUND_PLAYBACK_STRATEGY_HOWLER, () => originalHowlPlay.call(this, id));
      }

      return originalHowlPlay.call(this, id);
    });

    registerSoundDetectionListeners();
    const unregisterDerived = registerEventListener(event, callback);
    return () => {
      unregisterDerived();
      unregisterUnusedSoundDetectionListeners();
    };
  };
  /**
   * @type {Function}
   * @param {Function} callback
   * The function to be called with the corresponding sound data when a playback is requested.
   * If this function returns false, the sound playback will be cancelled.
   * @returns {Function} A function usable to stop being notified of sound playback requests.
   */


  const onSoundPlaybackRequested = _arg31 => {
    return registerSoundPlaybackEventListener(EVENT_TYPE_SOUND_PLAYBACK_REQUESTED, _arg31);
  };

  /**
   * @type {Set<string>}
   */


  var challengeTtsUrls = new Set();
  var oldTtsUrls = {};
  /**
   * @type {object.<string, object>}
   */

  var initializedTtsData = {}; // Extract the URLs of the TTS sounds when challenges are loaded.

  onPracticeChallengesLoaded(_ref => {
    var {
      challenges
    } = _ref;
    return challenges.forEach(challenge => {
      var normalTtsUrl = isString(challenge.tts) && challenge.tts.trim();

      if (challenge.targetLanguage === "en" && isString(normalTtsUrl)) {
        var femRe = /\/ichika\//g; //preserve pre Oct 2022 female japanese tts voice

        if (!normalTtsUrl.match(femRe)) {
          fetch('https://www.duolingo.com/sentence/' + challenge.sentenceDiscussionId + '?learning_language=' + challenge.sourceLanguage + '&ui_language=en').then(response => response.json()).then(function (data) {
            oldTtsUrls[normalTtsUrl] = data.comment.tts_url;
            challengeTtsUrls.add(normalTtsUrl);
          });
        }
      }
    });
  }); // Detect the initialization of TTS sounds and remember their data.

  onSoundInitialized(sound => {
    if (challengeTtsUrls.has(sound.url)) {
      initializedTtsData[sound.url] = sound;
    }
  }); // Detect when TTS sounds are played, and prepare the corresponding control forms if needed.

  onSoundPlaybackRequested(sound => {
    if (SOUND_PLAYBACK_STRATEGY_HOWLER === sound.playbackStrategy && challengeTtsUrls.has(sound.url)) {
      if (isString(oldTtsUrls[sound.url]) && sound.url != oldTtsUrls[sound.url]) {
        var aurl = oldTtsUrls[sound.url];
        sound.sound.stop();
        sound.sound.unload();
        sound.sound._src = aurl;
        sound.sound.load();
        initializedTtsData[sound.url] = sound;
      }
    }

    return true;
  });

}());
