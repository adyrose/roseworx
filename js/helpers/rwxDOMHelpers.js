const rwxDOM = {
	hasAncestor: (el, selector) => {
		const element = el.parentNode;
		console.log(typeof selector);
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