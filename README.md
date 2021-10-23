# duolingo-tts-restore
A browser extension that attempts to replace Duolingo's new cartoon characters with previous voices as found on the discussion pages

I'd currently consider this alpha at best, made for own personal use but shared in the hopes that others might find it useful. Current testing is minimal and if something does go wrong with it you normally lose audio until you refresh the page which means either finishing the lesson without voices(but hey...that still means you don't have to listen to Zari) or being forced to redo the questions you've already answered.

**This works for sentences only**. No attempt is currently made to adjust the audio played when using the tile based input method rather than typing your answer. It also does not work on the stories and I imagine for those there are only the new audio files so nothing can be done about them.

It is completely reliant  on Duolingo's backend and could stop working at any time as they continue to change things. Also I did come across questions that somehow do not have a discussion page which can result in some of the new voices slipping through.

I only use duolingo for learning Japanese from English so that is where the bulk of testing has been however I did try a couple of French from English and it worked fine.

Once again this was made for my personal use and I make no guarantees it won't go massively wrong on you mid lesson or that it will completely protect you from Zari.

Not currently on chrome's extension store, need to test/polish it before submitting and even once I do that there will be a review delay 

Can be installed manually as an unpacked extension by downloading and unzipping https://github.com/thepizzapotamus/duolingo-tts-restore/blob/main/duolingo-tts-restore.zip?raw=true
and then following these steps for Chrome

    Visit chrome://extensions (via omnibox or menu -> Tools -> Extensions).
    
    Enable Developer mode by ticking the checkbox in the upper-right corner.
    
    Click on the "Load unpacked extension..." button.
    
    Select the directory containing the unpacked extension.

A similiar process works for Edge https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading

Beyond fixing tile input, which isn't likely to happen for multiple reaons, a nice feature for the future may be to add an extra playback button to hear the new voice.

Thanks to bImage for his extensions and duo-toolbox that provided a jumping off point for this
