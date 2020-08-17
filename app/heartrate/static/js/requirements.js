/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */

var query = {};

var screenres = false;
var browser = false;
var cam = false;

var supportedBrowsers = {};
supportedBrowsers["Chrome"] = true;
supportedBrowsers["Firefox"] = false;

window.onload = function () {
	var a = document.location.search.substring(1).split('&');
	for (var i in a) {
		var b = a[i].split('=');
		query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
	}


	navigator.getMedia = (navigator.getUserMedia || // use the proper vendor prefix
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);

	if (!navigator.getMedia) {
		$("#WebcamMicTest").text("Your browser isn't supported.  Switch to a supported browser first.");
		$("#WebcamMicTest").attr('class', 'alert alert-warning');
	}
	else {
		navigator.getMedia({ video: true, audio: false }, function (mediaStream) {
			$("#WebcamMicTest").text("Webcam is available.  Although your camera is on, you will not be recorded until the video chat portion of the HIT.  If you want to use a different camera, click the camera icon on the right side of the address bar, choose a different camera, and then refresh the page.");
			$("#WebcamMicTest").attr('class', 'alert alert-success');

			var video = document.getElementsByTagName('video')[0];
			video.src = window.URL.createObjectURL(mediaStream);
			video.play();

			cam = true;
			formatButton();

		}, function () {
			$("#WebcamMicTest").text("Webcam is not available, or permission was not granted.\n\nIf you denied permission, click the camera icon on the right side of the address bar and select \"Always allow videosolo.usask.ca to access your camera.\"  Then press done and refresh the page.");
			$("#WebcamMicTest").attr('class', 'alert alert-danger');
		});
	}

	if (supportedBrowsers["Chrome"]) {
		if (window.chrome && window.chrome.webstore) {
			$("#BrowserTest").text("Your browser is supported.");
			$("#BrowserTest").attr('class', 'alert alert-success');

			browser = true;
			formatButton();
		}
		else {
			$("#BrowserTest").text("Your browser isn't supported.  Please switch to Chrome.  If you are already using Chrome, make sure your browser is up to date.");
			$("#BrowserTest").attr('class', 'alert alert-warning');
		}
	}
	if (supportedBrowsers["Firefox"]) {
		if (typeof InstallTrigger !== 'undefined') {
			$("#BrowserTest").text("Your browser is supported.");
			$("#BrowserTest").attr('class', 'alert alert-success');

			browser = true;
			formatButton();
		}
		else {
			$("#BrowserTest").text("Your browser isn't supported.  Please switch to Firefox.  If you are already using Firefox, make sure your browser is up to date.");
			$("#BrowserTest").attr('class', 'alert alert-warning');
		}
	}

	windowResized();
	formatButton();
	window.onresize = windowResized;
}

windowResized = function () {
	if (window.innerWidth > 1280 && window.innerHeight > 720) {
		$("#ScreenTest").text("You resolution is high enough.  Please do not resize the browser window during the HIT.");
		$("#ScreenTest").attr('class', 'alert alert-success');

		screenres = true;
		formatButton();
	}
	else {
		if (window.screen.width > 1280 && window.screen.height > 720) {
			$("#ScreenTest").text("You resolution appears to be high enough, but the browser window is not.  Try making the browser window larger.  If the window is already maximized, enter fullscreen mode (on Windows press F11; on Mac press Command+Shift+F).");
			$("#ScreenTest").attr('class', 'alert alert-warning');

			screenres = false;
			formatButton();
		}
		else {
			$("#ScreenTest").text("You resolution is not high enough.  You may be able to complete the HIT on another computer.");
			$("#ScreenTest").attr('class', 'alert alert-warning');

			screenres = false;
			formatButton();
		}
	}
}

function continueButtonPress() {
	if (query["n"] && query["e"]) {
		if (browser && cam && screenres)
			window.location.href = query["n"];
		else {
			if (confirm("You haven't met the requirements.  If you continue now you will need to return the HIT."))
				window.location.href = query["e"];
		}
	}
}

function formatButton() {
	if (browser && cam && screenres) {
		$("#continueButton").attr('class', 'btn btn-success');
	}
	else {
		$("#continueButton").attr('class', 'btn btn-danger');
	}
}