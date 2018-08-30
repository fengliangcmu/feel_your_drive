  module.exports = function(grunt) {

    // Project configuration.
    require('time-grunt')(grunt);

    grunt.initConfig({
      pkg: '<json:package.json>',
      less: {
        dev: {
          files: [{
            expand: true,
            cwd: '.',
            src: ['less/__main.less'],
            dest: '.', //export to local
            ext: '.css' //file type css
          }]   
        }
      },
      jshint: {
        files: ['app/{,*/}*.js'],
        options: {
          curly: true,
          eqeqeq: true,
          eqnull: true,
          browser: true,
          devel: true,
          smarttabs: true,
          maxerr: 10,
          globals: {
            exports: true,
            module: true,
            console: true,
            $: true,
            window: true,
            s: true // underscorejs.string
          }
        }
      },
      watch: {
        options: {
          livereload: true,
          spawn: false,
          debounceDelay: 150
        },
        js: {
          files: [
               'js/{,*/}*.js', 'app/{,*/}*.js'
          ],
          tasks: ['jshint']
        },
        css: {
            files:[
                'css/__main.css'
            ]
            //,tasks: ['concat:css']
        },
        // sass: {
        //     files:[
        //         'app/css/{,*}*.scss', 'app/directives/{,*/}*.scss'
        //     ],
        //     tasks: ['sass','concat:css']
        // },
        less: {
          files: [
                'css/{,*}*.less', 'less/{,*/}*.less'
          ],
          tasks: ['less']
        },
        html: {
          files: ['*.html']
        }
      },
      connect: {
          all: {
              options:{
                  livereload: 35729, // this is the default port used by livereload script of watch plugin
                  base: '.',
                  port: 9000,
                  hostname: "localhost",
                  open:true 
                  // Prevents Grunt to close just after the task (starting the server) completes
                  // This will be removed later as `watch` will take care of that
                  // keepalive: true
              }
          }
      },
	  copy: {
		  dist: {
			  files:[
				  {
					  expand: true, 
					  cwd: ".", 
					  src: [
						  "*.html", "*.png", "*.xml", "*.ico", "*.txt",
              "css/*",
              "fonts/*",
              "img/*",
              "js/**/*",
						  // bootstrap files
						  "lib/bower_components/bootstrap/dist/css/bootstrap.min.css",
						  "lib/bower_components/bootstrap/dist/css/bootstrap-theme.min.css",
						  "lib/bower_components/bootstrap/dist/fonts/*",
						  // font awesome files
						  "lib/bower_components/components-font-awesome/css/font-awesome.min.css",
						  "lib/bower_components/components-font-awesome/fonts/*",
						  // directive HTML files
						  "app/directives/**/*.html",
						  // view pages
						  "app/pages/*.html",
						  // some resources
						  "app/resources/**/*",
						  "app/img/*"
					  ],
					  dest: "./dist/"
				  }
			  ]
		  }
	  },
	  clean: {
		dist: ["./dist/"]
	  }
    });

    //grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-connect');
	  grunt.loadNpmTasks('grunt-contrib-copy');
	  grunt.loadNpmTasks('grunt-contrib-clean');

	  grunt.registerTask("generate", ['jshint', 'less']);
    grunt.registerTask('livereload', ['generate', 'connect', 'watch']);
    grunt.registerTask('gitpush', 'jshint');
    grunt.registerTask('deploy', ['jshint']);
    grunt.registerTask('deployprod', ['jshint', 'uglify']);
	  grunt.registerTask("dist", ["generate", "clean:dist", "copy:dist"]);

  };
