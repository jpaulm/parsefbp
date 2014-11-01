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

		function syntaxerror(bp, message) {
			throw new fbp.SyntaxError(bp, message, finish());
		}

	}

};

fbp.SyntaxError = function SyntaxError(bp, message, result) {

	this.curSlice = bp.getCurSlice();
	this.curPosn = bp.getCurPosn();
	this.message = 'Syntax error: ' + message + '\n' +
	  'Current slice......: ' + this.curSlice + '\n' +
	  'Current position...: ' + this.curPosn + '\n' +
	  JSON.stringify(result);
};

fbp.SyntaxError.prototype = Error.prototype;
fbp.SyntaxError.prototype.name = 'SyntaxError';


module.exports = fbp.parse;
