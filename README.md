For detailed information please visit the website - <a target="_blank" href="https://roseworx.adyrose.co.uk">roseworx.adyrose.co.uk</a>


The Roseworx framework is dynamic and is created to work as a standalone scss framework. Or you can include the core Javascript files to enhance Roseworx capabilities.


To keep Roseworx as customisable as possible, the core files are provided in SCSS and JS ES6+ format and as such will need compiling by appropriate loaders and build processes.


`npm install roseworx`



Simply add the following SCSS import to your main SCSS file. To override customisable SCSS variables from the framework, declare your own variables **before** this import. For a list of SCSS variables to overide visit <a target="_blank" href="https://roseworx.adyrose.co.uk/utilities#scss-variables">Utilities</a>.


`@import "~roseworx/scss/roseworx";`



To include the core javascript files of the framework use the following Javascript in your main JS file. This is optional, you can use the framework as style only without functionality.


`import rwx from 'roseworx';`





A Core js file is an **enhancement** on something which works as standard with css only.
A Component js file needs an element physically in the dom which **requires** javascript in order to function.
A Module js file is Javascript which does something "in the background" and doesnt specifically require a physical element in the dom.
Core js is automatically included and ran on the initial import of roseworx, Components and Modules need importing specifically.