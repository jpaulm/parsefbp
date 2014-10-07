function BabelParser(s) {
	this.data = s;
	this.ix = 0;
	this.sa = new Array();
	this.outStr = "";

	for ( var i = 0; i < s.length; i++) {
		this.sa.push(s[i]);
	}

	BabelParser.prototype.getOS = function() {
		var os = this.outStr;
		this.outStr = "";
		return os;
	};

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

	BabelParser.prototype.tb = function(opt) {
		if (this.ix >= this.sa.length)
			return false;
		var patt = /\s/g;
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

	BabelParser.prototype.copy = function() {
		if (this.ix >= this.sa.length)
			return false;
		this.outStr += this.sa[this.ix];
		this.ix++;
		return true;
	};

	BabelParser.prototype.skip = function() {
		if (this.ix >= this.sa.length)
			return false;
		this.ix++;
		return true;
	};

	BabelParser.prototype.eos = function() {
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