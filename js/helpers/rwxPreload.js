export default class rwxPreload {
	constructor()
	{
		window.addEventListener('load', ()=>{
			setTimeout(()=>{
				document.body.classList.contains('preload') && document.body.classList.remove('preload');
			}, 300);
		});
	}
}