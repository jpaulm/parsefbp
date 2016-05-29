(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.parsefbp = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = BabelParser;

function repeat(s, num) {
	return new Array(num + 1).join(s);
};

function BabelParser(s) {

	this.ix = 0;
	this.sa = new Array();
	this.outStr = "";
	this.start = 0;

	// convert input string to character array

	for ( var i = 0; i < s.length; i++) {
		this.sa.push(s[i]);
	}
}
// get output stream, and clear it

BabelParser.prototype.getOS = function() {
	var os = this.outStr;
	this.outStr = "";
	return os;
};

// get current slice

BabelParser.prototype.getCurSlice = function() {
	var end;
	var x = 0;
	var y = this.sa.length;
	
	for (var i = 0; i < this.sa.length; i++)
		{
		if (this.sa[i] == '\n' && i < this.ix)
			x = i + 1;
		if (this.sa[i] == '\n' && i > this.ix && y == this.sa.length)
			y = i;
		}
	x = Math.max(this.ix - 12, x);
	y = Math.min(this.ix + 12, y);
	this.start = x;
	var res = this.sa.slice(x, y);
	return res.join("");   
};

// get current position

BabelParser.prototype.getCurPosn = function() {
	var i = this.ix - this.start;
	var res = repeat(" ", i) + "^";
	return res;
};

// upper and lower case alpha

BabelParser.prototype.ta = function(opt) {
	if (this.ix >= this.sa.length)
		return false;
	var patt = /[A-Za-z]/g;
	var result = patt.test(this.sa[this.ix]);
	if (!result)
		return false;
	if (opt == null) {
		this.outStr += this.sa[this.ix];
		this.ix++;
	} else {
		if (opt.charAt(opt.length - 1) != "o")
			this.outStr += this.sa[this.ix];
		if (opt.charAt(0) != "i")
			this.ix++;
	}
	return true;
};

// numeric characters

BabelParser.prototype.tn = function(opt) {
	if (this.ix >= this.sa.length)
		return false;
	var patt = /[0-9]/g;
	var result = patt.test(this.sa[this.ix]);
	if (!result)
		return false;
	if (opt == null) {
		this.outStr += this.sa[this.ix];
		this.ix++;
	} else {
		if (opt.charAt(opt.length - 1) != "o")
			this.outStr += this.sa[this.ix];
		if (opt.charAt(0) != "i")
			this.ix++;
	}
	return true;
};

// white space characters, except for end of line

BabelParser.prototype.tb = function(opt) {
	if (this.ix >= this.sa.length)
		return false;
	var patt = /\s/g;
	var result = patt.test(this.sa[this.ix]);
	if (!result)
		return false;
	if (this.sa[this.ix] == '\n')
		return false;
	if (opt == null) {
		this.outStr += this.sa[this.ix];
		this.ix++;
	} else {
		if (opt.charAt(opt.length - 1) != "o")
			this.outStr += this.sa[this.ix];
		if (opt.charAt(0) != "i")
			this.ix++;
	}
	return true;
};

// character comparator

BabelParser.prototype.tc = function(c, opt) {
	if (this.ix >= this.sa.length)
		return false;
	if (this.sa[this.ix] != c)
		return false;
	if (opt == null) {
		this.outStr += this.sa[this.ix];
		this.ix++;
	} else {
		if (opt.charAt(opt.length - 1) != "o")
			this.outStr += this.sa[this.ix];
		if (opt.charAt(0) != "i")
			this.ix++;
	}
	return true;
};

// all characters except special characters

BabelParser.prototype.tv = function(opt) {
	if (this.ix >= this.sa.length)
		return false;
	var patt = /[^\~\`\!\@\#\$\%\^\&\*\(\)\_\-\+\=\<\,\>\.\?\/\:\;\"\'\{\[\}\]\|\\\s]/g;
	var result = patt.test(this.sa[this.ix]);
	if (!result)
		return false;
	if (opt == null) {
		this.outStr += this.sa[this.ix];
		this.ix++;
	} else {
		if (opt.charAt(opt.length - 1) != "o")
			this.outStr += this.sa[this.ix];
		if (opt.charAt(0) != "i")
			this.ix++;
	}
	return true;
};

// copy from input to output (unmodified universal comparator)

BabelParser.prototype.copy = function() {
	if (this.ix >= this.sa.length)
		return false;
	this.outStr += this.sa[this.ix];
	this.ix++;
	return true;
};

// skip input (modified universal comparator)

BabelParser.prototype.skip = function() {
	if (this.ix >= this.sa.length)
		return false;
	this.ix++;
	return true;
};

// end of file
BabelParser.prototype.eof = function() {
	var res = (this.ix >= this.sa.length);
	return res;
};

BabelParser.prototype.strcmp = function(str) {
	var slice = this.sa.slice(this.ix, this.ix + str.length);
	var s = slice.join("");
	var res = (s == str);
	return res;
};

},{}],2:[function(require,module,exports){
'use strict';

var BabelParser = require('babelparser');

var fbp = {
		parse : function fbpscan(s) {

			var conn = false;
			var procname = '';
			var compname = '';
			var cap = 0;
			var procqueue = [];
			var triplet = new Array('', '', ''); // procname, compname, metadata
			var connqueue = [];
			var quint = new Array('', '', '', '', 0); // proc, proc, outport, inport,
			// capacity
			var downport = '';
			var upport = '';
			var diagname = '';
			var firstproc = true;

			function process(bp) {

				procname = '';
				if (bp.tn()) {
					syntaxerror(bp, 'Process starting with numeric');
				}

				// bp.tv returns true for all characters except special characters
				// bp.tb returns true for all white space characters, except end of line


				while (true) {
					if (!bp.tv()) {
						if (bp.tc('_'))
							continue;
						if (bp.tc('-', 'io') || bp.tb('io') || bp.tc(',', 'io') ||
								bp.tc('\n', 'io') || bp.tc(';', 'io') ||
								bp.tc('(', 'io') || bp.tc('?', 'io') || bp.eof())
							break;
						if (firstproc && bp.tc(':', 'io'))
							break;
						if (bp.tc('\\', 'o')) { // escape character
							if (!bp.copy()) {
								syntaxerror(bp, 'Escape char ends string');
							}
							continue;
						}
						syntaxerror(bp, 'Invalid char in process name');
					}
				}
				procname = bp.getOS();
				//console.log('proc ' + procname);
				triplet[0] = procname;
				return true;
			}

			function metadata(bp) {
				//console.log('metadata');
				var meta = [];

				while (true) {
					var mdpair = new Array('', '');
					while (true) {
						if (!bp.tv()) {
							if (bp.tc('=', 'o'))
								break;
							if (bp.tc('\\', 'o')) { // escape character
								if (!bp.copy()) {
									syntaxerror(bp, 'Escape char ends string');
								}
								continue;
							}
							syntaxerror(bp, 'Invalid char in process name');
						}
					}
					mdpair[0] = bp.getOS();
					//console.log(mdpair[0]);
					while (true) {
						if (!bp.tv()) {
							if (bp.tc(',', 'o') || bp.tc(')', 'io')){
								skipblanks(bp);
								break;
							}
							if (bp.tc('\\', 'o')) { // escape character
								if (!bp.copy()) {
									syntaxerror(bp, 'Escape char ends string');
								}
								continue;
							}
							syntaxerror(bp, 'Invalid char in process name');
						}
					}
					mdpair[1] = bp.getOS();
					meta.push(mdpair);
					if (bp.tc(')', 'o'))
						break;
				}
				//console.log(meta);
				triplet[2] = meta;
				return true;

			}

			function compt(bp) {

				compname = '';
				//if (bp.tc('(', 'o')) {
				var ok = true;
				if (bp.tn())
					syntaxerror(bp, 'Component name starts with numeric');
				while (true) {
					if (bp.tc(')', 'o')) {
						compname = bp.getOS(); // get output string
						break;
					}
					if (bp.tc(':', 'o')) {
						compname = bp.getOS(); // get output string

						if (!metadata(bp))
							return;
						break;
					}
					if (bp.tc('\n', 'o') || !bp.copy()){
						ok = false;
						break;
					}
				}
				if (!ok) {
					syntaxerror(bp, 'Component name contains end of line');
				}

				triplet[1] = compname;
				//console.log('comp ' + compname);
				procqueue.push(triplet);
				triplet = new Array('', '','');
				//}
				return true;
			}

			function skipblanks(bp) {
				while (true) {
					// if (bp.eof() || bp.tc(';', 'o')) {
					// return false; // end of net or end of file
					// }
					if (bp.tb('o') || bp.tc('\r', 'o')) // ignore \r (?)
						continue;
					if (bp.tc('#', 'o')) {
						while (true) {
							if (bp.tc('\n', 'io')) // make sure eol is seen outside
								// this loop
								break;
							if (!bp.skip())
								break;
						}
						continue;
					}
					return true;
				}
			}

			function port(bp) {
				var str;
				var updown = conn ? 'input' : 'output';
				if (bp.tn()) {
					syntaxerror(bp, 'Port starting with numeric');
				}
				while (true) {
					if (bp.ta() || bp.tn() || bp.tc('_') || bp.tc('.'))
						continue;
					str = bp.getOS();
					if (str.length === 0) {
						syntaxerror(bp, 'Missing ' + updown + ' port');
					}
					break;
				}
				if (bp.tc('[')) {
					while (true) {
						if (bp.tc(']')) {
							str += bp.getOS();
							break;
						}
						if (!bp.tn()) {
							syntaxerror(bp, 'Non-numeric in aray port index');
						}
					}
				}
				if (conn)
					downport = str;
				else
					upport = str;
				return true;
			}

			function arrow(bp) {
				if (!bp.tc('-', 'o'))
					return false;
				if (!bp.tc('>', 'o')) {
					syntaxerror(bp, 'Unfinished arrow');
				}
				skipblanks(bp);
				if (bp.tc('(', 'o')) {
					while (true) {
						if (bp.tc(')', 'o')) {
							cap = bp.getOS(); // capacity: have to decide where to put
							// this in output
							break;
						}
						if (!bp.tn()) {
							syntaxerror(bp, 'Non-numeric in capacity');
						}
					}
				}
				return true;
			}

			function Metadata() {
				this.x = 0;
				this.y = 0;
			}

			function finish() {
				var connx;
				var upproc;
				var downproc;
				var i;
				var result = {};
				var capacity; // not in generated code yet

				//console.log('finishing');
				if (diagname === '')
					diagname = 'MyDiagram';

				result.properties = {
						name : diagname
				};
				result.processes = {};
				result.connections = [];

				for (i = 0; i < procqueue.length; i++) {
					//console.log(i);
					//console.log(procqueue[i]);
					procname = (procqueue[i])[0];
					compname = (procqueue[i])[1];
					var md = (procqueue[i])[2];
					if (compname === '')
						continue;
					var mds = new Metadata();
					for (var j = 0; j < md.length; j++) {
						if ((md[j])[0] == 'x')
						    mds.x = (md[j])[1];
						if ((md[j])[0] == 'y')
						    mds.y = (md[j])[1];
					}

					result.processes[procname] = {
							component : compname,
							metadata : mds
					};
				}

				for (i = 0; i < connqueue.length; i++) {
					upproc = (connqueue[i])[0];
					downproc = (connqueue[i])[1];
					if (downproc === '')
						continue;
					upport = (connqueue[i])[2];
					downport = (connqueue[i])[3];
					capacity = (connqueue[i])[4]; // not used in generated JSON... yet
					var upindex = '';
					var downindex = '';
					var portIndex;
					var k;
					if (upport !== '') {
						portIndex = upport.indexOf('[');
						if (portIndex > -1) {
							k = upport.indexOf(']');
							upindex = upport.substring(portIndex + 1, k);
							upport = upport.substring(0, portIndex);
						}
					}
					portIndex = downport.indexOf('[');
					if (portIndex > -1) {
						k = downport.indexOf(']');
						downindex = downport.substring(portIndex + 1, k);
						downport = downport.substring(0, portIndex);
					}
					if (upproc.charAt(0) !== '\'') {

						connx = {
								src : {
									process : upproc,
									port : upport
								}
						};

						if (upindex !== '')
							connx.src.index = upindex;

					} else {
						connx = {
								data : upproc
						};
					}

					connx.tgt = {
							process : downproc,
							port : downport
					};

					if (downindex !== '')
						connx.tgt.index = downindex;

					result.connections.push(connx);
				}

				return result;
			}

			// Main line

			//console.log('starting');
			var bp = new BabelParser(s);


			while (true) {
				//console.log('main loop');
				if (bp.strcmp('INPORT=') || bp.strcmp('OUTPORT=')) {
					while (true) {
						if (bp.tc('\n', 'o'))
							break;
						if (!bp.skip())
							break;
					}
					continue;
				}
				if (bp.tc('\n', 'o')) {
					conn = false;
					continue;
				}
				skipblanks(bp);

				if (bp.tc('\'')) { // if quote, assume iip
					// processing IIP
					//console.log('iip ');
					while (true) {
						if (bp.tc('\''))
							break;
						if (bp.tc('\n', 'o') || !bp.copy()) {
							syntaxerror(bp, 'Invalid IIP');
						}
					}
					var iip = bp.getOS();
					quint[0] = iip;
					//console.log('iip ' + iip);
					skipblanks(bp);
					if (!arrow(bp)) {
						syntaxerror(bp, 'IIP not followed by arrow');
					}
				} else { // else it is a process name
					if (!process(bp))
						return;
					skipblanks(bp);
					if (firstproc && bp.tc(':', 'o')) {
						diagname = procname;
						firstproc = false;
						procname = '';
						continue;
					}
                    if (bp.tc('(', 'o')) {
						if (!compt(bp))
							return;
						skipblanks(bp);
						bp.tc('?', 'o');
						// do nothing
					} else if (bp.tc('?', 'o')) {
						// do nothing
					} else if (procname.length > 0) {
						var ok = false;
						for ( var i = 0; i < procqueue.length; i++) {
							if ((procqueue[i])[0] === procname) {
								ok = true;
								break;
							}
						}
						if (!ok) {
							syntaxerror(bp, 'No component name specified for: ' +
									procname);
						}
					}
					firstproc = false;
					var px = conn ? 1 : 0;
					quint[px] = procname;
					skipblanks(bp);
					if (conn) {
						quint[4] = cap;
						cap = 0;
						connqueue.push(quint);
						// alert(quint);
						quint = new Array(procname, '', '', '', 0);
						procname = '';
						conn = false;
					}

					skipblanks(bp);

					if (bp.tc(',', 'o')) {
						skipblanks(bp);
						continue;
					}

					if (bp.tc(';', 'o') || bp.eof()) {  // semi-colon or end of data string
						connqueue.push(quint);
						//console.log('finishing');
						return finish();
					}

					if (bp.tc('\n', 'o'))
						continue;

					if (!port(bp))
						return;

					skipblanks(bp);
					quint[2] = upport;
					if (!arrow(bp))
						return;
				}
				conn = true;
				skipblanks(bp);
				if (!port(bp))
					return;
				quint[3] = downport;

			}

			function syntaxerror(bp, message) {
				throw new fbp.SyntaxError(bp, message, finish());
			}

		}

};

fbp.SyntaxError = function SyntaxError(bp, message, result) {

	this.curSlice = bp.getCurSlice();
	this.curPosn = bp.getCurPosn();
	this.message = 'Syntax error: ' + message + '\n' + 'Current slice......: ' +
	this.curSlice + '\n' + 'Current position...: ' + this.curPosn +
	'\n' + JSON.stringify(result);
};

fbp.SyntaxError.prototype = Error.prototype;
fbp.SyntaxError.prototype.name = 'SyntaxError';

module.exports = fbp.parse;

},{"babelparser":1}]},{},[2])(2)
});