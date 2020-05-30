

class rwxForms {
	constructor()
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
		if(this.internalMap[id])
		{
			this.internalMap[id].customSubmit = submitFunction
		}
	}
}

class rwxForm {
	constructor(formEl)
	{
		//input select textarea
		const inputs = [...formEl.querySelectorAll("input"), ...formEl.querySelectorAll('textarea'), ...formEl.querySelectorAll('select')];
		this.submitButton = formEl.querySelector("input[type='submit']");

		//do final check on submit all fields are valid to stop front end changing the disabled property in inspector

		this.validEls = {};

		[...inputs].map((el)=>{
			const isValid = el.type == "checkbox" ? this.validCheckbox(el, el.checked) : this.validInput(el, el.value);
			this.validEls[this.getUniqueAttribute(el)] = isValid;

			this.touched(el);

			el.addEventListener('blur', (e)=>{
				el.type == "checkbox" ? this.addValidClass(this.validCheckbox(el, e.target.checked), el) : this.addValidClass(this.validInput(el, e.target.value), el);
			});

			const validEvent = el.type=="checkbox" || el.tagName=="SELECT" ? 'change' : 'keyup';
			el.addEventListener(validEvent, (e)=>{
				const isValid = el.type == "checkbox" ? this.validCheckbox(el, el.checked) : this.validInput(el, el.value);
				this.validEls[this.getUniqueAttribute(el)] = isValid;
				this.isFormValid();
			})
		});

		formEl.addEventListener('submit', (ev)=>{
			if(this.customSubmit){
				ev.preventDefault();
				this.customSubmit({value1:"hi"});
			}
		})
	}

	isFormValid()
	{
		console.log(Object.entries(this.validEls).every((ve)=>ve[1]===true));
	}

	getUniqueAttribute(el)
	{
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