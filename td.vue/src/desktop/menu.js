'use strict';

import { app, dialog } from 'electron';
import path from 'path';
import logger from './logger.js';
import { isMacOS } from './utils.js';

const { shell } = require('electron');
const fs = require('fs');

// provided by electron server bootstrap
var mainWindow;

// access the i18n message strings
import deu from '@/i18n/de.js';
import ell from '@/i18n/el.js';
import eng from '@/i18n/en.js';
import fra from '@/i18n/fr.js';
import hin from '@/i18n/hi.js';
import por from '@/i18n/pt.js';
import rus from '@/i18n/ru.js';
import spa from '@/i18n/es.js';
import ukr from '@/i18n/uk.js';
import zho from '@/i18n/zh.js';

const messages = { deu, ell, eng, fra, hin, por, rus, spa, ukr, zho };
const languages = [ 'deu', 'ell', 'eng', 'fra', 'hin', 'por', 'rus', 'spa', 'ukr', 'zho' ];
const defaultLanguage = 'eng';
var language = defaultLanguage;

export const model = {
    fileDirectory: '',
    filePath: '',
    isOpen: false
};

export function getMenuTemplate () {
    return [
        ...(isMacOS ? [{ role: 'appMenu' }] : []),
        {
            label: messages[language].desktop.file.heading,
            submenu: [
                {
                    label: messages[language].desktop.file.open,
                    click () {
                        openModel();
                    }
                },
                {
                    role: 'recentdocuments',
                    submenu: [
                        { role: 'clearrecentdocuments' }
                    ]
                },
                {
                    label: messages[language].desktop.file.save,
                    click () {
                        saveModel();
                    }
                },
                {
                    label: messages[language].desktop.file.saveAs,
                    click () {
                        saveModelAs();
                    }
                },
                {
                    label: messages[language].desktop.file.new,
                    click () {
                        newModel();
                    }
                },
                {
                    label: messages[language].forms.savePdf,
                    click () {
                        printModel();
                        modelPrint('PDF');
                    }
                },
                {
                    label: messages[language].forms.saveHtml,
                    click () {
                        printModel();
                        modelPrint('HTML');
                    }
                },
                {
                    label: messages[language].desktop.file.close,
                    click () {
                        closeModel();
                    }
                },
                { type: 'separator' },
                { role: 'close' }
            ]
        },
        { role: 'editMenu' },
        { role: 'viewMenu' },
        { role: 'windowMenu' },
        {
            label: messages[language].desktop.help.heading,
            submenu: [
                {
                    label: messages[language].desktop.help.docs,
                    click: async () => {
                        await shell.openExternal('https://owasp.org/www-project-threat-dragon/docs-2/');
                    }
                },
                {
                    label: messages[language].desktop.help.visit,
                    click: async () => {
                        await shell.openExternal('https://owasp.org/www-project-threat-dragon/');
                    }
                },
                {
                    label: messages[language].desktop.help.sheets,
                    click: async () => {
                        await shell.openExternal('https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html');
                    }
                },
                { type: 'separator' },
                {
                    label: messages[language].desktop.help.github,
                    click: async () => {
                        await shell.openExternal('https://github.com/owasp/threat-dragon/');
                    }
                },
                {
                    label: messages[language].desktop.help.submit,
                    click: async () => {
                        await shell.openExternal('https://github.com/owasp/threat-dragon/issues/new/choose/');
                    }
                },
                {
                    label: messages[language].desktop.help.check,
                    click: async () => {
                        await shell.openExternal('https://github.com/OWASP/threat-dragon/releases/');
                    }
                },
                { type: 'separator' },
                { role: 'about' }
            ]
        }
    ];
}

// Open file system dialog and read file contents into model
function openModel () {
    if (model.isOpen === true) {
        logger.log.debug('Checking that the existing model is not modified');
        logger.log.warn('TODO check from renderer that existing open file is not modified');
    }
    dialog.showOpenDialog({
        title: messages[language].desktop.file.open,
        properties: ['openFile'],
        filters: [
            { name: 'Threat Model', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    }).then(result => {
        if (result.canceled === false) {
            model.filePath = result.filePaths[0];
            logger.log.debug(messages[language].desktop.file.open + ': ' + model.filePath);
            fs.readFile(model.filePath, (err, data) => {
                if (!err) {
                    let modelData = JSON.parse(data);
                    mainWindow.webContents.send('open-model', path.basename(model.filePath), modelData);
                    model.isOpen = true;
                    model.fileDirectory = path.dirname(model.filePath);
                    app.addRecentDocument(model.filePath);
                } else {
                    logger.log.warn(messages[language].threatmodel.errors.open + ': ' + err);
                    model.isOpen = false;
                }
            });
        } else {
            logger.log.debug(messages[language].desktop.file.open + ' : canceled');
        }
    }).catch(err => {
        logger.log.warn(messages[language].threatmodel.errors.open + ': ' + err);
        model.isOpen = false;
    });
}

// prompt the renderer for the model data
function saveModel () {
    logger.log.debug(messages[language].desktop.file.save + ': ' + 'prompt renderer for model data');
    mainWindow.webContents.send('save-model', path.basename(model.filePath));
}

function saveModelAs () {
    logger.log.debug(messages[language].desktop.file.saveAs + ': ' + 'clear location, prompt renderer for model data');
    model.filePath = '';
    mainWindow.webContents.send('save-model', path.basename(model.filePath));
}

// Open saveAs file system dialog and write contents to new file location
function saveModelDataAs (modelData, fileName) {
    let newName = 'new-model.json';
    if (fileName) {
        newName = fileName;
    }
    var dialogOptions = {
        title: messages[language].desktop.file.saveAs,
        defaultPath: path.join(model.fileDirectory, newName),
        filters: [{ name: 'Threat Model', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }]
    };

    dialog.showSaveDialog(dialogOptions).then(result => {
        if (result.canceled === false) {
            model.filePath = result.filePath;
            model.isOpen = true;
            model.fileDirectory = path.dirname(model.filePath);
            logger.log.debug(messages[language].desktop.file.saveAs + ': ' + model.filePath);
            app.addRecentDocument(model.filePath);
            saveModelData(modelData);
        } else {
            logger.log.debug(messages[language].desktop.file.saveAs + ' : canceled');
        }
    }).catch(err => {
        logger.log.error(messages[language].desktop.file.saveAs + ': ' + messages[language].threatmodel.errors.save + ': ' + err);
        model.isOpen = false;
    });
}

// open a new model
function newModel () {
    let newName = 'new-model.json';
    logger.log.debug(messages[language].desktop.file.new + ': ' + newName);
    // prompt the renderer to open a new model
    mainWindow.webContents.send('new-model', newName);
    modelOpened();
}

// print the model report
function printModel () {
    logger.log.debug(messages[language].forms.savePdf+ ': ' + model.filePath);
    // prompt the renderer to open the print/report window
    mainWindow.webContents.send('print-model');
}

// close the model
function closeModel () {
    logger.log.debug(messages[language].desktop.file.close + ': ' + model.filePath);
    // prompt the renderer to close the model
    mainWindow.webContents.send('close-model', path.basename(model.filePath));
    modelClosed();
}

// read threat model from file, eg after open-file app module event
export function readModelData (filePath) {
    model.filePath = filePath;
    logger.log.debug(messages[language].desktop.file.open + ': ' + model.filePath);

    fs.readFile(model.filePath, (err, data) => {
        if (!err) {
            let modelData = JSON.parse(data);
            mainWindow.webContents.send('open-model', path.basename(model.filePath), modelData);
            model.fileDirectory = path.dirname(filePath);
            model.isOpen = true;
        } else {
            logger.log.warn(messages[language].threatmodel.errors.open + ': ' + err);
            model.isOpen = false;
        }
    });
}

// save the threat model
function saveModelData (modelData) {
    if (model.isOpen === true) {
        fs.writeFile(model.filePath, JSON.stringify(modelData, undefined, 2), (err) => {
            if (err) {
                logger.log.error(messages[language].threatmodel.errors.save + ': ' + err);
            } else {
                logger.log.debug(messages[language].threatmodel.saved + ': ' + model.filePath);
            }
        });
    } else {
        // quietly ignore
        logger.log.debug(messages[language].desktop.file.save + ': ignored empty file');
    }
}

// the renderer has requested to save the model with a filename
export const modelSaved = (modelData, fileName) => {
    // if the filePath is empty then this is the first time a save has been requested
    if (!model.filePath || model.filePath === '') {
        saveModelDataAs(modelData, fileName);
    } else {
        saveModelData(modelData);
    }
};

// clear out the model, either by menu or by renderer request
export const modelClosed = () => {
    model.filePath = '';
    model.isOpen = false;
};

// Open saveAs file system dialog and write contents as HTML
function saveHTMLReport (htmlPath) {
    htmlPath += '.html';
    var dialogOptions = {
        title: messages[language].forms.saveAS,
        defaultPath: htmlPath,
        filters: [{ name: 'HTML export', extensions: ['html'] }, { name: 'All Files', extensions: ['*'] }]
    };

    dialog.showSaveDialog(dialogOptions).then(result => {
        if (result.canceled === false) {
            htmlPath = result.filePath;
            mainWindow.webContents.savePage(htmlPath, 'HTMLComplete').then(() => {
                logger.log.debug(messages[language].forms.saveAs + ' : ' + htmlPath);
            }).catch(error => {
                logger.log.error(`Failed to write HTML to ${htmlPath}: `, error);
            });
        } else {
            logger.log.debug(messages[language].forms.saveAs + ' : canceled');
        }
    }).catch(err => {
        logger.log.error(err);
    });
}

// Open saveAs file system dialog and write PDF report
function savePDFReport (pdfPath) {
    pdfPath += '.pdf';
    var dialogOptions = {
        title: messages[language].forms.savePdf,
        defaultPath: pdfPath,
        filters: [{ name: 'PDF report', extensions: ['.pdf'] }, { name: 'All Files', extensions: ['*'] }]
    };

    dialog.showSaveDialog(dialogOptions).then(result => {
        if (result.canceled === false) {
            pdfPath = result.filePath;
            mainWindow.webContents.printToPDF({
                landscape: false,
                displayHeaderFooter: false,
                printBackground: false,
                pageSize: 'A4',
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                preferCSSPageSize: true
            }).then(data => {
                fs.writeFile(pdfPath, data, (error) => {
                    if (error) throw error;
                    logger.log.debug(`Wrote PDF successfully to ` + pdfPath);
                });
            }).catch(error => {
                logger.log.error(`Failed to write PDF to ${pdfPath}: `, error);
            });

            logger.log.debug(messages[language].forms.savePdf + ' : ' + pdfPath);
        } else {
            logger.log.debug(messages[language].forms.savePdf + ' : canceled');
        }
    }).catch(err => {
        logger.log.error(err);
    });
}

// the renderer has requested a report to be printed
export const modelPrint = (printer) => {
    let reportPath = path.join(path.dirname(model.filePath), path.basename(model.filePath, '.json'));
    if (!model.filePath || model.filePath === '') {
        reportPath = path.join(__dirname, '/new_model');
    }

    if (printer === 'PDF') {
        savePDFReport(reportPath);
    } else if (printer === 'HTML') {
        saveHTMLReport(reportPath);
    } else {
        logger.log.warn('Print output type not recognised');
    }
};

// the renderer has opened a new model
export const modelOpened = () => {
    // for security reasons the renderer can not provide the full path
    // so wait for a save before filling in the file path
    model.filePath = '';
    model.isOpen = true;
};

export const setLocale = (locale) => {
    language = languages.includes(locale) ? locale : defaultLanguage;
};

export const setMainWindow = (window) => {
    mainWindow = window;
};

export default {
    getMenuTemplate,
    modelClosed,
    modelOpened,
    modelPrint,
    modelSaved,
    readModelData,
    setLocale,
    setMainWindow
};
