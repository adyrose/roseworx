const fs = require('fs');
const jsdom = require('jsdom');
const fname = "dart.svg";

const parseSVG = (fname) => {
	fs.readFile(`./icons/src/${fname}`, "utf8", (err, file)=>{
		let dom = new jsdom.JSDOM(file);
		dom.window.document.querySelector('svg').removeAttribute('xmlns:bx');
		let els = [...dom.window.document.querySelectorAll('svg *')];
		let parsed = ``;
		for(let el of els)
		{
			el.removeAttribute('style');
			el.removeAttribute('bx:shape');
			parsed += el.outerHTML;
		}
		
		const root = dom.window.document.querySelector('svg').parentNode.innerHTML;

		fs.writeFile(`./icons/parsed/${fname}`, parsed, function (err) {
		  if (err) return console.log(err);
		});

		fs.writeFile(`./icons/${fname}`, root, function (err) {
		  if (err) return console.log(err);
		});
	});
}


fs.readdir('./icons/src', (err, files) => {
	if (err) return console.log(err);
  files.forEach(file => {
    parseSVG(file);
  });
});
