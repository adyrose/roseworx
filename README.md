For detailed information please visit the website - <a target="_blank" href="https://roseworx.adyrose.co.uk">roseworx.adyrose.co.uk</a>


The Roseworx framework is dynamic and is created to work as a standalone scss framework. Or you can include the core Javascript files to enhance Roseworx capabilities.


To keep Roseworx as customisable as possible, the core files are provided in SCSS and JS ES6+ format and as such will need compiling by appropriate loaders and build processes.


`npm install roseworx`



Simply add the following SCSS import to your main SCSS file. To override customisable SCSS variables from the framework, declare your own variables **before** this import. For a list of SCSS variables to overide visit <a target="_blank" href="https://roseworx.adyrose.co.uk/toolbox">Utilities</a>.


`@import "~roseworx/scss/roseworx";`



To include the core javascript files of the framework use the following Javascript in your main JS file. This is optional, you can use the framework as style only without functionality.


`import rwx from 'roseworx';`


Please report all issues and bugs to <a href="https://github.com/adyrose/roseworx/issues">https://github.com/adyrose/roseworx/issues</a>