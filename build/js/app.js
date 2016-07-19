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
        .constant('TYPESCRIPT', ts)
        .constant('DEXIE', window.Dexie) //index db add update
        .constant('INLET', window.Inlet) //css color picker
        .constant('FILE_TYPES', /\.(html|css|js|less|coffee|jade|sass|scss|styl|md|markdown|ts|json|txt)$/i)
        .constant('COMPILE_TYPES', /\.(less|coffee|jade|sass|scss|styl|md|markdown|ts)$/i)
        .constant('COMPILE_MAP',
        {
            'LESS': '.css',
            'COFFEE': '.js',
            'JADE': '.html',
            'MARKDOWN': '.html',
            'MD': '.html',
            'SASS': '.css',
            'SCSS': '.css',
            'STYL': '.css',
            'TS': '.js'
        })
        .constant('SETTINGS', {
            preview_delay: 500,
            auto_refresh: true,
            view_compiled: false,
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
        .factory('DataService', DataService);

    DataService.$inject = ['$http'];
    function DataService($http) {
        var service = {
            getSnippets: getSnippets,
            getTemplates: getTemplates,
            getLibraries: getLibraries,
            getTemplateFromUrl: getTemplateFromUrl
        };

        return service;

        ////////////////

        function getSnippets() {
            return $http.get('data/snippets.json');
        }

        function getTemplates() {
            return $http.get('data/templates.json');
        }

        function getLibraries() {
            return $http.get('data/libraries.json');
        }

        function getTemplateFromUrl(name, url) {
            var fetchURL = "data/" + url + name;
            return $http.get(fetchURL);
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('myapp')
        .factory('CompileService', CompileService);

    CompileService.$inject = ['$q', 'LESS', 'COFFEESCRIPT', 'JADE', 'MARKDOWN', 'SASS', 'STYLUS', 'TYPESCRIPT'];
    function CompileService($q, LESS, COFFEESCRIPT, JADE, MARKDOWN, SASS, STYLUS, TYPESCRIPT) {
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
                case 'TS':
                    result = typescript(input);
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

        function typescript(input) {
            var out;
            out = TYPESCRIPT.transpile(input);
            return out;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('myapp')
        .directive('compile', compile);

    compile.$inject = ['$compile', 'CompileService', 'HTML_BEAUTIFY', '$q', 'COMPILE_TYPES','COMPILE_MAP'];
    function compile($compile, CompileService, HTML_BEAUTIFY, $q, COMPILE_TYPES, COMPILE_MAP) {
        // Usage:
        // watches editor for changes and generates preview html
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;

        function link(scope, ele, attrs) {
            scope.$watch(attrs.compile, function (html) {

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

                function insertOrUpdate(filename, value, compiled) {
                    compiled = compiled || false;

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
                        scope.vm.addNewFile(filename, value, compiled);
                    };
                }

                function compileSource(name) {
                    var deferred = $q.defer();
                    if (name.match(COMPILE_TYPES)) {
                        var type = name.match(COMPILE_TYPES)[0],
                            fileExt, compileType, out;
                        var regex = new RegExp(type.substring(1, type.length), "i");
                        for (var key in COMPILE_MAP) {
                            if (regex.test(key)) {
                                compileType = key;
                                fileExt = COMPILE_MAP[key];
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
                            insertOrUpdate(filename, out, true);
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

                            if (scope.vm.dynFile.name.match(/\.(css|js|less|coffee|sass|scss|styl|ts)$/i)) {

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
        ['$scope','$window',
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
            'INLET',
            'DataService',
            'COMPILE_TYPES',
            'COMPILE_MAP',
            function ($scope, $window, localStorageService, HTML_BEAUTIFY, JS_BEAUTIFY, CSS_BEAUTIFY, EMMET_CODEMIRROR, JSZIP, SAVEAS, FILE_TYPES, SETTINGS, DEXIE, INLET, DataService, COMPILE_TYPES, COMPILE_MAP) {
                var vm = this;
                vm.Math = $window.Math;
                vm.dynFile = {};
                vm.curWrk = {};
                vm.workspaces = [];
                vm.snippets = {};
                vm.libraries = {};
                vm.templates = {};
                vm.isSignedIn;
                vm.User ={};

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
                        name = $window.prompt("Please enter workspace name", "New Workspace");
                        if (name == '' || name.length > 14) {
                            alert('Name should be less than 15 characters.');
                            name = null;
                            vm.addWorkspace(name, type);
                        }
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

                vm.addNewFile = function (name, val, compiled) {
                    compiled = compiled || false;

                    if (!vm.fileNotExists(name)) {
                        alert('File cannot be added. File with this name already exists.');
                        return;
                    };

                    if (name.match(FILE_TYPES)) {

                        vm.files.push({
                            name: name,
                            value: val,
                            ext: name.split('.').pop().toLowerCase(),
                            compiled: compiled
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

                    initializeGoogle();

                }//end init

                function initializeGoogle() {
                    var developerKey = 'AIzaSyApc4j41xla_dAc74Qw387Py3lR9W24Q1g';
                    var clientId = "341449015859-0pru6i8ecf7qbif87lkc8c2v1bf81pis.apps.googleusercontent.com"
                    var scope = 'profile email https://www.googleapis.com/auth/drive.readonly';
                    var pickerApiLoaded = false;
                    var driveApiLoaded = false;
                    var oauthToken;
                    var auth2; // The Sign-In object.
                    var signinButton = document.getElementById('gSignin2');
                    var signoutButton = document.getElementById('signout-button');
                    var disconnectButton = document.getElementById('disconnect-button');
                    var pickerButton = document.getElementById('gFile');
                    signoutButton.onclick = handleSignoutClick;
                    disconnectButton.onclick = handleDisconnectClick;
                    pickerButton.onclick = handlePickerClick;

                    function handleSignoutClick(event) {
                        auth2.signOut();
                    }
                    function handleDisconnectClick(event) {
                        auth2.disconnect();
                    }
                    function handlePickerClick(event) {
                        createPicker();
                    }

                    gapi.load('auth2', initAuth);

                    gapi.load('picker', {
                        'callback': onPickerApiLoad
                    });
                    gapi.client.load('drive', 'v3', onDriveApiLoad);

                    function initAuth() {

                        var signinChanged = function (isSignedIn) { 
                            vm.isSignedIn = isSignedIn;
                            $scope.$apply();
                        }

                        var userChanged = function (user) { 
                            if(vm.isSignedIn){
                                var profile = user.getBasicProfile();
                                vm.User = {
                                    image: profile.getImageUrl(),
                                    name: profile.getName(),
                                    email: profile.getEmail()
                                }
                                oauthToken = user.getAuthResponse().access_token; 
                            }
                            $scope.$apply();
                        };
                        
                        gapi.client.setApiKey(developerKey);
                        auth2 = gapi.auth2.init({
                            client_id: clientId,
                            scope: scope
                        });
                         // Listen for sign-in state changes. 
                        auth2.isSignedIn.listen(signinChanged); 
                        // Handle the initial sign-in state.
                        //signinChanged(auth2.isSignedIn.get());
                        // Listen for changes to current user. 
                        auth2.currentUser.listen(userChanged); 

                         gapi.signin2.render('gSignin2', {
                                'scope': scope,
                                'width': 150,
                                'height': 50
                                //'longtitle': true,
                                //'theme': 'dark',
                                // 'onsuccess': onSuccess,
                                // 'onfailure': onFailure
                            });

                    }

                    function onDriveApiLoad() {
                        driveApiLoaded = true;
                    }

                    function onPickerApiLoad() {
                        pickerApiLoaded = true;
                    }

                    function createPicker() {
                        var mimes = [
                            "text/html",
                            "application/javascript",
                            "text/css",
                            "text/x-less",
                            "text/x-coffeescript",
                            "application/octet-stream",
                            "text/x-jade",
                            "text/x-markdown",
                            "text/x-sass",
                            "text/x-scss",
                            "text/x-styl",
                            "text/x-typescript",
                            "application/json",
                            "text/plain"
                        ]
                        if (pickerApiLoaded && oauthToken) {
                            var docsView = new google.picker.DocsView(google.picker.ViewId.DOCS);
                            docsView.setParent('ROOT');
                            docsView.setIncludeFolders(true);
                            docsView.setMimeTypes(mimes.join(','));

                            var picker = new google.picker.PickerBuilder().
                                enableFeature(google.picker.Feature.NAV_HIDDEN).
                                enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
                                addView(docsView).
                                setOAuthToken(oauthToken).
                                setDeveloperKey(developerKey).
                                setCallback(pickerCallback).
                                build();
                            picker.setVisible(true);
                        }
                        else{
                            auth2.signIn();
                        }
                    }

                    // A simple callback implementation.
                    function pickerCallback(data) {
                        var id;
                        var name;
                        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                            var doc = data[google.picker.Response.DOCUMENTS][0];
                            name = doc[google.picker.Document.NAME];
                            id = doc[google.picker.Document.ID];
                        }

                        if (driveApiLoaded && id) {
                            var request = gapi.client.drive.files.get({
                                fileId: id,
                                alt: 'media'
                            });

                            request.then(function (resp) {
                                vm.addNewFile(name, resp.body);
                                $scope.$apply();
                            });
                        }

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
                    INLET(_editor);
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
                        case 'json':
                            vm.editor.setOption('mode', 'application/json');
                            vm.editor.setOption('lint', true);
                            break;
                        case 'txt':
                            vm.editor.setOption('mode', 'null');
                            vm.editor.setOption('lint', false);
                            break;
                    }

                    vm.dynFile = file;
                    //vm.editor.setValue(source);

                    setGoogleSaveURL();
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

                function setGoogleSaveURL() {
                    gapi.savetodrive.render(
                        'gDrive',
                        {
                            "src": "/run/" + vm.dynFile.name,
                            "filename": vm.dynFile.name,
                            "sitename": "Code-N-Preview"
                        }
                    );
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

                vm.dynViewCompiled = function () {
                    return vm.dynFile.name && !vm.dynFile.name.match(COMPILE_TYPES);
                }

                vm.hideCompiled = function () {
                    var type = vm.dynFile.name.match(COMPILE_TYPES)[0],
                        fileExt, compFileName;
                    var regex = new RegExp(type.substring(1, type.length), "i");
                    for (var key in COMPILE_MAP) {
                        if (regex.test(key)) {
                            fileExt = COMPILE_MAP[key];
                        }
                    }

                    compFileName = vm.dynFile.name.substr(0, vm.dynFile.name.length - type.length) + fileExt;

                    angular.forEach(vm.files, function (file) {
                        if (file.name == compFileName) {
                            file.isVisible = vm.dynFile.view_compiled;
                        }
                        else if (file.name == vm.dynFile.name) {
                            file.view_compiled = vm.dynFile.view_compiled;
                        }
                    })

                }

                vm.globViewCompiled = function () {
                    angular.forEach(vm.files, function (file) {
                        if (file.compiled) {
                            file.isVisible = vm.settings.view_compiled;
                        }

                        if (file.name.match(COMPILE_TYPES)) {
                            file.view_compiled = vm.settings.view_compiled;
                        }
                    })
                }


            }])

} ());