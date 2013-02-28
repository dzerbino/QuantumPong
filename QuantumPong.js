// Copyright (c) 2013, Daniel Zerbino
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
// 
// (1) Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer. 
// 
// (2) Redistributions in binary form must reproduce the above copyright
// notice, this list of conditions and the following disclaimer in
// the documentation and/or other materials provided with the
// distribution.  
// 
// (3)The name of the author may not be used to
// endorse or promote products derived from this software without
// specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
// IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
// Display variables
var canvas;
var ctx;
var scale=6;
var phasedDisplay = false;
var fillPlayers = true;

// Timing variables
var interval;
var refresh = 20;
var flashLength = 50;

function drawPsi() {
	var maxNorm = Psi.maxNorm();
	if (phasedDisplay) {
		// Phased display (mainly debugging): Red = real component, Blue = imaginary component
		for (i=0; i<width; i++) {
			for (j=0; j<height; j++) {
				var red = toInt(128 * Psi.Real.e(i,j) / (maxNorm) + 128).toString(16).toUpperCase();
				if (red.length == 1) {
					red = "0" + red;
				}
				var blue = toInt(128 * Psi.Im.e(i,j) / Math.sqrt(maxNorm) + 128).toString(16).toUpperCase();
				if (blue.length == 1) {
					blue = "0" + blue;
				}
				ctx.fillStyle = "#" + red + "00" + blue;
				ctx.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	} else {
		// Unphased display: white = |Psi|^2, i.e. probability of presence 
		maxNorm = maxNorm * maxNorm;
		for (i=0; i<width; i++) {
			for (j=0; j<height; j++) {
				var red = toInt(255 * Psi.squaredNorm(i,j) / maxNorm).toString(16).toUpperCase();
				if (red.length == 1) {
					red = "0" + red;
				}
				ctx.fillStyle = "#" + red + red + red;
				ctx.fillRect(i * scale, j * scale, scale, scale);
			}
		}
	}
}

function drawPlayers() {
	if (fillPlayers) {
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(scale * (player1Line - playerW / 2), scale * (player1Position - playerH / 2), scale * playerW, scale * playerH);
		ctx.fillRect(scale * (player2Line - playerW / 2), scale * (player2Position - playerH / 2), scale * playerW, scale * playerH);
	}
}

function draw() {
	drawPsi();
	drawPlayers();
}

function detectEvent(e) {
	var evt = e || window.event;
	switch(evt.keyCode) {
		case 65:
			movePlayer1(true);
			break;
		case 90:
			movePlayer1(false);
			break;
		case 75:
			movePlayer2(true);
			break;
		case 77:
			movePlayer2(false);
			break;
		case 32:
			measurement();
	}
	return true;
}

function setupCanvas() {
	document.onkeydown = detectEvent;
	canvas = document.getElementById("myCanvas");
	height = toInt(canvas.height / scale);
	width = toInt(canvas.width / scale);
	ctx = canvas.getContext("2d");
}	

function setupGame() {
	setupCanvas();
	setupPlayers();
	updateScoreBoard(0, 0, false);
	setupPotential();
	// Kinda useless, computation, just to display something when the page loads...
	k = randomWavevector();
	Psi = collapsedWaveFunction(toInt(width/2), toInt(height/2), k.x, k.y);
	draw();
}

function movePlayer1(goUp) {
	if (goUp) {
		player1Position -= playerStep;
		if (player1Position > height) {
			player1Position = height;
		}
	} else {
		player1Position += playerStep;
		if (player1Position < 0) {
			player1Position = 0;
		}
	}
}

function movePlayer2(goUp) {
	if (goUp) {
		player2Position -= playerStep;
		if (player2Position > height) {
			player2Position = height;
		}
	} else {
		player2Position += playerStep;
		if (player2Position < 0) {
			player2Position = 0;
		}
	}
}

function checkGoals(position) {
	return (position.x < player1Line + playerW/2 || position.x > player2Line + playerW/2);
}

function whiteFlash() {
	ctx.fillStyle="#FFFFFF"; 
	ctx.fillRect(0, 0, width * scale, height * scale);
}

function updateScoreBoard(player1Score, player2Score, quantum) {
	if (quantum) {
		document.getElementById('player1').innerHTML="Player 1: " + player1Score + "/" + (player1Score+1);
		document.getElementById('player2').innerHTML="Player 2: " + player2Score + "/" + (player2Score+1);
	} else {
		document.getElementById('player1').innerHTML="Player 1: " + player1Score;
		document.getElementById('player2').innerHTML="Player 2: " + player2Score;
	}
}

function measurement() {
	clearInterval(interval);
	position = determinePosition();
	if (checkGoals(position)) {
		if (position.x < player1Line) {
			player2Score += 1;
		} else {
			player1Score += 1;
		}
		updateScoreBoard(player1Score, player2Score, false);
		Psi = collapsedWaveFunction(position.x, position.y, 1, 0);
		whiteFlash();
		setTimeout(draw, flashLength);
	} else {
		var k = Psi.wavevector(position.x , position.y);
		var norm_k = Math.sqrt(k.x*k.x + k.y*k.y);
		var correction = 2.5 / norm_k;
		Psi = collapsedWaveFunction(position.x, position.y, correction * k.x, correction * k.y);
		whiteFlash();
		setTimeout(kickOff, flashLength);
	}
}

function timeStep() {
	// Step
	Psi = RungeKutta4(Psi);
	// Draw
	draw();
}

function kickOff() {
	// Turn on quantum scores
	updateScoreBoard(player1Score, player2Score, true);
	// Schedule infinite loop
	interval = setInterval(timeStep, refresh);
}

function startGame() {
	// Stop what is going on (if in the middle of something)
	clearInterval(interval);
	// Ball in the middle...
	var k = randomWavevector();
	Psi = collapsedWaveFunction(toInt(width/2), toInt(height/2), k.x, k.y);
	// Kick off!
	kickOff();
}

function resetGame() {
	// Stop what is going on
	clearInterval(interval);
	// Reset variables
	setupGame();
}
