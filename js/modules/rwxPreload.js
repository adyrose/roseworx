require('../../scss/modules/rwx-preload.scss');

import { rwxCore } from '../rwxCore';

class rwxPreload extends rwxCore{
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