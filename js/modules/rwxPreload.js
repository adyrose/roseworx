require('../../scss/modules/rwx-preload.scss');

import Roseworx from '../rwxCore';

class rwxPreload extends Roseworx.Core{
	constructor()
	{
		super();
	}

	execute()
	{
		setTimeout(()=>{
			document.body.classList.contains('rwx-preload') && document.body.classList.remove('rwx-preload');
		}, 300);
	}
}

export default new rwxPreload();