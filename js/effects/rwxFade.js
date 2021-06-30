require('../../scss/effects/rwxFade.scss');

const rwxFade = {
	fadeIn: (el) => {
    el.classList.contains('rwx-fade-out') && el.classList.remove('rwx-fade-out');
    el.classList.add('rwx-fade-in');
	},

	fadeOut: (el) => {
 		el.classList.add('rwx-fade-out');
	},

	cleanUp: (el) => {
		el.classList.remove('rwx-fade-in', 'rwx-fade-out');
	}
}

export default rwxFade;