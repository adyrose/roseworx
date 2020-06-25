const rwxDOM = {
	hasAncestor(el, selector)
	{
		let element = el.parentNode;
		if(element.matches('body'))
		{
			return false;
		}
		else if(element.matches(selector)){
			return element;
		}
		return rwxDOM.hasAncestor(element, selector);
	}
}

export default rwxDOM;