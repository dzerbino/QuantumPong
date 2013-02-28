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
	this.norm = norm;
	this.gradPhi = gradPhi;
	this.phi = phi;

	function add(B) {
		return new WaveFunction(this.Real.add(B.Real), this.Im.add(B.Im));
	}

	function scale(k) {
		return new WaveFunction(this.Real.scale(k), this.Im.scale(k));
	}

	function squaredNorm(i, j) {
		var r = this.Real.e(i,j);
		var i = this.Im.e(i,j);
		return r * r + i * i; 
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

	function norm(i ,j) {
		return Math.sqrt(this.squaredNorm(i,j));
	}

	function phi(i, j) {
		real = Psi.Real.e(i,j);
		im = Psi.Im.e(i,j);

		if (real > 0) {
			return Math.atan(im/real);
		} else if (real < 0) {
			return Math.atan(im/real) + Math.PI;
		} else if (im > 0) {
			return Math.PI;
		} else {
			return -Math.PI;
		}
	}

	function gradPhi(i,j) {
		var x;
		var y;

		if (i > 0 || i < width - 1) {
			// Why compute x1, then x2 then sum them up? If frequency is high x1 + x2 approaches Pi 
			// which is ambiguous
			x1 = Psi.phi(i+1,j) - Psi.phi(i,j);
			if (x1 > Math.PI) {
				x1 -= 2 * Math.PI;
			} else if (x1 < - Math.PI) {
				x1 += 2 * Math.PI;
			}
			x2 = Psi.phi(i,j) - Psi.phi(i-1,j);
			if (x2 > Math.PI) {
				x2 -= 2 * Math.PI;
			} else if (x2 < - Math.PI) {
				x2 += 2 * Math.PI;
			}
			x = (x1 + x2) / 2;
		} else if (i > 0) {
			x = Psi.phi(i,j) - Psi.phi(i-1,j);
			if (x > Math.PI) {
				x -= 2 * Math.PI;
			} else if (x < - Math.PI) {
				x += 2 * Math.PI;
			}
		} else {
			x = Psi.phi(i+1,j) - Psi.phi(i,j);
			if (x > Math.PI) {
				x -= 2 * Math.PI;
			} else if (x < - Math.PI) {
				x += 2 * Math.PI;
			}
		}

		if (j > 0 || j < height - 1) {
			y1 = Psi.phi(i,j+1) - Psi.phi(i,j);
			if (y1 > Math.PI) {
				y1 -= 2 * Math.PI;
			} else if (y1 < - Math.PI) {
				y1 += 2 * Math.PI;
			}
			y2 = Psi.phi(i,j) - Psi.phi(i,j-1);
			if (y2 > Math.PI) {
				y2 -= 2 * Math.PI;
			} else if (y2 < - Math.PI) {
				y2 += 2 * Math.PI;
			}
			y = (y1 + y2) / 2;
		} else if (i > 0) {
			y = Psi.phi(i,j) - Psi.phi(i,j-1);
			if (y > Math.PI) {
				y -= 2 * Math.PI;
			} else if (y < - Math.PI) {
				y += 2 * Math.PI;
			}
		} else {
			y = Psi.phi(i,j+1) - Psi.phi(i,j);
			if (y > Math.PI) {
				y -= 2 * Math.PI;
			} else if (y < - Math.PI) {
				y += 2 * Math.PI;
			}
		}


		return {x:x,y:y};
	}

	function wavevector(i,j) {
		return this.gradPhi(i, j);
	}
}

