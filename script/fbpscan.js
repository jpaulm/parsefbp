var result = "";
var conn = false;
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
		
		if (bp.tc('\n', "o")) {
			conn = false;
			continue;	
		}
		
		skipblanks(bp);
		

		if (!bp.tc("'")) {   // if not a quote, scan off process name

			if (!process(bp))
				return;
			skipblanks(bp);
			
			if (firstproc && bp.tc(":", "o")) {
				diagname = procname;
				firstproc = false;
				procname = "";
				continue;
			} 
			else if (procname.length > 0) {
				var ok = false;
				for (var i = 0; i < procqueue.length; i++) {
					if ((procqueue[i])[0] == procname){
						ok = true;
						break;
					}
				}
				if (!ok) {
					syntaxerror(bp, "No component name specified for: " + procname);
					return false;
				}	
			}
			firstproc = false;
			
			var px = conn ? 1 : 0;
			quint[px] = procname;
			
			if (conn) {	
				quint[4] = cap;
				cap = 0;
				connqueue.push(quint);
				//alert(quint);
				quint = new Array(procname, "", "", "", 0);
				//downstream = false;
			}
			
			procname = "";
			skipblanks(bp);

			conn = false;
			if (bp.tc(",", "o")) {					
				skipblanks(bp);
				continue;
			}
			
			if (bp.tc("\n", "o")) 
				continue;
			
			if (bp.tc(";", "o") || bp.eof()) {
				connqueue.push(quint);
				finish();
				return;
			}
			  					
			if (!port(bp))
				return;

			skipblanks(bp);
			
			quint[2] = upport;
			
			if (!arrow(bp))
				return;
		} else {
			while (true) {
				if (bp.tc("'"))
					break;
				if (bp.tc('\n', "o") || !bp.copy()) {
					syntaxerror(bp, "Invalid IIP");
					return;
				}
			}
			var iip = bp.getOS();
			quint[0] = iip;
			skipblanks(bp);
				
			if (!arrow(bp)) {
				syntaxerror(bp, "IIP not followed by arrow");
				return;
			}
		}
		
		conn = true;	

		skipblanks(bp);

		if (!port(bp))
			return;
		quint[3] = downport;
	}
	
}

function getresult() {
	return result;
}

function skipblanks(bp) {
	
	while (true) {
		if (bp.eof() || bp.tc(";", "o")) { 		
			return false;   // end of net or end of file
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
		return true;
	}
}

function process(bp) {
	
	compname = "";

	if (bp.tn()) {
		syntaxerror(bp, "Process starting with numeric");
		return false;
	}

	while (true) {
		if (!bp.tv()) {

			if (bp.tc('_'))
				continue;

			if (bp.tc('-', "io") || bp.tb("io") || bp.tc(',', "io") || bp.tc('\n', "io") || 
					bp.tc("\;", "io") || bp.tc("?", "io") || bp.eof())
				break;
			
			if (firstproc && bp.tc(':', "io"))
				break;

			if (bp.tc('\\', "o")) {
				if (!bp.copy()) {
					syntaxerror(bp, "Escape char ends string")
					return false;
				}
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
				if (!ok) {
					syntaxerror(bp, "Component name contains end of line");
					return false;
				}
				
				pair[0] = procname;
				pair[1] = compname;
				procqueue.push(pair);
				pair = new Array("", "");
				skipblanks(bp);
				bp.tc("?", "o"); 				
				return true;
			}
			else {		
			syntaxerror(bp, "Invalid char in process name");
			return false;
			}
		}
	}
	// no bracket encountered
	procname = bp.getOS();	
	skipblanks(bp);	
	bp.tc("?", "o"); 
	return true;
}

function port(bp) {
	var updown = this.downstream ? "input" : "output";
	if (bp.tn()) {
		syntaxerror(bp, "Port starting with numeric");
		return false;
	}

	while (true) {
		if (bp.ta() || bp.tn() || bp.tc('_') || bp.tc('.'))
			continue;

		var str = bp.getOS();
		if (str.length == 0) {
			syntaxerror(bp, "Missing " + updown + " port");
			return false;
		} 		
		break;
	}
	if (bp.tc("[")) {
		while (true) {
			if (bp.tc("]")) {				
				str += bp.getOS();
				break;
			}
			if (!bp.tn()) {
				syntaxerror(bp, "Non-numeric in aray port index");
				return false;
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
	if (!bp.tc('-', "o"))
		return false;
	if (!bp.tc('>', "o")) {
		syntaxerror(bp, "Unfinished arrow");
		return false;	
	}

	skipblanks(bp);

	if (bp.tc("(", "o")) {
		while (true) {
			if (bp.tc(")", "o")) {				
				cap = bp.getOS();  // capacity: have to decide where to put this in output
				break;
			}
			if (!bp.tn()){
				syntaxerror(bp, "Non-numeric in capacity");
				return false;
			}
		}
	}
	return true;
}

function syntaxerror(bp, s) {
	//alert(s);	
	var t = bp.getCurSlice();
	var u = bp.getCurPosn();
	result += "<div style=\"color:#FF0000;font-family:courier\"> Error: " + s + "<br/>";
	result += "Current slice......: " + t + "<br/>";
	result += "Current position...: " + u + "\n" + "</div><br/>";	
	finish();
}

function finish(){
	var upproc;
	var downproc;
	var capacity;  // not in generated code yet
	
    if (diagname == "")
    	diagname = "MyDiagram";
	
	result += "<br/>{\"properties\":<br/> { \"name\": \"" + diagname + "\"},<br/>\"processes\": <br/>{";
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
