import { rwxCore } from '../rwxCore';
import rwxMist from '../common/rwxMist';

class rwxMists extends rwxCore {
	constructor()
	{
		super('[rwx-mist]');
	}
	execute(el)
	{
		return new rwxMist(el);
	}
}

export default new rwxMists();