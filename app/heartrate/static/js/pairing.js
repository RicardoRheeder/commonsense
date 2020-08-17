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
var query = {};

window.onload = function() {
}

ws = new WebSocket('wss://' + location.host + '/match');

ws.onopen = function(msg) {
	var a = document.location.search.substring(1).split('&');
	for (var i in a)
	{
		var b = a[i].split('=');
		query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
	}
	
	var crit = query["c"] ? query["c"] : "_default";
	var lay = query["l"] ? query["l"] : "_default";
	
	if (query["p"])
	{
		ws.send(JSON.stringify({
			id : 'request',
			pid : query["p"],
			layout : lay,
			criteria : crit 
		}));
	}
	
	if (query["rp"])
		$("#headingText").text("Please wait while we find a new partner for you to talk to");
}

ws.onmessage = function(message) {

	var parsedMessage = JSON.parse(message.data);
	switch (parsedMessage.id) {
		case 'matched':	
			var passalong = "";
			if (query["pa"])
				passalong = query["pa"];
			
			var layout = "";
			if (parsedMessage.layout !== "_default")
				layout = "&l=" + parsedMessage.layout;
			
			var next = "";
			if (query["n"])
				next = "&n=" + encodeURIComponent(query["n"]);
			
			var error = "";
			if (query["e"])
				error = "&e=" + encodeURIComponent(query["e"]);
			
			var time = "";
			if (query["t"])
				time = "&t=" + encodeURIComponent(query["t"]);
			
			var pid = "";
			if (query["p"])
				pid = "&p=" + encodeURIComponent(query["p"]);
			
			var questions = "";
			if (query["q"])
				questions = "&q=" + encodeURIComponent(query["q"]);
			
			var rePair = "&rp=" + encodeURIComponent(window.location.href + "&rp=true");
		
			var params = "?pn=" + parsedMessage.pairName + passalong + layout + next.replace("\%3CPARTNER\%3E", parsedMessage.partnerPID) + error + time + pid + "&pp=" + parsedMessage.partnerPID + questions + rePair;
			
			
			document.getElementById('alertAudio').play();
			document.getElementById('alertAudio').onended=function(){
				window.location.href = "https://videosolo.usask.ca/" + params;
			};
			
			break;
		case 'adminMessage':
			document.getElementById('alertAudio').play();
			$("#adminMessage").css("display", "block");
			$("#adminMessage").text(parsedMessage.text);
			break;
		default:
			alert("unknown message received");
	}
}

window.onbeforeunload = function() {
	ws.close();
}