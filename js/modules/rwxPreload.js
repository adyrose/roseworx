import Roseworx from '../rwxCore';

class rwxPreload extends Roseworx.Core{
	constructor()
	{
		super();
	}

	execute()
	{
		setTimeout(()=>{
			document.body.classList.contains('preload') && document.body.classList.remove('preload');
		}, 300);
	}
}

export default new rwxPreload();