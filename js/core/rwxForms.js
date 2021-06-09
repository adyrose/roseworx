import { rwxCore, rwxComponent } from '../rwxCore';

class rwxForms extends rwxCore {
	constructor()
	{
		super('[rwx-form]');
	}

	execute(el)
	{
		return new rwxForm(el);
	}

	customSubmitFn(id, submitFunction)
	{
		if(!this.validateParameter(submitFunction, 'function', 'customSubmitFn'))return;
		const IME = this.getIME(id);
		if(IME)IME.customSubmit = submitFunction;
	}
}

class rwxForm extends rwxComponent {
	constructor(el)
	{
		super({element: el})
		this.submitButton = this.el.querySelector("button[type='submit']");

		this.validEls = {};

		this.events = []

		this.getInputs().map((el)=>{
			this.determineValid(el);
			this.touched(el);

			const blurev = (e) =>{
				el.type == "checkbox" ? this.addValidClass(this.validCheckbox(el, e.target.checked), el) : this.addValidClass(this.validInput(el, e.target.value), el);
			}

			el.addEventListener('blur', blurev);

			const validEvent = (el.type=="checkbox" || el.tagName=="SELECT" || el.type=="radio") ? 'change' : 'keyup';

			const validEventEvent = (e) => {
				this.determineValid(el);
				if(this.submitButton)this.submitButton.disabled = !this.isFormValid();			
			}

			el.addEventListener(validEvent, validEventEvent);
			this.events.push([{
					type: 'blur',
					ev: blurev
				},
				{
					type: validEvent,
					ev: validEventEvent
				}
			])
			return;
		});

		if(this.submitButton)this.submitButton.disabled = !this.isFormValid();

		this.submitFn = (ev) => {
			if(!this.isFormValid())
			{
				ev.preventDefault();
				return;
			}
			if(this.customSubmit){
				ev.preventDefault();
				const finalObject = {};
				this.getInputs().map((i)=>{
					let name = i.getAttribute('name');
					if(name){
						finalObject[name] = i.type=="checkbox" ? i.checked : i.value;
					}
					return;
				})
				this.customSubmit(finalObject);
			}
		}
		this.submitFn = this.submitFn.bind(this);
		this.el.addEventListener('submit', this.submitFn)
	}

	cleanUp()
	{
		this.el.removeEventListener('submit', this.submitFn);
		this.getInputs().map((inp, i)=>{
			this.events[i].map((e)=>inp.removeEventListener(e.type, e.ev));
			inp.parentNode.classList.remove('valid');
			inp.parentNode.classList.remove('invalid');
			inp.parentNode.classList.remove('touched');
			this.submitButton.disabled = false;
			return false;
		})
	}

	getInputs()
	{
		return [...this.el.querySelectorAll("input"), ...this.el.querySelectorAll('textarea'), ...this.el.querySelectorAll('select')];
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

export default new rwxForms();