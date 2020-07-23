import rwxForms from './core/rwxForms';
import rwxTables from './core/rwxTables';
import rwxTabs from './core/rwxTabs';
import rwxMist from './effects/rwxMists';
import rwxSliders from './core/rwxSliders';

const globalObject = {forms:rwxForms, sliders:rwxSliders, tabs:rwxTabs}
window.rwx = globalObject;
export default globalObject;