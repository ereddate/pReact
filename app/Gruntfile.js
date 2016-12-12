module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');
  grunt.registerTask("pReact-pjs-concat", "pReactPjsConcat", function() {
    pkg.configs.forEach(function(f) {
      var src = f.src,
        dest = f.dest,
        ext = ".pjs";
      var contents = [];
      src.forEach(function(filepath) {
        if (grunt.file.exists(filepath + ext)) {
          contents.push(grunt.file.read(filepath + ext));
        } else {
          grunt.log.warn('Source file "' + filepath + ext + '" not found.');
        }
      });
      grunt.file.write(dest + ext, contents.join(''));
      grunt.log.writeln('file ' + dest + ext + ' created.');
    });
  });

  grunt.initConfig({
    watch: {
      pjs: {
        files: [pkg.path + "*.pjs"],
        tasks: ["pReact-pjs-concat"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask('default', 'watch');
}