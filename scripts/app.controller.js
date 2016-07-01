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
                vm.Math = $window.Math;
                vm.dynFile = {};
                vm.curWrk = {};
                vm.workspaces = [];
                vm.snippets = {};
                vm.libraries = {};
                vm.templates = {};

                vm.files = [];
                vm.fileTypes = FILE_TYPES;
                vm.previewHTML = '';
                vm.settings = {};


                function addTemplateFiles(wrk, id) {

                    //set the libraries menu
                    var temp;
                    angular.forEach(vm.templates, function (tp) {
                        if (tp.id == id) temp = tp;
                    })

                    vm.files = [];
                    angular.forEach(temp.files, function (file) {

                        if (angular.isDefined(file.templateUrl)) {
                            DataService.getTemplateFromUrl(file.name, file.templateUrl).then(function (result) {
                                vm.addNewFile(file.name, result.data);
                            })
                        }
                        else {
                            vm.addNewFile(file.name, file.template);
                        }

                    })

                    wrk.files = vm.files;
                }

                vm.addWorkspace = function (name, type) {

                    if (name == null) {
                        name = prompt("Please enter workspace name", "HTML Sample");
                    }

                    if (name != null) {
                        var newWrk = {};
                        newWrk.name = name;
                        addTemplateFiles(newWrk, type);
                        vm.workspaces.push(newWrk);
                        vm.selectWorkspace(vm.workspaces.length - 1);
                    }
                }

                vm.selectWorkspace = function (id) {
                    vm.curWrk = vm.workspaces[id];
                    vm.files = vm.curWrk.files;
                    vm.dynFile = {};
                    vm.previewHTML = '';
                    vm.saveFilesToLocal();
                    angular.forEach(vm.files, function (file) {
                        if (file.name == 'index.html') {
                            vm.setEditorValue(file);
                        }
                    });
                }

                vm.saveFilesToLocal = function () {
                    vm.curWrk.files = vm.files;

                    angular.forEach(vm.workspaces, function (wrk) {
                        if (vm.curWrk.name == wrk.name) wrk.files = vm.curWrk.files;
                    });

                    if (localStorageService.isSupported) localStorageService.set('appWrkSp', vm.workspaces);

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

                vm.fileNotExists = function ($value) {
                    if ($value !== undefined) {
                        if (vm.files === undefined) return true;
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

                    if (!vm.fileNotExists(name)) {
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

                vm.deleteWorkspace = function (idx) {

                    if (vm.workspaces[idx].name != 'Default') {
                        if ($window.confirm('Are you sure you want to delete this workspace and all the files in it?')) {
                            vm.workspaces.splice(idx, 1);
                            vm.selectWorkspace(0);
                        }
                    }
                    else {
                        alert('Default workspace cannot be deleted');
                    }

                }

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

                    //set the default settings
                    vm.settings = SETTINGS;
                    vm.actSize = 'fit';

                    //set the snippets menu
                    DataService.getSnippets().then(function (result) {
                        vm.snippetDef = result.data.def;

                        //set the snippets on emmet
                        EMMET_CODEMIRROR.emmet.loadUserData(result.data);
                    });

                    //set the libraries menu
                    DataService.getLibraries().then(function (result) {
                        vm.libraries = result.data.categories;
                    });

                    DataService.getTemplates().then(function (result) {
                        vm.templates = result.data.templates;

                        if (localStorageService.isSupported) {
                            var appWrkSp = localStorageService.get('appWrkSp');

                            if (appWrkSp != null && appWrkSp.length > 0) {
                                vm.workspaces = appWrkSp;
                                vm.selectWorkspace(0);
                            }
                            else {
                                vm.addWorkspace('Default', 0);

                                vm.saveFilesToLocal();
                            }
                        }
                        else {
                            vm.addWorkspace('Default', 0);
                        }
                    });


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

                    angular.forEach(vm.workspaces, function (wrk) {
                        angular.forEach(wrk.files, function (file) {
                            zip.file(wrk.name + '/' + file.name, file.value)
                        })
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

                vm.setEditorSnippet = function (cmd) {
                    vm.editor.replaceRange(cmd, vm.editor.getCursor());
                    vm.editor.execCommand('emmet.expand_abbreviation');
                }

                vm.addLibrary = function (ver, lib) {

                    function clearPreviousInsert(doc, data) {
                        $('[data-cnp=' + data + '-d],[data-cnp=' + data + '-m],[data-cnp=' + data + '-y]', doc).remove();
                    }

                    if (vm.dynFile.ext == 'html') {
                        var doc = (new DOMParser()).parseFromString(vm.dynFile.value, "text/html");

                        clearPreviousInsert(doc, lib);

                        //dependencies
                        angular.forEach(ver.dependencies, function (src) {
                            var sr = doc.createElement('script');
                            sr.src = src;
                            sr.type = 'text/javascript';
                            sr.setAttribute('data-cnp', lib + '-d');

                            doc.getElementsByTagName('head')[0].appendChild(sr);
                        });

                        //actual script files
                        angular.forEach(ver.scripts, function (src) {
                            var sr = doc.createElement('script');
                            sr.src = src;
                            sr.type = 'text/javascript';
                            sr.setAttribute('data-cnp', lib + '-m');

                            doc.getElementsByTagName('head')[0].appendChild(sr);
                        });

                        //styles 
                        angular.forEach(ver.styles, function (url) {
                            var link = doc.createElement('link');
                            link.href = url;
                            link.rel = 'stylesheet';
                            link.setAttribute('data-cnp', lib + '-y');

                            doc.getElementsByTagName('head')[0].appendChild(link);
                        });

                        vm.dynFile.value = HTML_BEAUTIFY(doc.documentElement.outerHTML, {
                            "max_preserve_newlines": 1
                        });
                    }
                    else {
                        alert('please load html document to add library');
                    }
                }

            }])

} ());