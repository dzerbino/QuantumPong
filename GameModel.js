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
// Game variables
var height;
var width;
var Psi;
var fixedObstacles;
var player1Position;
var player2Position;
var player1Line;
var player2Line;
var playerW;
var playerH;
var player1Score;
var player2Score;
var playerStep;

// Model parameters
var hbar = 1;
var m = 2;
var sigma = 3;
var edgeHeight = 1;
var edgeSlope = 1;
var playerEnergy = 1;

function toInt(x) {
	return Math.floor(x);
}

function _2dGaussian(x, y, sigma) {
	var res = new WaveFunction(new Matrix(width, height), new Matrix(width, height));

	for (i = 0; i < width; i++) {
		for (j = 0; j < height; j++) {
			// Unnormalized
			res.Real.setE(i, j, Math.exp( - ((i-x)*(i-x) + (j-y)*(j-y)) / (2 * sigma * sigma)));
		}
	}

	return res;
}

function collapsedWaveFunction(x, y, k_x, k_y) {
	var norm = _2dGaussian(x, y, sigma);
	var res = new WaveFunction(new Matrix(width, height), new Matrix(width, height));

	for (i = 0; i < width; i++) {
		for (j = 0; j < height; j++) {
			// Fixed momentum...
			// Yes, I ignored the Heisenberg uncertainty around the wave vector, sue me.
			var phase = i * k_x + j * k_y;

			res.Real.setE(i, j, norm.Real.e(i,j) * Math.cos(phase));
		 	res.Im.setE(i, j, norm.Real.e(i,j) * Math.sin(phase));
		}
	}

	return res.normalize();
}

function setupPlayers() {
	player1Line = toInt(width / 10);
	player2Line = toInt(width * 9 / 10);
	player1Position = toInt(height/2);
	player2Position = toInt(height/2);
	playerW = toInt(width / 20);
	playerH = toInt(height / 5);
	playerStep = Math.max(1, toInt(playerH / 20));
	player1Score = 0;
	player2Score = 0;
}

function basePotential(i,j) {
	return edgeHeight * Math.max(Math.exp(-i * edgeSlope), Math.exp((i - width + 1) * edgeSlope), Math.exp(-j * edgeSlope), Math.exp((j - height + 1) * edgeSlope));
}

function setupPotential() {
	fixedObstacles = new Matrix(width, height);
	for (i = 0; i < width; i++) {
		for (j=0; j<height; j++) {
			fixedObstacles.setE(i,j, basePotential(i,j));
		}
	}
}

function randomWavevector() {
	var angle = Math.random() * 2 * Math.PI;
	// If velocity > Pi phasing analysis goes berserk
	// Already velocity = 3, the convergence is rather weird
	var velocity = 2.5;
	return {x:Math.cos(angle) * velocity, y:Math.sin(angle) * velocity};
}

function createObstacles() {
	res = new Matrix(width, height);

	// Player 1's obtacle
	var left = player1Line - toInt(playerW)/2;
	var right = player1Line + toInt(playerW)/2;
	var low = player1Position - toInt(playerH)/2;
	var high = player1Position + toInt(playerH)/2;
	for (i=0; i<width; i++) {
		for (j=0; j<height; j++) {
			var xCoeff;
			if (i < left) {
				xCoeff = Math.exp(i-left);
			} else if (i > right) {
				xCoeff = Math.exp(right - i);
			} else {
				xCoeff = 1;
			}

			var yCoeff;
			if (j < low) {
				yCoeff = Math.exp(j-low);
			} else if (j > high) {
				yCoeff = Math.exp(high - j);
			} else {
				yCoeff = 1;
			}

			res.setE(i,j,playerEnergy * Math.min(xCoeff, yCoeff));
		}
	}

	// Player 2's obtacle
	var left = player2Line - toInt(playerW)/2;
	var right = player2Line + toInt(playerW)/2;
	var low = player2Position - toInt(playerH)/2;
	var high = player2Position + toInt(playerH)/2;
	for (i=0; i<width; i++) {
		for (j=0; j<height; j++) {
			var xCoeff;
			if (i < left) {
				xCoeff = Math.exp(i-left);
			} else if (i > right) {
				xCoeff = Math.exp(right - i);
			} else {
				xCoeff = 1;
			}

			var yCoeff;
			if (j < low) {
				yCoeff = Math.exp(j-low);
			} else if (j > high) {
				yCoeff = Math.exp(high - j);
			} else {
				yCoeff = 1;
			}

			res.setE(i,j,Math.max(res.e(i,j), playerEnergy * Math.min(xCoeff, yCoeff)));
		}
	}

	return res.maxp(fixedObstacles);
}

function determinePosition() {
	// Choose from 2D probability mass function
	var val = Math.random();
	var total = 0;
	for (i = 0; i < width; i++) {
		for (j = 0; j < height; j++) {
			total += Psi.squaredNorm(i,j);
			if (total > val) {
				return {x:i,y:j};
			}
		}
	}
	return {x:width/2,y:height/2};
}

