(function () {
    "use strict";
    angular.module('myapp')
        .controller("appController",
        ['localStorageService',
            'HTML_BEAUTIFY',
            'JS_BEAUTIFY',
            'CSS_BEAUTIFY',
            'EMMET_CODEMIRROR',
            'JSZIP',
            'SAVEAS',
            function (localStorageService, HTML_BEAUTIFY, JS_BEAUTIFY, CSS_BEAUTIFY, EMMET_CODEMIRROR, JSZIP, SAVEAS) {
                var vm = this;
                vm.dynFile = {};

                vm.files = [];
                vm.previewHTML = '';

                function saveFilesToLocal() {
                    if (localStorageService.isSupported) localStorageService.set('appFiles', vm.files);
                };

                vm.addNewFile = function (name, val) {
                    var exists = vm.files.some(function (file) {
                        return file.name == name
                    });

                    if (exists) {
                        alert('File cannot be added. File with this name already exists.');
                        return;
                    };

                    if (name.match(/\.(html|css|js|less|coffee|jade|sass|scss|styl|md|markdown)$/i)) {

                        vm.files.push({
                            name: name,
                            value: val
                        });
                        saveFilesToLocal();

                        vm.newFile = ''
                        vm.addNew = false;
                    }
                    else {
                        alert('File extension not supported.');
                        vm.newFile = ''
                    }

                };

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

                        if (appFiles) {
                            vm.files = appFiles;
                        }
                        else {
                            vm.addNewFile('index.html', strVar);
                            vm.addNewFile('scripts.js', strJS);
                            vm.addNewFile('styles.less', strLess);

                            saveFilesToLocal();
                        }
                    }
                    else {
                        vm.addNewFile('index.html', strVar);
                        vm.addNewFile('scripts.js', strJS);
                        vm.addNewFile('styles.less', strLess);
                    }

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
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                    extraKeys: {
                        "Ctrl-Space": "autocomplete",
                        "Ctrl-J": "toMatchingTag",
                        "Ctrl-Q": function (cm) { cm.foldCode(cm.getCursor()); },
                        "Ctrl-Alt-F": function (cm) { beautify(cm) },
                        "F11": function (cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function (cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        }
                    },
                    // define Emmet output profile
                    profile: 'xhtml'
                };

                vm.editorOptions = editorOptions;
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

                    saveFilesToLocal();

                    if (file.name.match(/\.html$/i)) {
                        vm.editor.setOption('mode', 'text/html');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = html_beautify(source);
                    }
                    else if (file.name.match(/\.js$/i)) {
                        vm.editor.setOption('mode', 'text/javascript');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = js_beautify(source);
                    }
                    else if (file.name.match(/\.css$/i)) {
                        vm.editor.setOption('mode', 'text/css');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = css_beautify(source);
                    }
                    else if (file.name.match(/\.less$/i)) {
                        vm.editor.setOption('mode', 'text/x-less');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = css_beautify(source);
                    }
                    else if (file.name.match(/\.coffee$/i)) {
                        vm.editor.setOption('mode', 'text/x-coffeescript');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = css_beautify(source);
                    }
                    else if (file.name.match(/\.jade$/i)) {
                        vm.editor.setOption('mode', 'text/x-jade');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = css_beautify(source);
                    }
                    else if (file.name.match(/\.(md|markdown)$/i)) {
                        vm.editor.setOption('mode', 'text/x-markdown');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = css_beautify(source);
                    }
                    else if (file.name.match(/\.sass$/i)) {
                        vm.editor.setOption('mode', 'text/x-sass');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = css_beautify(source);
                    }
                    else if (file.name.match(/\.scss$/i)) {
                        vm.editor.setOption('mode', 'text/x-scss');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = css_beautify(source);
                    }
                    else if (file.name.match(/\.styl$/i)) {
                        vm.editor.setOption('mode', 'text/x-styl');
                        //source = file.value;
                        vm.dynFile = file;
                        //vm.dynHtml = css_beautify(source);
                    }
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

                    var win = window.open("about:blank", "Preview", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=780, height=500");
                    var preview = win.contentDocument || win.document;
                    if (win.angular) delete win.angular;
                    preview.open();
                    preview.write(vm.previewHTML);
                    preview.close();
                };

            }])

} ());