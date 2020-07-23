import { rwxCore } from '../rwxCore';
import rwxAnimatedBorder from '../common/rwxAnimatedBorder';

class rwxAnimatedBorders extends rwxCore {
	constructor()
	{
		super('[rwx-animated-border]');
	}
	execute(el)
	{
		return new rwxAnimatedBorder(el);
	}
}

export default new rwxAnimatedBorders();