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

// Shameless smoothing to avoid numerical instability:
function smooth(matrix) {
	// Defining the area of player 1's paddle
	var left = player1Line - toInt(playerW/2);
	var right = player1Line + toInt(playerW/2);
	var low = Math.max(1 , player1Position - toInt(playerH/2));
	var high = Math.min(height - 2, player1Position + toInt(playerH/2));
	for (i = left; i < right; i++) {
		for (j = low; j < high; j++) {
			if (matrix.e(i,j) > 0 && matrix.e(i-1,j) < 0 && matrix.e(i+1,j) < 0 && matrix.e(i,j-1) < 0 && matrix.e(i,j+1) < 0) {
				// Positive square surrounded by negative ones
				matrix.setE(i,j, 0);
			} else if  (matrix.e(i,j) < 0 && matrix.e(i-1,j) > 0 && matrix.e(i+1,j) > 0 && matrix.e(i,j-1) < 0 && matrix.e(i,j+1) > 0) {
				// Negative square surrounded by positive ones
				matrix.setE(i,j, 0);
			} 
		}
	}

	// Defining the area of player 2's paddle
	left = player2Line - toInt(playerW/2);
	right = player2Line + toInt(playerW/2);
	low = Math.max(1 , player2Position - toInt(playerH/2));
	high = Math.min(height - 2, player2Position + toInt(playerH/2));
	for (i = left; i < right; i++) {
		for (j = low; j < high; j++) {
			if (matrix.e(i,j) > 0 && matrix.e(i-1,j) < 0 && matrix.e(i+1,j) < 0 && matrix.e(i,j-1) < 0 && matrix.e(i,j+1) < 0) {
				// Positive square surrounded by negative ones
				matrix.setE(i,j, 0);
			} else if  (matrix.e(i,j) < 0 && matrix.e(i-1,j) > 0 && matrix.e(i+1,j) > 0 && matrix.e(i,j-1) < 0 && matrix.e(i,j+1) > 0) {
				// Negative square surrounded by positive ones
				matrix.setE(i,j, 0);
			} 
		}
	}
	return matrix;
}

function laplacian(matrix) {
	var res = new Matrix(width, height);
	for (j = 1; j < height-1; j++) {
		// First and last column
		res.setE(0,j, matrix.e(1,j) + matrix.e(0,j+1) + matrix.e(0,j-1) - 3 * matrix.e(0,j));
		res.setE(width-1,j, matrix.e(width-2,j) + matrix.e(width-1,j+1) + matrix.e(width-1,j-1) - 3 * matrix.e(width-1,j));
		// First and last row 
		var i = j;
		res.setE(i,0, matrix.e(i,1) + matrix.e(i+1,0) + matrix.e(i-1,0) - 3 * matrix.e(i,0));
		res.setE(i,height, matrix.e(i,1) + matrix.e(i+1,height) + matrix.e(i-1,height) - 3 * matrix.e(i,height));
		// Center
		for (i = 1; i < width-1; i++) {
			res.setE(i,j, matrix.e(i+1,j) + matrix.e(i-1,j) + matrix.e(i,j+1) + matrix.e(i,j-1) - 4 * matrix.e(i,j));
		}
	}
	// (0,0) corner
	res.setE(0,0, matrix.e(1,0) + matrix.e(0,1) - 2 * matrix.e(0,0));
	// (O, height) corner
	res.setE(0,height-1, matrix.e(1,height-1) + matrix.e(0,height-2) - 2 * matrix.e(0,height-1));
	// (width, 0) corner
	res.setE(width-1,0, matrix.e(width-2,0) + matrix.e(width-1,1) - 2 * matrix.e(width-1,0));
	// (width, height) corner
	res.setE(0,height-1, matrix.e(width-2,height-1) + matrix.e(width-1,height-2) - 2 * matrix.e(width-1,height-1));
	return smooth(res);
}

function partialDifferentialFunction(waveFunction, potential) {
	// Schroedinger's equation for fixed time step of 1, separating real and imaginary terms:
	R = waveFunction.Real;
	I = waveFunction.Im;
	var Real = (laplacian(I).scale(-hbar/(2 * m))).add(potential.x(I).scale(1/hbar));
	var Im = (laplacian(R).scale(hbar/(2 * m))).add(potential.x(R).scale(-1/hbar));

	return new WaveFunction(Real,Im);
}

function RungeKutta4(psi) {
	var potential = createObstacles();

	function f(waveFunction) {
		return partialDifferentialFunction(waveFunction, potential);
	}

	var k1 = f(psi);
	var k2 = f(psi.add(k1.scale(0.5)));
	var k3 = f(psi.add(k2.scale(0.5)));
	var k4 = f(psi.add(k3));

	var res = psi.add(k1.add(k2.scale(2)).add(k3.scale(2)).add(k4).scale(1/6));

	return res.normalize();
}
