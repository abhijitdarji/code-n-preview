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
            'DataService',
            function ($window, localStorageService, HTML_BEAUTIFY, JS_BEAUTIFY, CSS_BEAUTIFY, EMMET_CODEMIRROR, JSZIP, SAVEAS, FILE_TYPES, SETTINGS, DEXIE, DataService) {
                var vm = this;
                vm.dynFile = {};
                vm.curWrk = '';
                vm.workspaces = [];
                vm.snippets = {};

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

                    //set the snippets menu
                    DataService.getSnippets().then(function (result) {
                        vm.snippetDef = result.data.def;
                    })

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
                        case 'ts':
                            vm.editor.setOption('mode', 'text/typescript');
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
                    } else if (mode == "text/javascript" || mode == "text/typescript") {
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