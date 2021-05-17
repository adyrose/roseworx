import rwxForms from './core/rwxForms';
import rwxTables from './core/rwxTables';
import rwxTabs from './core/rwxTabs';
import rwxMist from './effects/rwxMists';
import rwxSliders from './core/rwxSliders';

let globalObject = {forms:rwxForms, sliders:rwxSliders, tabs:rwxTabs, mists: rwxMist, tables: rwxTables};
if(window.rwx){globalObject = Object.assign(globalObject, window.rwx)};
window.rwx = globalObject;
export default globalObject;