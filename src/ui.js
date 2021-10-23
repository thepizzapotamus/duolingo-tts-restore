import { h, render } from 'preact';
import { _, it } from 'one-liner.macro';
import { isObject, isString, noop } from 'duo-toolbox/utils/functions';
import { discardEvent, getFocusedInput } from 'duo-toolbox/utils/ui';
import { onPracticeChallengesLoaded, onSoundInitialized, onSoundPlaybackRequested } from 'duo-toolbox/duo/events';
import { SOUND_PLAYBACK_STRATEGY_HOWLER, SOUND_SPEED_NORMAL, SOUND_SPEED_SLOW } from 'duo-toolbox/duo/sounds';
import { MUTEX_HOTKEYS, PRIORITY_AVERAGE, requestMutex } from 'duo-toolbox/extension/ui';
import { EXTENSION_PREFIX, FORM_STYLE_BASIC, FORM_STYLE_CARTOON, FORM_STYLES } from './constants';



/**
 * @returns {string[]} The available TTS types for the current challenge.
 */
const getAvailableTtsTypes = () => Object.keys(currentControlForms);


/**
 * @type {Set<string>}
 */
const challengeTtsUrls = new Set();

/**
 * @type {object.<string, string[]>}
 */
const relatedTtsUrls = {};
const oldTtsUrls = {};

/**
 * @type {object.<string, object>}
 */
const initializedTtsData = {};

// Extract the URLs of the TTS sounds when challenges are loaded.
onPracticeChallengesLoaded(({ challenges }) => (
  challenges.forEach(challenge => {
    const normalTtsUrl = isString(challenge.tts) && challenge.tts.trim();
    if(challenge.targetLanguage === "en" && isString(normalTtsUrl) ) {
      const femRe = /\/ichika\//g; //preserve pre Oct 2022 female japanese tts voice
      if( ! normalTtsUrl.match(femRe) ) {
        fetch('https://www.duolingo.com/sentence/' + challenge.sentenceDiscussionId + '?learning_language=' + challenge.sourceLanguage + '&ui_language=en').then( response => response.json()).then(function(data){
          oldTtsUrls[normalTtsUrl] = data.comment.tts_url;
          challengeTtsUrls.add(normalTtsUrl);
        });
        
      }
    }
  })
));

// Detect the initialization of TTS sounds and remember their data.
onSoundInitialized(sound => {
  if (challengeTtsUrls.has(sound.url)) {
    initializedTtsData[sound.url] = sound;
  }
});

// Detect when TTS sounds are played, and prepare the corresponding control forms if needed.
onSoundPlaybackRequested(sound => {
  if (
    (SOUND_PLAYBACK_STRATEGY_HOWLER === sound.playbackStrategy)
    && challengeTtsUrls.has(sound.url)
  ) {
    if(isString(oldTtsUrls[sound.url])  && sound.url!=oldTtsUrls[sound.url]) {
      var aurl = oldTtsUrls[sound.url];
      sound.sound.stop();
      sound.sound.unload();
      sound.sound._src= aurl;
      sound.sound.load()

      initializedTtsData[sound.url] = sound;
    }

  }

  return true;
});


