function BabelParser(s) {
	this.data = s;
	this.ix = 0;
	this.sa = new Array();
	this.outStr = "";

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
		var patt = /[^\~\`\!\@\#\$\%\^\&\*\(\)\_\-\+\=\<\,\>\.\?\/\:\;\"\'\{\[\}\]\|\\\n\r ]/g;
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