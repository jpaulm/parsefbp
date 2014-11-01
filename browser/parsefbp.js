!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.parsefbp=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

	// get output stream, and clear it

	BabelParser.prototype.getOS = function() {
		var os = this.outStr;
		this.outStr = "";
		return os;
	};

	// get current slice

	BabelParser.prototype.getCurSlice = function() {
		var end;
		this.start = Math.max(this.ix - 12, 0);
		end = Math.min(this.ix + 12, this.sa.length);
		var res = this.sa.slice(this.start, end);
		return res.join("").replace(/\s/g, ".");
	};

	// get current position

	BabelParser.prototype.getCurPosn = function() {
		var i = this.ix - this.start;
		var res = repeat(".", i) + "^";
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
}

},{}],2:[function(require,module,exports){
'use strict';

var BabelParser = require('babelparser');

var fbp = {
	parse: function fbpscan(s) {

		var conn = false;
		var procname = '';
		var compname = '';
		var cap = 0;
		var procqueue = [];
		var pair = new Array('', ''); // procname, compname
		var connqueue = [];
		var quint = new Array('', '', '', '', 0); // proc, proc, outport, inport,
		// capacity
		var downport = '';
		var upport = '';
		var downstream;
		var diagname = '';
		var firstproc = true;

		function process(bp) {
			compname = '';
			if (bp.tn()) {
				syntaxerror(bp, 'Process starting with numeric');
			}
			while (true) {
				if (!bp.tv()) {
					if (bp.tc('_'))
						continue;
					if (bp.tc('-', 'io') || bp.tb('io') || bp.tc(',', 'io') ||
					  //bp.tc('\n', 'io') || bp.tc('\;', 'io') ||
					  bp.tc('\n', 'io') || bp.tc(';', 'io') ||
					  bp.tc('?', 'io') || bp.eof())
						break;
					if (firstproc && bp.tc(':', 'io'))
						break;
					if (bp.tc('\\', 'o')) {
						if (!bp.copy()) {
							syntaxerror(bp, 'Escape char ends string');
						}
						continue;
					}
					if (bp.tc('(', 'o')) {
						procname = bp.getOS();
						var ok = true;
						while (true) {
							if (bp.tc(')', 'o')) {
								compname = bp.getOS();
								break;
							}
							if (bp.tc('\n', 'o') || !bp.copy()) {
								ok = false;
								break;
							}
						}
						if (!ok) {
							syntaxerror(bp, 'Component name contains end of line');
						}
						pair[0] = procname;
						pair[1] = compname;
						procqueue.push(pair);
						pair = new Array('', '');
						skipblanks(bp);
						bp.tc('?', 'o');
						return true;
					} else {
						syntaxerror(bp, 'Invalid char in process name');
					}
				}
			}
			// no bracket encountered
			procname = bp.getOS();
			skipblanks(bp);
			bp.tc('?', 'o');
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
			var updown = downstream ? 'input' : 'output';
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

		function finish() {
			var conn;
			var upproc;
			var downproc;
			var i;
			var result = {};
			var capacity; // not in generated code yet

			if (diagname === '')
				diagname = 'MyDiagram';

			result.properties = {name: diagname};
			result.processes = {};
			result.connections = [];

			for (i = 0; i < procqueue.length; i++) {
				procname = (procqueue[i])[0];
				compname = (procqueue[i])[1];
				if (compname === '')
					continue;

				result.processes[procname] = {component: compname};
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
				var j;
				var k;
				if (upport !== '') {
					j = upport.indexOf('[');
					if (j > -1) {
						k = upport.indexOf(']');
						upindex = upport.substring(j + 1, k);
						upport = upport.substring(0, j);
					}
				}
				j = downport.indexOf('[');
				if (j > -1) {
					k = downport.indexOf(']');
					downindex = downport.substring(j + 1, k);
					downport = downport.substring(0, j);
				}
				if (upproc.charAt(0) !== '\'') {

					conn = {
						src: {
							process: upproc,
							port: upport
						}
					};

					if (upindex !== '')
						conn.src.index = upindex;

				} else {
					conn = {data: upproc};
				}

				conn.tgt = {
					process: downproc,
					port: downport
				};

				if (downindex !== '')
					conn.tgt.index = downindex;

				result.connections.push(conn);
			}

			return result;
		}

		var bp = new BabelParser(s);

		while (true) {
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
			if (!bp.tc('\'')) { // if not a quote, scan off process name
				if (!process(bp))
					return;
				skipblanks(bp);
				if (firstproc && bp.tc(':', 'o')) {
					diagname = procname;
					firstproc = false;
					procname = '';
					continue;
				} else if (procname.length > 0) {
					var ok = false;
					for (var i = 0; i < procqueue.length; i++) {
						if ((procqueue[i])[0] === procname) {
							ok = true;
							break;
						}
					}
					if (!ok) {
						syntaxerror(bp,
						  'No component name specified for: ' + procname
						  );
					}
				}
				firstproc = false;
				var px = conn ? 1 : 0;
				quint[px] = procname;
				if (conn) {
					quint[4] = cap;
					cap = 0;
					connqueue.push(quint);
					// alert(quint);
					quint = new Array(procname, '', '', '', 0);
					// downstream = false;
				}
				procname = '';
				skipblanks(bp);
				conn = false;
				if (bp.tc(',', 'o')) {
					skipblanks(bp);
					continue;
				}
				if (bp.tc('\n', 'o'))
					continue;
				if (bp.tc(';', 'o') || bp.eof()) {
					connqueue.push(quint);
					return finish();
				}
				if (!port(bp))
					return;
				skipblanks(bp);
				quint[2] = upport;
				if (!arrow(bp))
					return;
			} else {
				while (true) {
					if (bp.tc('\''))
						break;
					if (bp.tc('\n', 'o') || !bp.copy()) {
						syntaxerror(bp, 'Invalid IIP');
					}
				}
				var iip = bp.getOS();
				quint[0] = iip;
				skipblanks(bp);
				if (!arrow(bp)) {
					syntaxerror(bp, 'IIP not followed by arrow');
				}
			}
			conn = true;
			skipblanks(bp);
			if (!port(bp))
				return;
			quint[3] = downport;
		}

	}

};

fbp.SyntaxError = function SyntaxError(bp, message) {

	this.curSlice = bp.getCurSlice();
	this.curPosn = bp.getCurPosn();
	this.result = this.finish();
	this.message = 'Syntax error: ' + message + '\n' +
	  'Current slice......: ' + this.curSlice + '\n' +
	  'Current position...: ' + this.curPosn + '\n' +
	  JSON.stringify(this.result);
};


fbp.SyntaxError.prototype = Error.prototype;
fbp.SyntaxError.prototype.name = 'SyntaxError';

function syntaxerror(bp, message) {
	throw new fbp.SyntaxError(bp, message);
}

module.exports = fbp.parse;

},{"babelparser":1}]},{},[2])(2)
});