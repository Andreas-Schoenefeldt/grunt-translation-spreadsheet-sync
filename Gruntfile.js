/*
 * grunt-translation-spreadsheet-sync
 * https://github.com/Andreas-Schoenefeldt/grunt-translation-spreadsheet-sync
 *
 * Copyright (c) 2019 Andreas Schönefeldt
 * Licensed under the MIT license.
 */

'use strict';

const semver = require('semver');

module.exports = function(grunt) {

    const pkg = grunt.file.readJSON('package.json');
    const currentVersion = pkg.version;

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        translation_spreadsheet_sync: {
            default_options: {
                options: {
                },
                files: {
                    'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
                }
            },
            custom_options: {
                options: {
                    separator: ': ',
                    punctuation: ' !!!'
                },
                files: {
                    'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']
                }
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        },

        bump: {
            options: {
                files: ['package.json'],
                commitFiles: ['-a'],
                pushTo: 'origin',
                globalReplace: true,
                // regExp: /(['|"]?version['|"]?[ ]*:[ ]*['|"]?|^framework:[\S\s]*?assets:[\s]*version:[ ]*)(\d+\.\d+\.\d+(-false\.\d+)?(-\d+)?)[\d||A-a|.|-]*(['|"]?)/gmi
            }
        },
        prompt: {
            bump: {
                options: {
                    questions: [
                        {
                            config:  'bump.options.setVersion',
                            type:    'list',
                            message: 'Bump version from ' + '<%= pkg.version %>' + ' to:',
                            choices: [
                                {
                                    value: semver.inc(currentVersion, 'patch'),
                                    name:  'Patch:  ' + semver.inc(currentVersion, 'patch') + ' Backwards-compatible bug fixes.'
                                },
                                {
                                    value: semver.inc(currentVersion, 'minor'),
                                    name:  'Minor:  ' + semver.inc(currentVersion, 'minor') + ' Add functionality in a backwards-compatible manner.'
                                },
                                {
                                    value: semver.inc(currentVersion, 'major'),
                                    name:  'Major:  ' + semver.inc(currentVersion, 'major') + ' Incompatible API changes.'
                                },
                                {
                                    value: 'custom',
                                    name:  'Custom: ?.?.? Specify version...'
                                }
                            ]
                        },
                        {
                            config:   'bump.options.setVersion',
                            type:     'input',
                            message:  'What specific version would you like',
                            when:     function (answers) {
                                return answers['bump.options.setVersion'] === 'custom';
                            },
                            validate: function (value) {
                                var valid = semver.valid(value);
                                return !!valid || 'Must be a valid semver, such as 1.2.3-rc1. See http://semver.org/ for more details.';
                            }
                        }
                    ]
                }
            }
        },

        shell: {
            publish_npm: {
                command: 'npm publish'
            }
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-shell');


    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'translation_spreadsheet_sync', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

    grunt.registerTask('build', 'Production Build', function() {
        grunt.task.run('prompt', 'bump', 'shell:publish_npm');
    });

};
