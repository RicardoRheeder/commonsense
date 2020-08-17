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

var ws;
var videoInput;
var videoOutput;
var webRtcPeer;
var query = {};
var questions = [];
var currQuestion = 0;
var timeUp = false;

var registerName = null;
const NOT_REGISTERED = 0;
const REGISTERING = 1;
const REGISTERED = 2;
var registerState = null

var loaded = false;
var opened = false;

function setRegisterState(nextState){
	switch (nextState) {
	case NOT_REGISTERED:
		$('#register').attr('disabled', false);
		$('#call').attr('disabled', true);
		$('#terminate').attr('disabled', true);
		break;
		
	case REGISTERING:
		$('#register').attr('disabled', true);
		break;
		
	case REGISTERED:
		$('#register').attr('disabled', true);
		setCallState(NO_CALL);
		break;
		
	default:
		return;
	}
	registerState = nextState;
}

const NO_CALL = 0;
const PROCESSING_CALL = 1;
const IN_CALL =2;
var callState = null

function setCallState(nextState){
	switch (nextState) {
	case NO_CALL:
		$('#call').attr('disabled', false);
		$('#terminate').attr('disabled', true);
		break;

	case PROCESSING_CALL:
		$('#call').attr('disabled', true);
		$('#terminate').attr('disabled', true);
		break;
	case IN_CALL:
		$('#call').attr('disabled', true);
		$('#terminate').attr('disabled', false);

		var start = new Date();
		var time = 5;
		if (query["t"])
			time = query["t"];
		
		setChatTimer(time);
		cancelWaitTimer();
		
		//if(currQuestion == 0)
		lockQuestion();
		setQuestion(currQuestion == 0 ? currQuestion : currQuestion -1);
		$(".nextButton").attr("disabled", false);
		$(".disconnectWarning").css("display", "none");
		break;
	default:
		return;
	}
	callState = nextState;
}

var ChatTimerID;
function setChatTimer(time, force)
{
	console.info('Setting time: ' + time + ' forced is ' + (force ? 'on' : 'off'));
	if (!force && !(ChatTimerID === undefined))
		return;
	
	cancelChatTimer();
	ChatTimerID = setTimeout(function(){ 
		$(".timeWarning").css("display", "inline");
			setTimeout(function(){ 
				stop(false, false);
			}, 20000);
	}, time * 60000);
}

function cancelChatTimer()
{
	clearTimeout(ChatTimerID);
	ChatTimerID = undefined;
}


var WaitTimerID;
function setWaitTimer()
{
	cancelWaitTimer();
	WaitTimerID = setTimeout(function(){ 
		var time = 5;
		if (query["t"])
			time = query["t"];
		
		time += 3;
		
		if (((new Date).getTime()/1000 - startTime) < 60 * time/2)
		{
			if(query["rp"])
				window.location.href = query["rp"];
		}
		else 
		{
			if (query["e"])
				window.location.href = query["e"];
		}
	}, 3 * 60000);
}

function cancelWaitTimer()
{
	clearTimeout(WaitTimerID);
	WaitTimerID = undefined;
}

function partnerNotUseable()
{
	stop(false, false, true);
	if(query["rp"])
		window.location.href = query["rp"];
}

var startTime = (new Date).getTime()/1000;
function nextQuestion()
{
	
	if (!lockQuestion())
	{
		$(".ClockIcon").css("display", "inline");
		setTimeout(function(){ 
			$(".ClockIcon").fadeOut(800);
		}, 400);
		return;
	}
	
	var numberToSet = currQuestion;
	var message = {
		id : 'questionSync',
		number : numberToSet,
		pid : query["p"],
		time : ((new Date).getTime()/1000 - startTime)
	};
	sendMessage(message);
	setQuestion(numberToSet);
}


var questionLocked = false;
function lockQuestion()
{
	if (!questionLocked)
	{
		questionLocked = true;
		
		setTimeout(function(){ 
			questionLocked = false;
		}, 20000);
		
		return true;
	}
	else
	{
		return false;
	}
}

function setQuestion(numberToSet)
{
	currQuestion = numberToSet + 1;
	
	var textToSet = questions[numberToSet];
	if (textToSet.indexOf("!CHECK!") == 0)
	{
		textToSet = textToSet.substring(7);
		$(".UserCheck").css("display", "inline");
		$(".Control").css("display", "none");
	}
	else
	{
		$(".UserCheck").css("display", "none");
		$(".Control").css("display", "inline");
	}
		
	
	$(".Instructions").text(textToSet);
	
}


function connect(hostname, port, method) {
    if (hostname === undefined) hostname = "localhost";
    if (port === undefined) port = 80;
    if (method === undefined) method = "HTTP";
}

window.onload = function() {
	setRegisterState(NOT_REGISTERED);
	console = new Console('console', console);
	
	var a = document.location.search.substring(1).split('&');
	for (var i in a)
	{
		var b = a[i].split('=');
		query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
	}
	
	var questionsName = "areyoumax";
	
	if (query["q"])
	{
	   questionsName = query["q"];
	}


	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			questions = JSON.parse(xmlhttp.responseText);
		}
	}
	xmlhttp.open("GET","questions/" + questionsName,true);
	xmlhttp.send();

	var layout = "DefaultLayout";
	
	if (query["l"])
	{
	   layout = query["l"];
	}
	
	setWaitTimer()

	//var drag = new Draggabilly(document.getElementById(layout + 'videoSmall'));
	videoInput = document.getElementById(layout + 'videoInput');
	videoOutput = document.getElementById(layout + 'videoOutput');
	
	switch (layout) {
	case 'DefaultLayout':
		break;
	case 'SplitLayout':
		document.getElementById(layout).style.display = "inline";
		document.getElementById('DefaultLayout').style.display = "none";
		break;
	case 'PipLayout':
		document.getElementById(layout).style.display = "inline";
		document.getElementById('DefaultLayout').style.display = "none";
		break;
	case 'SoloLayout':
		document.getElementById(layout).style.display = "inline";
		document.getElementById('DefaultLayout').style.display = "none";
		break;
	default:
	}
	
	document.getElementById('name').focus();
	
	ws = new WebSocket('wss://' + location.host + '/call');
	
	ws.onopen = function(msg) {
		
		if (query["pn"])
		{
			console.info('Setting Name');
			document.getElementById('name').value = query["pn"];
			console.info('Calling Register');
			register();
		}
	}
	
	ws.onmessage = function(message) {
		var parsedMessage = JSON.parse(message.data);
		console.info('Received message: ' + message.data);
	
		switch (parsedMessage.id) {
		case 'registerResponse':
			resgisterResponse(parsedMessage);
			break;
		case 'callResponse':
			callResponse(parsedMessage);
			break;
		case 'incomingCall':
			incomingCall(parsedMessage);
			break;
		case 'startCommunication':
			startCommunication(parsedMessage);
			break;
		case 'stopCommunication':
			console.info("Communication ended by remote peer");
			stop(true, parsedMessage.wait, parsedMessage.badPartner);
			break;
		case 'questionSync':
			if (parsedMessage.time)
			{
				currQuestion = parsedMessage.number + 1;
				var time = 5;
				if (query["t"])
					time = query["t"];
				
				console.info("Setting timer: " + (time - parsedMessage.time));
				
				setChatTimer(time - parsedMessage.time, true);
				startTime -= parsedMessage.time*60;
				$(".disconnectWarning").css("display", "inline");
			}
			else
			{
				lockQuestion();
				setQuestion(parsedMessage.number);
			}
			break;
		default:
			console.error('Unrecognized message', parsedMessage);
		}
	}
}

window.onbeforeunload = function() {
	ws.close();
}

function resgisterResponse(message) {
	if(message.response == 'accepted'){
		console.info('register success');
		setRegisterState(REGISTERED);
		if (query["pn"])
		{
			if(message.shouldCall)
			{
				console.info('Setting peer');
				document.getElementById('peer').value = message.whoCall;
				console.info('Calling call');
				call();
			}
		}
	} else {
		console.info('register failed');
		setRegisterState(NOT_REGISTERED);
		var errorMessage = message.message ? message.message : 'Unknown reason for register rejection.';
		console.log(errorMessage);
		//alert('Error registering user. See console for further information.');
		if (query["pn"])
		{
			console.info('Setting name x0x');
			document.getElementById('name').value = query["pn"] + "x0x" + query["p"];
			console.info('Trying to register again');
			register();
		}
	}
	
}

function callResponse(message) {
	if (message.response != 'accepted') {
		console.info('Call not accepted by peer. Closing call');
		var errorMessage = message.message ? message.message : 'Unknown reason for call rejection.';
		console.log(errorMessage);
		stop(true, false);
	} else {
		setCallState(IN_CALL);
		webRtcPeer.processSdpAnswer(message.sdpAnswer);
	}
}

function startCommunication(message) {
	setCallState(IN_CALL);
	webRtcPeer.processSdpAnswer(message.sdpAnswer);
}

function incomingCall(message) {
	
	//If bussy just reject without disturbing user
	if(callState != NO_CALL){
		var response = {
				id : 'incomingCallResponse',
				from : message.from,
				callResponse : 'reject',
				message : 'bussy'
				
			};
			return sendMessage(response);
	}
	
	setCallState(PROCESSING_CALL);
	
	var accept = false;
	
	if (query["pn"])
		accept = true;
	else
		accept = confirm('User ' + message.from + ' is calling you. Do you accept the call?')
	
	if (accept) {
		showSpinner(videoInput, videoOutput);
		webRtcPeer = kurentoUtils.WebRtcPeer.startSendRecv(videoInput,
				videoOutput, function(sdp, wp) {
					var response = {
						id : 'incomingCallResponse',
						from : message.from,
						callResponse : 'accept',
						sdpOffer : sdp
					};
					sendMessage(response);
				}, function(error){
					setCallState(NO_CALL);
					//SHELBY
					if (query["pn"])
					{
						var response = {
							id : 'incomingCallResponse',
							from : message.from,
							callResponse : 'reject',
							message : 'failed to get user media'
						};
						sendMessage(response);
						stop(true, false);
						if (query["e"])
						{
							window.location.href = query["e"];
							return;
						}
					}
				});
	} else {
		var response = {
			id : 'incomingCallResponse',
			from : message.from,
			callResponse : 'reject',
			message : 'user declined'
		};
		sendMessage(response);
		stop(true, false);
	}
}

function register() {	
	var name = document.getElementById('name').value;
	if(name == '') {
		window.alert("You must insert your user name");
		return;
	}
	
	setRegisterState(REGISTERING);
	
	var message = {
		id : 'register',
		name : name
	};
	sendMessage(message);
	document.getElementById('peer').focus();
}

function call() {
	
	if(document.getElementById('peer').value == ''){
		window.alert("You must specify the peer name");
		return;
	}
	
	setCallState(PROCESSING_CALL);
	
	showSpinner(videoInput, videoOutput);

	kurentoUtils.WebRtcPeer.startSendRecv(videoInput, videoOutput, function(
			offerSdp, wp) {
		webRtcPeer = wp;
		console.log('Invoking SDP offer callback function');
		var message = {
			id : 'call',
			from : document.getElementById('name').value,
			to : document.getElementById('peer').value,
			sdpOffer : offerSdp
		};
		sendMessage(message);
	}, function(error){
		console.log(error);
		setCallState(NO_CALL);
	});
}

function stop(message, wait, badPartner) {
	setCallState(NO_CALL);
	if (webRtcPeer) {
		webRtcPeer.dispose();
		webRtcPeer = null;

		if (!message) {
			var message = {
				id : 'stop'
			}
			if (badPartner)
				message.badPartner = true;
			sendMessage(message);
		}
		else if(badPartner)
		{
			if (query["n"])
			{
				window.location.href = query["e"];
				return;
			}
		}	
		
	}
	hideSpinner(videoInput, videoOutput);
	
	if (query["n"])
	{
		if (wait)
		{
			$(".Control").css("display", "none");
			$(".UserCheck").css("display", "none");
			$(".disconnectWarning").css("display", "inline");
			cancelChatTimer()
			setWaitTimer();
		}
		else
		{
			window.location.href = query["n"];
		}
	}
}

function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Senging message: ' + jsonMessage);
	ws.send(jsonMessage);
}

function showSpinner() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].poster = './img/transparent-1px.png';
		arguments[i].style.background = 'center transparent url("./img/spinner.gif") no-repeat';
	}
}

function hideSpinner() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].src = '';
		arguments[i].poster = './img/webrtc.png';
		arguments[i].style.background = '';
	}
}

/**
 * Lightbox utility (to display media pipeline image in a modal dialog)
 */
$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
	event.preventDefault();
	$(this).ekkoLightbox();
});
