import rwxMisc from './helpers/rwxMiscHelpers';
class Core {
	constructor()
	{
		this.internalMap = {};
		this.resourceName = this.constructor.name;		
		if(!this.execute){console.warn(`[rwx] ${this.resourceName} - No execute method.`); return;}
		this.execute = this.execute.bind(this);
		window.addEventListener('load', this.execute);
	}

	getIMES()
	{
		return this.internalMap;
	}

	addIME(id, obj)
	{
		let toUse = id;
		if(!toUse)
		{
			toUse = rwxMisc.uniqueId();
		}
		this.internalMap[toUse] = obj;
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
			return false;
		}		
	}

	addEvent(elid, id, type, event)
	{
		if(!id || !event || !this.customEvents){return;}
		const IME = this.getIME(elid);
		IME && IME.addEvent(id, event, type);		
	}
}

class Component {
	constructor()
	{
		this.resourceName = this.constructor.name;
		this.availableEvents = [];
	}

	declareEvent(name)
	{
		this[name] = [];
		this.availableEvents.push(name);
	}

	addEvent(id, event, type)
	{
		if(!this.availableEvents.includes(type)) {
			console.warn(`[rwx] ${this.resourceName} - No Custom event found with name - ${type}`);
			return;
		}
		this[type].push({id, event});
	}

	executeEvent(type, id)
	{
		if(this[type].length == 0)return;
		const changeEvents = this[type].filter((tce)=>tce.id == id);
		if(changeEvents.length == 0)return;
		changeEvents.map((ce)=>ce.event());
	}
}

export default {Core, Component};