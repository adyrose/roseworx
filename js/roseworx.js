import rwxForms from './components/rwxForms';
import rwxTables from './components/rwxTables';
import rwxTabs from './components/rwxTabs';
import rwxSliders from './components/rwxSliders'

const globalObject = {forms:rwxForms, sliders:rwxSliders, tabs:rwxTabs}
window.rwx = globalObject;
export default globalObject;