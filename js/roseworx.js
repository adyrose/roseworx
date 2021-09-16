import rwxGlobals from './rwxGlobals';
import rwxForms from './core/rwxForms';
import rwxTables from './core/rwxTables';
import rwxTabs from './core/rwxTabs';
import rwxMist from './effects/rwxMists';
import rwxSliders from './core/rwxSliders';

let rwx = {globals: rwxGlobals, forms:rwxForms, sliders:rwxSliders, tabs:rwxTabs, mists: rwxMist, tables: rwxTables};
if(window.rwx){rwx = Object.assign(rwx, window.rwx)};
window.rwx = rwx;
export default rwx;