class Core {
	constructor()
	{
		this.internalMap = {};
		this.resourceName = this.constructor.name;		
		if(!this.execute){console.warn(`[rwx] ${this.resourceName} - No execute method.`); return;}
		this.execute = this.execute.bind(this);
		window.addEventListener('load', this.execute);
	}

	addIME(id, obj)
	{
		this.internalMap[id] = obj;
	}

	getIME(id)
	{
		if(this.internalMap && this.internalMap[id])
		{
			return this.internalMap[id];
		}
		else
		{
			if(Object.keys(this.internalMap).length > 0)
			{
				console.warn(`[rwx] ${this.resourceName} - No element found with id - ${id} \n[rwx] Possible ID's on this page are - ${Object.keys(this.internalMap).join(', ')}`);
			}
		}		
	}

}

export default {Core};