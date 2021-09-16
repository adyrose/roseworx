import { checkAttributeForBool } from './rwxCore';

class rwxGlobals {
  constructor() {
    this.dismissableCards();
  }

  undismissableCards()
  {
    if(!this.dsm)return;
    this.dsm.map((dc, i)=>{
      dc.removeChild(this.dcmbs[i]);
      dc.classList.remove('dismissable', 'dismiss');
      return false;
    });
  }

  dismissableCards()
  {
    this.dsm = [...document.querySelectorAll('p[data-rwx-dismissable]')].filter((el)=>checkAttributeForBool(el, 'data-rwx-dismissable'));
    this.dcmbs = [];
    this.dsm.map((d)=>{
      if(d.querySelector('.dismissable-button'))return false;
      const b = document.createElement('button');
      const i = document.createElement('i');
      b.classList.add('no-decoration');
      b.classList.add('dismissable-button');
      i.classList.add('card-close');
      d.classList.add('dismissable');
      b.appendChild(i);
      d.appendChild(b);
      b.addEventListener('click', ()=>{
        d.classList.add('dismiss');
      });
      this.dcmbs.push(b);
      return false;
    });
  }
}

export default new rwxGlobals();