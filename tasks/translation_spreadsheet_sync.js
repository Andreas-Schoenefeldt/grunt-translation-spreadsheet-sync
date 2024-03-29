/*
 * grunt-translation-spreadsheet-sync
 * https://github.com/Andreas-Schoenefeldt/grunt-translation-spreadsheet-sync
 *
 * Copyright (c) 2019 Andreas Schönefeldt
 * Licensed under the MIT license.
 */

'use strict';

const gstSync = require('google-spreadsheet-translation-sync');
const path = require('path');

const MODE = {
    IMPORT: 'import',
    UPLOAD: 'upload'
};

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('translation_spreadsheet_sync', 'A grunt plugin to manage translation import/export to and from a google spreadsheet', function() {
        const done = this.async();

        // Merge task-specific and/or target-specific options with these defaults.
        const options = this.options({
            keyId: 'key',
            gid: '0',
            credentials: require('google-spreadsheet-translation-sync/test/data/google-test-access.json'),
            fileBaseName: '',
            translationFormat: 'locale_json',
            defaultLocaleName: 'default',
            defaultFallback: false,
            namespaceSeparator: '-'
        });

        if (! options.spreadsheetId) {
            grunt.fatal('The option spreadsheetId must be defined!');
        }

        if (! options.mode) {
            grunt.fatal('The option mode must be defined!');
        }

        if (gstSync.possibleTranslationFormats.indexOf(options.translationFormat) < 0) {
            grunt.fatal('The option translationFormat must be one of ' + gstSync.possibleTranslationFormats.join(', ') + '!');
        }

        let translationFiles = [];
        let rootFolder = null;

        this.files.forEach( function (f) {
            const files = f.src.filter(function(filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else if (options.mode === MODE.IMPORT) {
                    let base;

                    if (grunt.file.isFile(filepath)) {
                        base = path.dirname(filepath);
                    } else if (grunt.file.isDir(filepath)) {
                        base = filepath;
                    }

                    if (!rootFolder || rootFolder === base) {
                        rootFolder = base;
                    } else {
                        grunt.log.warn('Your file configuration matches more then one root folder, we stick to  "' + rootFolder + ' (ignored ' + base + ')');
                    }
                }
                return true;
            });

            translationFiles = translationFiles.concat(files.map( function (file) {
                return path.resolve(file);
            }));
        });

        switch (options.mode) {
            default:
                grunt.fatal('Unrecognised mode option value ' + options.mode);
                break;
            case MODE.UPLOAD:
                gstSync.exportToSpreadsheet(translationFiles, options, function (err) {
                    if (err) {
                        grunt.fatal(err)
                    } else {
                        done();
                    }
                });
                break;
            case MODE.IMPORT:
                gstSync.importFromSpreadsheet(path.resolve(rootFolder), options, function (err) {
                    if (err) {
                        grunt.fatal(err)
                    } else {
                        done();
                    }
                });
                break;
        }
    });

};
