var should = require('should');
var parsefbp = require('../script/fbpscan.js');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;


function loadFile(name, type) {
	var file = path.resolve(__dirname, './data', name + type);
	if (!fs.existsSync(file)) {
		console.log('File ' + file + ' not found');
		process.exit(1);
	}
	return fs.readFileSync(file, 'utf8');
}

function loadFile2(name) {
	var file = path.resolve(__dirname, './others', name);
	if (!fs.existsSync(file)) {
		console.log('File ' + file + ' not found');
		process.exit(1);
	}
	return fs.readFileSync(file, 'utf8');
}

function loadFiles(file) {
	return {
		fbp: loadFile(file, '.fbp'),
		expected: JSON.parse(
		  loadFile(file, '.json')
		  )
	};
}

describe('ParseFBP', function () {

	describe('File comparison tests', function () {

		var files = glob.sync(path.resolve(__dirname, './data/*.fbp'));

		for (var i = 0; i < files.length; i++) {

			var file = path.basename(files[i], '.fbp');

			(function (file) {

				it('Comparing file ' + file, function () {
					var data = loadFiles(file);
					parsefbp(data.fbp).should.eql(data.expected);
				});

			})(file);

		}

	});
	
	describe('Other tests', function () {
	    var files = glob.sync(path.resolve(__dirname, './others/*.fbp'));   
	        for (var i = 0; i < files.length; i++) {
	            var file = path.basename(files[i]);
	            it('Crash test ' + file, function () {
	                expect(function () {
	                    var data = loadFile2(file);
	                    parsefbp(data)
	                }).to.throw(Error);
	            });
	        }       
	    });
});


