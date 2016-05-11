(function () {
    "use strict";
    angular.module('myapp', ['ui.codemirror', 'ui.validate', 'LocalStorageModule'])
        .config(function (localStorageServiceProvider) {
            localStorageServiceProvider
                .setPrefix('cnpApp')
                //.setStorageType('sessionStorage')
                //.setNotify(true, true)
                ;
        })
        .constant('LESS', window.less)
        .constant('HTML_BEAUTIFY', window.html_beautify)
        .constant('JS_BEAUTIFY', window.js_beautify)
        .constant('CSS_BEAUTIFY', window.css_beautify)
        .constant('EMMET_CODEMIRROR', window.emmetCodeMirror)
        .constant('JSZIP', window.JSZip)
        .constant('SAVEAS', window.saveAs)
        .constant('COFFEESCRIPT', window.CoffeeScript)
        .constant('JADE', window.jade)
        .constant('MARKDOWN', window.markdown)
        .constant('SASS', window.Sass)
        .constant('STYLUS', window.stylus)
        .constant('DEXIE', window.Dexie)
        .constant('FILE_TYPES', /\.(html|css|js|less|coffee|jade|sass|scss|styl|md|markdown)$/i)
        .constant('COMPILE_TYPES', /\.(less|coffee|jade|sass|scss|styl|md|markdown)$/i)
        .constant('SETTINGS', {
            preview_delay: 500,
            auto_refresh: true,
            mobile: 700,
            tablet: 900,
            laptop: 1100,
            desktop: 1400
        });
} ());
(function () {
    'use strict';

    angular
        .module('myapp')
        .factory('CompileService', CompileService);

    CompileService.$inject = ['$q', 'LESS', 'COFFEESCRIPT', 'JADE', 'MARKDOWN', 'SASS', 'STYLUS'];
    function CompileService($q, LESS, COFFEESCRIPT, JADE, MARKDOWN, SASS, STYLUS) {
        var service = {
            compile: compile,
            less: less,
            coffeeScript: coffeeScript,
            jade: jade,
            markdown: markdown,
            sass: sass,
            stylus: stylus
        };

        return service;

        ////////////////
        function compile(filetype, input) {
            var deferred = $q.defer();
            var result;

            switch (filetype) {
                case 'LESS':
                    result = less(input);
                    deferred.resolve(result);
                    break;
                case 'COFFEE':
                    result = coffeeScript(input);
                    deferred.resolve(result);
                    break;
                case 'JADE':
                    result = jade(input);
                    deferred.resolve(result);
                    break;
                case 'MARKDOWN':
                    result = markdown(input);
                    deferred.resolve(result);
                    break;
                case 'MD':
                    result = markdown(input);
                    deferred.resolve(result);
                    break;
                case 'SASS':
                    sass(input).then(function (out) {
                        result = out;
                        deferred.resolve(result);
                    });
                    break;
                case 'SCSS':
                    sass(input).then(function (out) {
                        result = out;
                        deferred.resolve(result);
                    });
                    break;
                case 'STYL':
                    result = stylus(input);
                    deferred.resolve(result);
                    break;
            }

            return deferred.promise;
        }

        function less(input) {
            var out;
            LESS.render(input, function (error, output) {
                out = output.css;
            })

            return out;
        }

        function coffeeScript(input) {
            var out;
            out = COFFEESCRIPT.compile(input, { bare: true });
            return out;
        }

        function jade(input) {
            var out;
            var options = { pretty: true };
            // Compile a function
            var fn = JADE.compile(input, options);

            // Render the function
            //can use variables here inside fn
            out = fn();

            return out;
        }

        function markdown(input) {
            var out;
            out = MARKDOWN.toHTML(input);
            return out;
        }

        function sass(input) {
            var deferred = $q.defer();
            var out;

            SASS.compile(input, function (result) {
                if (!result.formatted) {
                    out = result.text;
                    deferred.resolve(out);
                }
                else {
                    out = result.formatted;
                    deferred.resolve(out);
                }
            });

            return deferred.promise;

        }

        function stylus(input) {
            var out;
            STYLUS(input.trim()).render(function (err, str) {
                if (err) {
                    out = err;
                }
                else {
                    out = str.trim();
                }

            });
            return out;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('myapp')
        .directive('compile', compile);

    compile.$inject = ['$compile', 'CompileService', 'HTML_BEAUTIFY', '$q', 'COMPILE_TYPES'];
    function compile($compile, CompileService, HTML_BEAUTIFY, $q, COMPILE_TYPES) {
        // Usage:
        // watches editor for changes and generates preview html
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;

        function link(scope, ele, attrs) {
            scope.$watch(attrs.compile, function (html) {


                function insertOrUpdate(filename, value) {
                    var exists = scope.vm.files.some(function (file) {
                        return file.name == filename
                    });

                    if (exists) {
                        angular.forEach(scope.vm.files, function (file) {
                            if (file.name == filename) {
                                file.value = value
                            }
                        })
                        scope.vm.saveFilesToLocal();
                    }
                    else {
                        scope.vm.addNewFile(filename, value);
                    };
                }

                function compileSource(name) {
                    var deferred = $q.defer();
                    var master = {
                        'LESS': '.css',
                        'COFFEE': '.js',
                        'JADE': '.html',
                        'MARKDOWN': '.html',
                        'MD': '.html',
                        'SASS': '.css',
                        'SCSS': '.css',
                        'STYL': '.css'
                    }
                    if (name.match(COMPILE_TYPES)) {
                        var type = name.match(COMPILE_TYPES)[0],
                            fileExt, compileType, out;
                        var regex = new RegExp(type.substring(1, type.length), "i");
                        for (var key in master) {
                            if (regex.test(key)) {
                                compileType = key;
                                fileExt = master[key];
                            }
                        }
                        CompileService.compile(compileType, scope.vm.dynFile.value).then(function (result) {
                            out = result;

                            if (scope.vm.dynFile.name.match(/\.(md|markdown)$/i)) {

                                var cont = "<article class='markdown-body'>" + out + '</article>';
                                var doc = (new DOMParser()).parseFromString(cont, "text/html");

                                var link = doc.createElement('link');
                                link.href = '/styles/github-markdown.css';
                                link.rel = 'stylesheet';

                                doc.getElementsByTagName('head')[0].appendChild(link);

                                out = doc.documentElement.outerHTML;
                            }

                            var filename = scope.vm.dynFile.name.substr(0, scope.vm.dynFile.name.length - type.length) + fileExt;
                            insertOrUpdate(filename, out);
                            deferred.resolve('done');
                        });
                    }
                    else {
                        insertOrUpdate(name, html);
                        deferred.resolve('done');
                    }

                    return deferred.promise;

                }

                if (scope.vm.dynFile.name != null && scope.vm.dynFile.value != '') {

                    compileSource(scope.vm.dynFile.name)
                        .then(function (result) {

                            //initalize the preview source
                            var prevsrc = scope.vm.dynFile.name;

                            if (scope.vm.dynFile.name.match(/\.(css|js|less|coffee|sass|scss|styl)$/i)) {

                                angular.forEach(scope.vm.files, function (file) {
                                    if (file.name == 'index.html') {
                                        html = file.value
                                        prevsrc = 'index.html';
                                    }
                                })
                            }
                            if (scope.vm.dynFile.name.match(/\.(jade|md|markdown)$/i)) {

                                angular.forEach(scope.vm.files, function (file) {
                                    if (file.name == scope.vm.dynFile.name.substr(0, scope.vm.dynFile.name.length - scope.vm.dynFile.name.match(/\.(jade|md|markdown)$/i)[0].length) + '.html') {
                                        html = file.value
                                        prevsrc = scope.vm.dynFile.name.substr(0, scope.vm.dynFile.name.length - scope.vm.dynFile.name.match(/\.(jade|md|markdown)$/i)[0].length) + '.html';
                                    }
                                })
                            }

                            if ('serviceWorker' in navigator) {

                                ele[0].src = 'run/' + prevsrc;
                                scope.vm.previewHTML = 'run/' + prevsrc;

                            }
                            else {
                                var iframeHtml = '';

                                function get_doctype(document) {
                                    var node = document.doctype;
                                    var doctype =
                                        "<!DOCTYPE "
                                        + node.name
                                        + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                                        + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                                        + (node.systemId ? ' "' + node.systemId + '"' : '')
                                        + '>'
                                    return doctype;
                                }

                                if (/^<!DOCTYPE/i.test(html)) {

                                    var doc = (new DOMParser()).parseFromString(html, "text/html");

                                    // or document can be created as below
                                    // doc = window.document.implementation.createHTMLDocument("")
                                    // doc.open()
                                    // doc.write(html)
                                    // if(doc.documentElement) doc.documentElement.innerHTML = html

                                    angular.forEach(scope.vm.files, function (file) {

                                        if (file.ext == 'js') {

                                            var el = doc.querySelector("script[src=\"" + file.name + "\"]");

                                            //if not found by same case then try case insentitive search
                                            if (!el) {
                                                var superSet = doc.querySelectorAll('script');
                                                var regex = new RegExp(file.name, "i");
                                                var found = [].filter.call(superSet, function (x) {
                                                    return regex.test(x.getAttribute('src'));
                                                })
                                                if (found.length > 0) el = found[0];
                                            }

                                            if (el) {
                                                var newScript = "<!-- " + file.name + " -->"
                                                    + "<script type='text/javascript'> "
                                                    + file.value + "<\/script>";

                                                //angular.element(script).remove();
                                                //angular.element(doc).find('head').append(newScript);
                                                angular.element(el).replaceWith(newScript);
                                            }
                                        }

                                    });

                                    angular.forEach(scope.vm.files, function (file) {

                                        if (file.ext == 'css') {

                                            var el = doc.querySelector("link[href=\"" + file.name + "\"]");

                                            //if not found by same case then try case insentitive search
                                            if (!el) {
                                                var superSet = doc.querySelectorAll('link');
                                                var regex = new RegExp(file.name, "i");
                                                var found = [].filter.call(superSet, function (x) {
                                                    return regex.test(x.getAttribute('href'));
                                                })
                                                if (found.length > 0) el = found[0];
                                            }

                                            if (el) {
                                                var newLink = "<!-- " + file.name + " -->"
                                                    + "<style type='text/css'> "
                                                    + file.value + "<\/style>";

                                                //angular.element(link).remove();
                                                //angular.element(doc).find('head').append(newLink);
                                                angular.element(el).replaceWith(newLink);
                                            }
                                        }

                                    });

                                    iframeHtml = HTML_BEAUTIFY(get_doctype(doc) + doc.documentElement.outerHTML);

                                }
                                else {
                                    iframeHtml = html;
                                }

                                scope.vm.previewHTML = iframeHtml;
                                var preview = ele[0].contentDocument || ele[0].contentWindow.document;
                                if (ele[0].contentWindow.angular) delete ele[0].contentWindow.angular;
                                preview.open();
                                preview.write(iframeHtml);
                                preview.close();
                            } //end sw not available

                        });
                }


                //var template = $compile(scope.message)(scope);
                //ele.replaceWith(template);   

                //ele.html(html);
                //$compile(ele.contents())(scope);
            });
        }
    }
})();

(function () {
    "use strict";
    angular.module('myapp')
        .controller("appController",
        ['$window',
            'localStorageService',
            'HTML_BEAUTIFY',
            'JS_BEAUTIFY',
            'CSS_BEAUTIFY',
            'EMMET_CODEMIRROR',
            'JSZIP',
            'SAVEAS',
            'FILE_TYPES',
            'SETTINGS',
            'DEXIE',
            function ($window, localStorageService, HTML_BEAUTIFY, JS_BEAUTIFY, CSS_BEAUTIFY, EMMET_CODEMIRROR, JSZIP, SAVEAS, FILE_TYPES, SETTINGS, DEXIE) {
                var vm = this;
                vm.dynFile = {};

                vm.files = [];
                vm.fileTypes = FILE_TYPES;
                vm.previewHTML = '';
                vm.settings = {};

                vm.saveFilesToLocal = function () {
                    if (localStorageService.isSupported) localStorageService.set('appFiles', vm.files);

                    if ('serviceWorker' in navigator) {
                        var dbname = 'cnpDB';

                        DEXIE.exists(dbname)
                            .then(function (exists) {
                                if (exists) {
                                    var db = new DEXIE(dbname);

                                    db.version(1)
                                        .stores({
                                            files: 'name, value, ext'
                                        });

                                    //copy files to db
                                    angular.forEach(vm.files, function (file) {

                                        db.files
                                            .put({
                                                name: file.name,
                                                value: file.value,
                                                ext: file.ext
                                            });
                                    });

                                }
                                else {
                                    var db = new DEXIE(dbname);
                                    // Define a schema
                                    db.version(1)
                                        .stores({
                                            files: 'name, value, ext'
                                        });

                                    //copy files to db
                                    angular.forEach(vm.files, function (file) {

                                        db.files
                                            .add({
                                                name: file.name,
                                                value: file.value,
                                                ext: file.ext
                                            });
                                    })
                                }
                            }).catch(function (error) {
                                console.error("Oops, an error occurred when trying to check database existance");
                                console.log(error);
                            });
                    }
                };

                vm.fileExists = function ($value) {
                    if ($value !== undefined) {
                        var exists = vm.files.some(function (file) {
                            return file.name.toLowerCase() == $value.toLowerCase()
                        });
                        return !exists;
                    }
                    else {
                        return false;
                    }
                };

                vm.addNewFile = function (name, val) {

                    if (!vm.fileExists(name)) {
                        alert('File cannot be added. File with this name already exists.');
                        return;
                    };

                    if (name.match(FILE_TYPES)) {

                        vm.files.push({
                            name: name,
                            value: val,
                            ext: name.split('.').pop().toLowerCase()
                        });
                        vm.saveFilesToLocal();

                        vm.newFile = ''
                        vm.addNew = false;
                    }
                    else {
                        alert('File extension not supported.');
                        vm.newFile = ''
                    }

                };

                vm.deleteFile = function (idx) {

                    if (vm.files[idx].name != 'index.html') {
                        if ($window.confirm('Are you sure you want to delete this file?')) {
                            vm.files.splice(idx, 1);
                            vm.saveFilesToLocal();
                        }
                    }
                    else {
                        alert('index.html cannot be deleted');
                    }


                }

                init();

                function init() {
                    var strVar = "";
                    strVar += "<!doctype html>";
                    strVar += "<html ng-app=\"todoApp\">";
                    strVar += "<head>";
                    strVar += "    <script src=\"https:\/\/ajax.googleapis.com\/ajax\/libs\/angularjs\/1.5.5\/angular.min.js\"><\/script>";
                    strVar += "    <script src=\"scripts.js\"><\/script>";
                    strVar += "    <link rel=\"stylesheet\" href=\"styles.css\">";
                    strVar += "<\/head>";
                    strVar += "";
                    strVar += "<body>";
                    strVar += "    <h2>Todo<\/h2>";
                    strVar += "    <div ng-controller=\"TodoListController as todoList\">";
                    strVar += "        <span>{{todoList.remaining()}} of {{todoList.todos.length}} remaining<\/span> [ <a href=\"\" ng-click=\"todoList.archive()\">archive<\/a> ]";
                    strVar += "        <ul class=\"unstyled\">";
                    strVar += "            <li ng-repeat=\"todo in todoList.todos\">";
                    strVar += "                <label class=\"checkbox\">";
                    strVar += "            <input type=\"checkbox\" ng-model=\"todo.done\">";
                    strVar += "            <span class=\"done-{{todo.done}}\">{{todo.text}}<\/span>";
                    strVar += "          <\/label>";
                    strVar += "            <\/li>";
                    strVar += "        <\/ul>";
                    strVar += "        <form ng-submit=\"todoList.addTodo()\">";
                    strVar += "            <input type=\"text\" ng-model=\"todoList.todoText\" size=\"30\" placeholder=\"add new todo here\">";
                    strVar += "            <input class=\"btn-primary\" type=\"submit\" value=\"add\">";
                    strVar += "        <\/form>";
                    strVar += "    <\/div>";
                    strVar += "<\/body>";
                    strVar += "";
                    strVar += "<\/html>";

                    var strJS = "";
                    strJS += "angular.module('todoApp', [])";
                    strJS += "  .controller('TodoListController', function() {";
                    strJS += "    var todoList = this;";
                    strJS += "    todoList.todos = [";
                    strJS += "      {text:'learn angular', done:true},";
                    strJS += "      {text:'build an angular app', done:false}];";
                    strJS += " ";
                    strJS += "    todoList.addTodo = function() {";
                    strJS += "      todoList.todos.push({text:todoList.todoText, done:false});";
                    strJS += "      todoList.todoText = '';";
                    strJS += "    };";
                    strJS += " ";
                    strJS += "    todoList.remaining = function() {";
                    strJS += "      var count = 0;";
                    strJS += "      angular.forEach(todoList.todos, function(todo) {";
                    strJS += "        count += todo.done ? 0 : 1;";
                    strJS += "      });";
                    strJS += "      return count;";
                    strJS += "    };";
                    strJS += " ";
                    strJS += "    todoList.archive = function() {";
                    strJS += "      var oldTodos = todoList.todos;";
                    strJS += "      todoList.todos = [];";
                    strJS += "      angular.forEach(oldTodos, function(todo) {";
                    strJS += "        if (!todo.done) todoList.todos.push(todo);";
                    strJS += "      });";
                    strJS += "    };";
                    strJS += "  });";

                    var strLess = "@base: green; .done-true { text-decoration: line-through;color: @base}";

                    if (localStorageService.isSupported) {
                        var appFiles = localStorageService.get('appFiles');

                        if (appFiles != null && appFiles.length > 0) {
                            vm.files = appFiles;
                        }
                        else {
                            vm.addNewFile('index.html', strVar);
                            vm.addNewFile('scripts.js', strJS);
                            vm.addNewFile('styles.less', strLess);

                            vm.saveFilesToLocal();
                        }
                    }
                    else {
                        vm.addNewFile('index.html', strVar);
                        vm.addNewFile('scripts.js', strJS);
                        vm.addNewFile('styles.less', strLess);
                    }

                    //set the default settings
                    vm.settings = SETTINGS;
                    vm.actSize = 'fit';

                }


                var delay;
                var the = {
                    beautify_in_progress: false,
                    editor: null
                };


                var editorOptions = {
                    lineNumbers: true,
                    lineWrapping: true,
                    mode: "text/html",
                    matchBrackets: true,
                    matchTags: { bothTags: true },
                    foldGutter: true,
                    gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                    lint: true,
                    extraKeys: {
                        "Ctrl-Space": "autocomplete",
                        "Ctrl-J": "toMatchingTag",
                        "Ctrl-Q": function (cm) { cm.foldCode(cm.getCursor()); },
                        "Ctrl-Alt-F": function (cm) { beautify(cm) },
                        "F11": function (cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));

                            //show/hide the preview panes and resizer
                            if ($('.CodeMirror').hasClass('CodeMirror-fullscreen')) {
                                window.myLayoutOuter.close('west');
                                window.myLayoutInner.sizePane('west', '100%');
                            }
                            else {
                                window.myLayoutOuter.open('west');
                                window.myLayoutInner.sizePane('west', '50%');
                            }
                        },
                        "Esc": function (cm) {
                            if (cm.getOption("fullScreen")) {
                                cm.setOption("fullScreen", false)
                                //show the preview panes and resizer
                                window.myLayoutOuter.open('west');
                                window.myLayoutInner.sizePane('west', '50%');
                            };
                        }
                    },
                    // define Emmet output profile
                    profile: 'xhtml'
                };

                vm.editorOptions = editorOptions;
                vm.modelOptions = {
                    updateOn: 'default blur',
                    debounce: {
                        default: vm.settings.preview_delay,
                        blur: 0
                    }
                }

                vm.codemirrorLoaded = function (_editor) {
                    EMMET_CODEMIRROR(_editor);
                    _editor.setSize("100%", "100%");
                    vm.editor = _editor;
                };

                vm.setEditorValue = function (file) {
                    var source;

                    //copy back to file store
                    angular.forEach(vm.files, function (file) {
                        if (file.name == vm.dynFile.name) {
                            file.value = vm.dynFile.value
                        }
                    })

                    vm.saveFilesToLocal();

                    switch (file.ext) {
                        case 'html':
                            vm.editor.setOption('mode', 'text/html');
                            vm.editor.setOption('lint', true);
                            //source = file.value;
                            //vm.dynHtml = html_beautify(source);
                            break;
                        case 'js':
                            vm.editor.setOption('mode', 'text/javascript');
                            vm.editor.setOption('lint', true);
                            break;
                        case 'css':
                            vm.editor.setOption('mode', 'text/css');
                            vm.editor.setOption('lint', true);
                            break;
                        case 'less':
                            vm.editor.setOption('mode', 'text/x-less');
                            vm.editor.setOption('lint', false);
                            break;
                        case 'coffee':
                            vm.editor.setOption('mode', 'text/x-coffeescript');
                            vm.editor.setOption('lint', true);
                            break;
                        case 'jade':
                            vm.editor.setOption('mode', 'text/x-jade');
                            vm.editor.setOption('lint', false);
                            break;
                        case 'md':
                        case 'markdown':
                            vm.editor.setOption('mode', 'text/x-markdown');
                            vm.editor.setOption('lint', false);
                            break;
                        case 'sass':
                            vm.editor.setOption('mode', 'text/x-sass');
                            vm.editor.setOption('lint', false);
                            break;
                        case 'scss':
                            vm.editor.setOption('mode', 'text/x-scss');
                            vm.editor.setOption('lint', false);
                            break;
                        case 'styl':
                            vm.editor.setOption('mode', 'text/x-styl');
                            vm.editor.setOption('lint', false);
                            break;
                    }

                    vm.dynFile = file;
                    //vm.editor.setValue(source);
                }

                //http://jsbeautifier.org/
                function beautify(editor) {
                    if (the.beautify_in_progress) return;

                    the.editor = editor;
                    the.beautify_in_progress = true;

                    var source = the.editor ? the.editor.getValue() : null,
                        output,
                        mode = the.editor ? the.editor.getOption("mode") : null;

                    if (source == null) return;

                    if (mode == "text/html") {
                        output = HTML_BEAUTIFY(source);
                    } else if (mode == "text/javascript") {
                        output = JS_BEAUTIFY(source);
                    } else if (mode == "text/css") {
                        output = CSS_BEAUTIFY(source);
                    }
                    else if (mode == "text/x-less") {
                        output = CSS_BEAUTIFY(source);
                    }
                    else {
                        output = source;
                    }

                    if (the.editor) {
                        the.editor.setValue(output);
                    }

                    the.beautify_in_progress = false;
                }


                vm.downloadZip = function () {
                    var zip = new JSZIP();

                    angular.forEach(vm.files, function (file) {
                        zip.file(file.name, file.value)
                    })

                    //add the generated preview html file
                    zip.file('_preview.html', vm.previewHTML)

                    zip.generateAsync({ type: "blob" })
                        .then(function (content) {
                            SAVEAS(content, "codenpreview.zip");
                        });
                };

                vm.previewWindow = function () {

                    if ('serviceWorker' in navigator) {

                        var win = window.open(vm.previewHTML, "Preview", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=780, height=500");

                    }
                    else {
                        var win = window.open("about:blank", "Preview", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=780, height=500");
                        var preview = win.contentDocument || win.document;
                        if (win.angular) delete win.angular;
                        preview.open();
                        preview.write(vm.previewHTML);
                        preview.close();
                    }
                };

                vm.setDeviceSize = function (size, e) {
                    angular.element('#preview').css({ width: size + 'px' });
                };

                vm.setFitSize = function () {
                    angular.element('#preview').css({ width: '100%' });
                };

            }])

} ());