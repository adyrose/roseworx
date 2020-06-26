import Roseworx from '../rwxCore';
import rwxMist from '../common/rwxMist';

class rwxMists extends Roseworx.Core{
	constructor()
	{
		super();
	}
	execute()
	{
		const mists = [...document.querySelectorAll('[rwx-mist]')];
		mists.map((m)=>{
			new rwxMist(m);
			return;
		});
	}
}

export default new rwxMists();