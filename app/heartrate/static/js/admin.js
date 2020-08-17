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

}

ws.onmessage = function(message) {

	var parsedMessage = JSON.parse(message.data);
	switch (parsedMessage.id) {
		case 'adminQueryResponse':
			var users = parsedMessage.users;
			
			var userText = "";
			for (var i = 0; i < users.length; i++)
			{
				if (i != 0)
					userText += ", ";
				
				userText += users[i];
			}
			
			if (userText == "")
				userText = "None";
		
			$("#currentUsers").text(userText);
			break;
		default:
			alert("unknown message received");
	}
}

var send = function(block, unblock)
{
	var message = {
		id : 'adminMessage',
		text: document.getElementById('messageField').value,
		pid: document.getElementById('pidField').value
	}
	
	if (block)
		message.block = true;
	
	if (unblock)
		message.unblock = true;
	
	try {
		ws.send(JSON.stringify(message));
	}
	catch(exception) {}
}

var sendAndBlock = function()
{
	send(true,false);
}

var sendAndUnblock = function()
{
	send(false,true);
}

var refreshUsers = function()
{
	var message = {
		id : 'adminQuery',
	}
	
	try {
		ws.send(JSON.stringify(message));
	}
	catch(exception) {}
}

window.onbeforeunload = function() {
	ws.close();
}