module.exports = function(grunt) {
  var fs = require("fs"),
    grunt_path = require("path");
  var pkg = grunt.file.readJSON('package.json');
  grunt.registerTask("pReact-pjs-concat", "pReactPjsConcat", function() {
    pkg.configs.concat.forEach(function(f) {
      var src = f.src,
        dest = f.dest,
        path = f.path || "./",
        ext = f.ext;
      var contents = [];
      src.forEach(function(filepath) {
        if (grunt.file.exists(path + filepath + ext)) {
          var pjs = grunt.file.read(path + filepath + ext);
          pjs = pjs.replace(/<img\s+base64\s+src\=[\"|\']([a-z0-9A-Z\_\-\/\.]+)[\"|\']\s*/gim, function(a, b) {
            if (b) {
              var imgExt = /\.(jpg|gif|png)/.exec(b);
              var buffer = fs.readFileSync(grunt_path.resolve(b));
              a = a.replace(a, "<img src='data:image/" + imgExt[1] + ";base64," + buffer.toString('base64') + "' ")
            }
            return a;
          });
          contents.push(pjs);
        } else {
          grunt.log.warn('Source file "' + filepath + ext + '" not found.');
        }
      });
      grunt.file.write(dest + ext, contents.join(''));
      grunt.log.writeln('file ' + dest + ext + ' created.');
    });
  });

  grunt.registerTask("pReact-pjsInHtml-require", "pReactPjsInHtmlRequire", function() {
    //console.log("pReact-pjsInHtml-require")
    pkg.configs.include.forEach(function(f) {
      var src = f.src,
        destPath = f.dest,
        files = [];
      files = grunt.file.expand(src);
      files.forEach(function(file) {
        var html = grunt.file.read(pkg.base + file);
        if (/<script\s+include\s+src\=[\"|\']([a-z0-9A-Z\_\-\/\.]+)[\"|\']\s+type\=[\"|\']text\/pReact[\"|\']\s*>\s*<\/script>/.test(html)) {
          html = html.replace(/<script\s+include\s+src\=[\"|\']([a-z0-9A-Z\_\-\/\.]+)[\"|\']\s+type\=[\"|\']text\/pReact[\"|\']\s*>\s*<\/script>/gim, function(a, b) {
            if (b) {
              var pjs = grunt.file.read(b);
              a = '<script type="text/pReact">' + pjs + '</script>';
            }
            return a;
          });
          grunt.file.write(destPath + file, html);
          grunt.log.writeln('pjs file into ' + destPath + file + ' successfully!');
        }
        if (/<link\s+include\s+href\=[\"|\']([a-z0-9A-Z\_\-\/\.]+)[\"|\']\s*/.test(html)) {
          html = html.replace(/<link\s+include\s+href\=[\"|\']([a-z0-9A-Z\_\-\/\.]+)[\"|\']\s*\/*>/gim, function(a, b) {
            if (b) {
              var css = grunt.file.read(b);
              a = '<style>' + css + '</style>';
            }
            return a;
          });
          grunt.file.write(destPath + file, html);
          grunt.log.writeln('css file into ' + destPath + file + ' successfully!');
        } else {
          grunt.file.write(destPath + file, html);
          grunt.log.error(destPath + file + ' does not contain insert marks!');
        }
      });
    });
  });

  grunt.initConfig({
    watch: {
      pjs: {
        files: ["*.pjs", "package.json", "Gruntfile.js", "*.html", "../*.js"],
        tasks: ["pReact-pjs-concat", "pReact-pjsInHtml-require"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask('default', 'watch');
}