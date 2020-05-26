const rwxPreload = ()=>{window.addEventListener('load', ()=>{document.body.classList.contains('preload') && document.body.classList.remove('preload');});}
export default rwxPreload;