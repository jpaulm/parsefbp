var result = "";
var downstream = false;
var procname = "";
var compname = "";
var cap;
var procqueue = [];
var pair = new Array("", ""); // procname, compname
var connqueue = [];
var quint = new Array("", "", "", "", 0); // proc, proc, outport, inport, capacity
var downport = "";
var upport = "";
var comma = "";
var diagname = "";
var firstproc = true;

function fbpscan(s) {
	var bp = new BabelParser(s);
		
	while (true) {
		if (bp.strcmp("INPORT=") || bp.strcmp("OUTPORT=")) {
			while (true) {
				if (bp.tc("\n", "o"))
					break;
				if (!bp.skip())
					break;
			}
		continue;
		}
		
		if (4 == skipblanks(bp))
			return;

		if (!bp.tc("'")) {   // if not a quote, scan off process name

			process(bp);
			var i = skipblanks(bp);
			if (i == 2)  // eol encountered
				continue;
			//if (i == 4) {  // end of file
			//	finish();
			//	return;
			//}
			
			if (firstproc && bp.tc(":", "o")) {
				diagname = procname;
				firstproc = false;
				continue;
			}
			firstproc = false;
			var px = downstream ? 1 : 0;
			quint[px] = procname;
			if (downstream) {	
				quint[4] = cap;
				connqueue.push(quint);
				quint = new Array(procname, "", "", "", 0);
				downstream = false;
			}
			
			procname = "";
			if (4 == skipblanks(bp)) {
				finish();
				return;
			}

			if (bp.tc(",", "o"))
				continue;
			if (bp.tc(";", "o")) {
				finish();
				return;
			}

			downstream = false;
			port(bp);

			if (0 < skipblanks(bp))
				return;
			quint[2] = upport;
		} else {
			while (true) {
				if (bp.tc("'"))
					break;
				if (!bp.copy())
					return;
			}
			var iip = bp.getOS();
			
			if (0 < skipblanks(bp))
				return;
			connqueue.push(quint);
			quint = new Array(iip, "", "", "", 0);
			downstream = false;			
		}

		
		if (!arrow(bp))
			return;
		
		downstream = true;	

		if (0 < skipblanks(bp))
			return;

		port(bp);
		quint[3] = downport;
	}
	//result += bp.getOS();

}

function getresult() {
	return result;
}

function skipblanks(bp) {
	var res = 0;
	while (true) {
		if (bp.eos())
			return 4;   // end of file
		if (bp.tc('\n', "o")) {
			res = 2;
			continue;
		}
		
		if (bp.tb("o"))
			continue;
		if (bp.tc("#", "o")) {
			while (true) {
				if (bp.tc("\n", "o"))
					break;
				if (!bp.skip())
					break;
			}
			
			res = 2;
			continue;
		}
		
		return res;
	}
}

function process(bp) {
	
	compname = "";

	if (bp.tn())
		alert("Process starting with numeric");

	while (true) {
		if (!bp.tv()) {

			if (bp.tc('_'))
				continue;

			if (bp.tc('-', "io") || bp.tb("io") || bp.tc(',', "io") || bp.tc(':', "io")
					|| bp.tc("\;", "io") || bp.eos())
				break;

			if (bp.tc('\\', "o")) {
				if (!bp.copy())
					return;
				continue;
			}

			if (bp.tc("(", "o")) {
				
				procname = bp.getOS();
				while (true) {
					if (bp.tc(")", "o")) {						
						compname = bp.getOS();
						break;
					}
					if (!bp.copy())
						break;
				}
				//result += comma + "\"" + procname + "\":{\"component\":\"" + compname
				//		+ "\"}<br/>";
				//comma = ",";
				pair[0] = procname;
				pair[1] = compname;
				procqueue.push(pair);
				pair = new Array("", "");
				return;
			}
			bp.copy();
			alert("Invalid char in process name: " + bp.getOS());
		}
	}

	var str = bp.getOS();
	
	procname = str;
	//}

	if (compname != "")
	    result += "\"" + procname + "\":{\"component\":\"" + compname + "\"}<br/>";

}

function port(bp) {
	var updown = this.downstream ? "input" : "output";
	if (bp.tn())
		alert("Port starting with numeric");

	while (true) {
		if (bp.ta() || bp.tn() || bp.tc('_') || bp.tc('.'))
			continue;

		var str = bp.getOS();
		if (str.length == 0) {
			alert("Missing " + updown + " port");
		} 		
		break;
	}
	if (bp.tc("[")) {
		while (true) {
			if (bp.tc("]")) {				
				str += bp.getOS();
				break;
			}
			if (!bp.tn())
				break;
		}
		
	}
	if (downstream)
		downport = str;
	else
		upport = str;
}

function arrow(bp) {
	if (!bp.tc('-', "o"))
		return false;
	if (!bp.tc('>', "o"))
		return false;	

	var i = skipblanks(bp);
	if (i == 2)
		return true;
	if (i == 4)
		return false;

	if (bp.tc("(", "o")) {
		while (true) {
			if (bp.tc(")", "o")) {				
				cap = bp.getOS();  // capacity: have to decide where to put this in output
				break;
			}
			if (!bp.tn())
				break;
		}
	}
	return true;
}

function finish(){
	var upproc;
	var downproc;
	var capacity;  // not in generated code yet
	
    if (diagname == "")
    	diagname = "mydiagram";
	
	result = "{\"properties\":<br/> { \"name\": \"" + diagname + "\"},<br/>\"processes\": {";
	comma = "";
	for (var i = 0; i < procqueue.length; i++) {
		procname = (procqueue[i])[0];
		compname = (procqueue[i])[1];
		if (compname == "")
			continue;
		result += comma + "\"" + procname + "\":{\"component\":\"" + compname + "\"}<br/>";
		comma = ",";
	}	
	result += "}, \"connections\":<br/>[";
 
	comma = "";
	for (var i = 0; i < connqueue.length; i++) {
		upproc = (connqueue[i])[0];
		downproc = (connqueue[i])[1];
		if (downproc == "")
			continue;
		upport = (connqueue[i])[2];
		downport = (connqueue[i])[3];
		capacity = (connqueue[i])[4];  // not used in generated JSON... yet
		result += comma;
		if (upproc.charAt(0) != "'")
			result += "{ \"src\": {\"process\" :\"" + upproc + "\", \"port\":\"" + upport + "\"}";
		else
		    result += "{ \"data\": " + upproc;
		result += ", \"tgt\": {\"process\" :\"" + downproc + "\", \"port\":\"" + downport + "\"}} <br/>";
		comma = ",";
	}
	result += "]}";
}
