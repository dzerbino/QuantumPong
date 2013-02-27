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
function WaveFunction(Real, Im) {
	this.Real = Real;
	this.Im = Im;

	this.add = add;
	this.scale = scale;
	this.squaredNorm = squaredNorm;
	this.total_norm = total_norm;
	this.normalize = normalize;
	this.maxNorm = maxNorm;
	this.wavevector = wavevector;
	this.grad = grad;

	function add(B) {
		return new WaveFunction(this.Real.add(B.Real), this.Im.add(B.Im));
	}

	function scale(k) {
		return new WaveFunction(this.Real.scale(k), this.Im.scale(k));
	}

	function total_norm() {
		// Sum |Psi|^2
		var val = 0;
		for (i = 0; i < width; i++) {
			for (j = 0; j < height; j++) {
				val += this.squaredNorm(i,j);
			}
		}
		return val;
	}

	function normalize() {
		var correction = Math.sqrt(1/this.total_norm());
		return new WaveFunction(this.Real.scale(correction), this.Im.scale(correction));
	}

	function squaredNorm(i, j) {
		var r = this.Real.e(i,j);
		var i = this.Im.e(i,j);
		return r * r + i * i; 
	}

	function maxNorm() {
		var max = -1;
		for (i=0; i<width; i++) {
			for (j=0; j<height; j++) {
				var val = this.squaredNorm(i,j);
				if (max < val) {
					max = val;
				}
			}
		}
		return Math.sqrt(max);
	}

	function grad(i,j) {
		// Returns complex vector!
		var x_r;
		var y_r;
		var x_i;
		var y_i;

		if (i > 0 || i < width - 1) {
			x_r = (Psi.Real.e(i+1,j) - Psi.Real.e(i-1,j))/2;
			x_i = (Psi.Im.e(i+1,j) - Psi.Im.e(i-1,j))/2;
		} else if (i > 0) {
			x_r = Psi.Real.e(i,j) - Psi.Real.e(i-1,j);
			x_i = Psi.Im.e(i,j) - Psi.Im.e(i-1,j);
		} else {
			x_r = Psi.Real.e(i+1,j) - Psi.Real.e(i,j);
			x_i = Psi.Im.e(i+1,j) - Psi.Im.e(i,j);
		}

		if (j > 0 || j < height - 1) {
			y_r = (Psi.Real.e(i,j+1) - Psi.Real.e(i,j-1))/2;
			y_i = (Psi.Im.e(i,j+1) - Psi.Im.e(i,j-1))/2;
		} else if (i > 0) {
			y_r = Psi.Real.e(i,j) - Psi.Real.e(i,j-1);
			y_i = Psi.Im.e(i,j) - Psi.Im.e(i,j-1);
		} else {
			y_r = Psi.Real.e(i,j+1) - Psi.Real.e(i,j);
			y_i = Psi.Im.e(i,j+1) - Psi.Im.e(i,j);
		}

		return {x_r:x_r,x_i:x_i,y_r:y_r,y_i:y_i};
	}

	function wavevector(i,j) {
		// -i * grad (Psi)
		var grad = this.grad(i, j);
		return {x_r:grad.x_i ,x_i:-grad.x_r ,y_r:grad.y_i ,y_i:-grad.y_r};
	}
}

