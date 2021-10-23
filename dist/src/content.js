(function () {
	'use strict';

	var observerScript = document.createElement('script');
	observerScript.src = chrome.runtime.getURL('src/observer.js');
	observerScript.type = 'text/javascript';
	(document.head || document.documentElement).appendChild(observerScript);
	var uiScript = document.createElement('script');
	uiScript.src = chrome.runtime.getURL('src/ui.js');
	uiScript.type = 'text/javascript';
	(document.head || document.documentElement).appendChild(uiScript);

}());
