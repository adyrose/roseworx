class rwxForms {
	constructor()
	{
		window.addEventListener('load', this.init);
	}

	init()
	{
		const forms = [...document.querySelectorAll('[rwx-form]')];
		if(forms.length === 0){return;}
		this.internalMap = {}
		forms.map((f)=> {
			const id = f.getAttribute('id');
			const form = new rwxForm(f); 
			if(id){this.internalMap[id] = form}
		 	return;
		});
	}

	customSubmitFn(id, submitFunction)
	{
		if(this.internalMap && this.internalMap[id])
		{
			this.internalMap[id].customSubmit = submitFunction;
		}
	}
}

class rwxForm {
	constructor(formEl)
	{
		const inputs = [...formEl.querySelectorAll("input"), ...formEl.querySelectorAll('textarea'), ...formEl.querySelectorAll('select')];
		const submitButton = formEl.querySelector("button[type='submit']");

		this.validEls = {};

		[...inputs].map((el)=>{
			this.determineValid(el);
			this.touched(el);

			el.addEventListener('blur', (e)=>{
				el.type == "checkbox" ? this.addValidClass(this.validCheckbox(el, e.target.checked), el) : this.addValidClass(this.validInput(el, e.target.value), el);
			});

			const validEvent = (el.type=="checkbox" || el.tagName=="SELECT" || el.type=="radio") ? 'change' : 'keyup';
			el.addEventListener(validEvent, (e)=>{
				this.determineValid(el);
				if(submitButton)submitButton.disabled = !this.isFormValid();
			});
			return;
		});

		if(submitButton)submitButton.disabled = !this.isFormValid();

		formEl.addEventListener('submit', (ev)=>{
			if(!this.isFormValid())
			{
				ev.preventDefault();
				return;
			}
			if(this.customSubmit){
				ev.preventDefault();
				const finalObject = {};
				inputs.map((i)=>{
					let name = i.getAttribute('name');
					if(name){
						finalObject[name] = i.type=="checkbox" ? i.checked : i.value;
					}
					return;
				})
				this.customSubmit(finalObject);
			}
		})
	}

	determineValid(el)
	{
		let isValid;
		if(el.type == "checkbox"){isValid = this.validCheckbox(el, el.checked);}
		else if(el.type == "radio"){isValid = this.validRadio(el, el.checked);}
		else{isValid = this.validInput(el, el.value);}
		this.validEls[this.getUniqueAttribute(el)] = isValid;
	}

	isFormValid()
	{
		return (Object.entries(this.validEls).every((ve)=>ve[1]===true));
	}

	getUniqueAttribute(el)
	{
		if(el.type=="radio" && el.parentNode.parentNode.classList.contains('rwx-form-radio-group')) return el.parentNode.parentNode.id;
		return el.id || el.name;
	}

	touched(el)
	{
		el.addEventListener('focus', ()=>{
			el.parentNode.classList.add('touched');
		})
	}

	addValidClass(b, el)
	{
		if(this.isTouched(el))
		{
			b ? el.parentNode.classList.add('valid') : el.parentNode.classList.remove('valid');
			b ? el.parentNode.classList.remove('invalid') : el.parentNode.classList.add('invalid');
		}
	}

	isTouched(el)
	{
		return el.parentNode.classList.contains('touched');
	}

	isRequired(el)
	{
		return el.parentNode.classList.contains('required');
	}

	validRadio(el, value)
	{
		const required = this.isRequired(el);
		const required2 = el.parentNode.parentNode.classList.contains('required');
		return (required || required2) ? value==true : true;
	}

	validInput(el, value)
	{
		const required = this.isRequired(el);
		if(el.type === 'email')
		{
			return required ? this.validEmail(value) : true;
		}
		return required ? value.length > 0 : true;
	}

	validEmail(value)
	{
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value); 
	}

	validCheckbox(el, value)
	{
		return this.isRequired(el) ? value===true : true;
	}
}

export default rwxForms;