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

var interactive = true;

var currIndex = -1;

var texts = [
	"A high-resolution web camera is required. You can use a laptop with built-in camera, or mount a camera at the top-center of your screen.",
	"Sit in a quiet, well-lit area.",
	"Make sure your face is lit from the front or side.",
	"Face forward to the screen.  Do not turn your head during the experiment.",
	"Keep your head as still as possible.  Don't change the distance between yourself and the screen.  Try to avoid talking during the HIT.",
	"Please keep your forehead visible.  Remove any hats.",
	"Please keep your forehead visible.  Pull your bangs back if they cover your forehead."
];

var btexts = [
	"My camera is on and working properly",
	"The lighting is good",
	"My face is lit properly",
	"I'm facing the screen",
	"Got it",
	"My hat is off",
	"My bangs are pulled back"
];


var srcs = [];

function pushToSrc(newSrc) {
	srcs.push(newSrc);
	console.log(srcs)
}

// window.onload = function ()
function call_requirements() {
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
		//error
	}
	else {
		navigator.getMedia({ video: true, audio: false }, function (mediaStream) {
			var video = document.getElementsByTagName('video')[0];
			video.srcObject = mediaStream;
			video.play();

			setInterval(setBrightness, 1000);

		}, function () {
			//denied
		});
	}

	window.addEventListener('scroll', function () {
		var vert = Math.max(0, window.pageYOffset + $(".navbar").height() - $("#posDiv").position().top);
		$("#movyDiv").css({ top: vert, left: 0, position: 'absolute' });
	}, false);

	if (interactive) {
		// $("#shortInstructions").css("display", "inline");
		// $("#longInstructions").css("display", "none");
		$("#shortInstructions").attr('style', 'display:inline');
		$("#longInstructions").attr('style', 'display:none');
		setCurrentInstruction();
		console.log("hide")
	}
	else {
		// $("#shortInstructions").css("display", "none");
		// $("#longInstructions").css("display", "inline");
		$("#shortInstructions").attr('style', 'display:none');
		$("#longInstructions").attr('style', 'display:inline');
		console.log("show")

	}
}

function continueButtonPress() {
	if (query["n"]) {
		window.location.href = query["n"];
	}
}

function nextButtonPress() {
	setCurrentInstruction();
}

function setCurrentInstruction() {
	currIndex += 1;

	console.log(currIndex)
	console.log(srcs[currIndex])
	console.log(texts[currIndex])

	if (currIndex >= 0) {
		setImageAndText();
	}
}

function setImageAndText() {
	if (texts[currIndex]) {
		$('#buttonText').text(btexts[currIndex]);
		$('#shortInstructionText').text(texts[currIndex]);
		$('#shortInstructionImage').attr("src", srcs[currIndex]);
		console.log(srcs[currIndex])
	}
	else {
		var r = confirm("It's important that you've followed the instructions on this page carefully in order for your HIT to be approved.  If you're not sure, press cancel to review the instructions.  Otherwise press OK to continue.");
		if (r == true) {
			$('#form').submit();
			// continueButtonPress();
		} else {
			$("#shortInstructions").css("display", "none");
			$("#longInstructions").css("display", "inline");
		}
		$("#btnNext").attr("disabled", false);
		$("#instructions").html("<b>Please press 'Continue'</b>");
	}
}

var minSuitable = 80;
var maxSuitable = 190;

function setBrightness() {
	var video = document.getElementsByTagName('video')[0];

	var canvas = document.createElement("canvas");
	canvas.width = video.width;
	canvas.height = video.height;

	var ctx = canvas.getContext("2d");
	ctx.drawImage(video, 0, 0, video.width, video.height);

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	var r, g, b, avg;

	var colorSum = 0;
	var count = 0;
	for (var x = 0, len = data.length; x < len; x += 4) {

		if (x / 4.0 < video.width * (video.height / 3.0) || x / 4.0 > video.width * (video.height / 3.0 * 2.0) || x % video.width < video.width / 3.0 || x % video.width > video.width / 3.0 * 2.0)
			continue;

		r = data[x];
		g = data[x + 1];
		b = data[x + 2];

		avg = Math.floor((r + g + b) / 3);
		colorSum += avg;
		count++;
	}

	//var brightness = Math.floor(colorSum / (canvas.width*canvas.height));
	var brightness = Math.floor(colorSum / (count));

	$('.progress-bar').css('width', (brightness / 256 * 100) + '%').attr('aria-valuenow', brightness);
	if (brightness < minSuitable) {
		$('.progress-bar').removeClass("progress-bar-success");
		$('.progress-bar').addClass("progress-bar-danger");
		$('#brightnessFeedback').text("Your space may be too dark, try turning on another light if your face isn't clearly visible and well lit.");
	}
	else if (brightness > maxSuitable) {
		$('.progress-bar').removeClass("progress-bar-success");
		$('.progress-bar').addClass("progress-bar-danger");
		$('#brightnessFeedback').text("Your space may be too bright, try turning off a light if there's too much light on your face.");
	}
	else {
		$('.progress-bar').removeClass("progress-bar-danger");
		$('.progress-bar').addClass("progress-bar-success");
		$('#brightnessFeedback').text("Your space looks light enough.  If your face in't clearly visible and well lit, adjust the lighting in the room.  Please don't turn any lights on or off once you've moved past this page.");
	}


}