require('../../scss/effects/rwx-fade.scss');

const rwxFade = {
	fadeIn: (el) => {
    el.classList.contains('rwx-fade-out') && el.classList.remove('rwx-fade-out');
    el.classList.add('rwx-fade-in');
	},

	fadeOut: (el) => {
 		el.classList.add('rwx-fade-out');
	}
}

export default rwxFade;