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
			if (4 == skipblanks(bp))
				return;
			
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
			if (4 == skipblanks(bp))
				return;

			if (bp.tc(",", "o") || bp.tc('\n', "o"))
				continue;
			
			//if (bp.tc(";", "o")) {
			//	finish();
			//	return;
			//}

			downstream = false;
			port(bp);

			if (4 == skipblanks(bp))
				return;
			
			quint[2] = upport;
		} else {
			while (true) {
				if (bp.tc("'"))
					break;
				if (bp.tc('\n', "o") || !bp.copy()) {
					syntaxerror("Invalid IIP: " + bp.getOS());
					return;
				}
			}
			var iip = bp.getOS();
			
			if (4 == skipblanks(bp))
				return;
			connqueue.push(quint);
			quint = new Array(iip, "", "", "", 0);
			downstream = false;			
		}
		
		if (!arrow(bp))
			return;
		
		downstream = true;	

		if (4 == skipblanks(bp))
			return;

		port(bp);
		quint[3] = downport;
	}
	//finish();
}

function getresult() {
	return result;
}

function skipblanks(bp) {
	
	while (true) {
		if (bp.eof() || bp.tc(";", "o")) { 
		    finish();
			return 4;   // end of file
	    }
				
		if (bp.tb("o"))
			continue;
		if (bp.tc("#", "o")) {
			while (true) {
				if (bp.tc("\n", "io"))  // make sure eol is seen outside this loop
					break;
				if (!bp.skip())
					break;
			}	
			continue;
		}	
		return 0;
	}
}

function process(bp) {
	
	compname = "";

	if (bp.tn())
		syntaxerror("Process starting with numeric: " + bp.getOS());

	while (true) {
		if (!bp.tv()) {

			if (bp.tc('_'))
				continue;

			if (bp.tc('-', "io") || bp.tb("io") || bp.tc(',', "io") || bp.tc('\n', "io") || 
					bp.tc("\;", "io") || bp.eof())
				break;
			
			if (firstproc && bp.tc(':', "io"))
				break;

			if (bp.tc('\\', "o")) {
				if (!bp.copy())
					return;
				continue;
			}

			if (bp.tc("(", "o")) {
				
				procname = bp.getOS();
				var ok = true;
				while (true) {
					if (bp.tc(")", "o")) {						
						compname = bp.getOS();
						break;
					}
					if (bp.tc('\n',"o") || !bp.copy()) {
						ok = false;
						break;
					}					
				}
				if (!ok) 
					break;
				
				pair[0] = procname;
				pair[1] = compname;
				procqueue.push(pair);
				pair = new Array("", "");
				return;
			}
			bp.copy();  // copy invalid character to output stream			
			syntaxerror("Invalid char in process name: " + bp.getOS());
			return;
		}
	}
	// no bracket encountered
	procname = bp.getOS();	
}

function port(bp) {
	var updown = this.downstream ? "input" : "output";
	if (bp.tn())
		syntaxerror("Port starting with numeric: " + bp.getOS());

	while (true) {
		if (bp.ta() || bp.tn() || bp.tc('_') || bp.tc('.'))
			continue;

		var str = bp.getOS();
		if (str.length == 0) {
			syntaxerror("Missing " + updown + " port");
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
	//if (i == 2)
	//	return true;
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

function syntaxerror(s) {
	alert(s);	
}

function finish(){
	var upproc;
	var downproc;
	var capacity;  // not in generated code yet
	
    if (diagname == "")
    	diagname = "mydiagram";
	
	result = "{\"properties\":<br/> { \"name\": \"" + diagname + "\"},<br/>\"processes\": <br/>{";
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
