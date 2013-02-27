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
function Matrix(width, height) {
	this.width = width;
	this.height = height;

	// Making space
	this.columns = new Array(); 
	for (i = 0; i < width; i++) {
		column = new Array();
		for (j = 0; j < height; j++) {
			column.push(0);
		}
		this.columns.push(column);
	}

	this.add = add;
	this.scale = scale;
	this.x = multiply;
	this.e = element;
	this.setE = setElement;
	this.min = min;
	this.max = max;
	this.maxp = maxp;

	function add(B) {
		if (this.width != B.width || this.height != B.height) {
			throw "Matrices don't have the same dimensions";
		}
		res = new Matrix(this.width, this.height);
		for (i = 0; i < this.width; i++) {
			for (j = 0; j < this.height; j++) {
				res.setE(i, j, this.e(i,j) + B.e(i,j));
			}
		}
		return res;
	}

	function maxp(B) {
		if (this.width != B.width || this.height != B.height) {
			throw "Matrices don't have the same dimensions";
		}
		res = new Matrix(this.width, this.height);
		for (i = 0; i < this.width; i++) {
			for (j = 0; j < this.height; j++) {
				res.setE(i, j, Math.max(this.e(i,j), B.e(i,j)));
			}
		}
		return res;
	}

	function multiply(B) {
		if (this.width != B.width || this.height != B.height) {
			throw "Matrices don't have the same dimensions";
		}
		res = new Matrix(this.width, this.height);
		for (i = 0; i < this.width; i++) {
			for (j = 0; j < this.height; j++) {
				res.setE(i, j, this.e(i,j) * B.e(i,j));
			}
		}
		return res;
	}

	function scale(scalar) {
		res = new Matrix(this.width, this.height);
		for (i = 0; i < this.width; i++) {
			for (j = 0; j < this.height; j++) {
				res.setE(i, j, this.e(i,j) * scalar);
			}
		}
		return res;
	}
 
	function element(i,j) {
		return this.columns[i][j];
	}

	function setElement(i,j,val) {
		this.columns[i][j] = val;
	}

	function min() {
		res = Math.abs(this.e(0,0));
		for (i = 0; i < this.width; i++) {
			for (j = 0; j < this.height; j++) {
				var val = Math.abs(this.e(i,j));
				if (res > val) {
					res = val;
				}
			}
		}
		return res;
	}

	function max() {
		res = Math.abs(this.e(0,0));
		for (i = 0; i < this.width; i++) {
			for (j = 0; j < this.height; j++) {
				var val = Math.abs(this.e(i,j));
				if (res < val) {
					res = val;
				}
			}
		}
		return res;
	}
}

