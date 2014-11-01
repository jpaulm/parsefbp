module.exports = function (grunt) {
	'use strict';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				report: 'min'
			},
			standalone: {
				files: {
					'./browser/<%= pkg.name %>.min.js': ['./browser/<%= pkg.name %>.js']
				}
			}
		},
		jshint: {
			all: ['Gruntfile.js', 'script/fbpscan.js'],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		browserify: {
			standalone: {
				src: ['script/fbpscan.js'],
				dest: './browser/<%= pkg.name %>.js',
				options: {
					browserifyOptions: {
						standalone: '<%= pkg.name %>'
					}
				}
			}
		},
		watch: {
			files: ['test/*.js', 'script/**/*.js', 'html/*.htm*'],
			tasks: ['browserify:standalone'],
			options: {
				livereload: '<%= connect.options.livereload %>'
			}
		},
		connect: {
			options: {
				port: 3000,
				hostname: 'localhost',
				livereload: 35729
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [
							require('connect-livereload')(),
							connect.static('browser'),
							connect.static('html')
						];
					}
				}
			}
		}

	});
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-release');
	grunt.registerTask('build', ['jshint', 'browserify', 'uglify']);
	grunt.registerTask('serve', ['connect:livereload', 'watch']);
	grunt.registerTask('default', ['serve']);
};
