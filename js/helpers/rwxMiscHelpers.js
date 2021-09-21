const rwxMisc = 
{
  uniqueIdList: [],

	uniqueId: ()=>{
    const id = "_"+Math.random().toString(36).substr(2,12);
    if(rwxMisc.uniqueIdList.includes(id))
    {
      return rwxMisc.uniqueId();
    }
    rwxMisc.uniqueIdList.push(id);
    return id;
  },

  setCookie: (c_name, value, exdays) => {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
  },

  getCookie: (c_name) => {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }    
  },

  safeCloneArrayOfObjects: (array) => {
    let cloneArray = [...array];
    cloneArray.map((a,i)=>{cloneArray[i] = rwxMisc.safeCloneObject(cloneArray[i]) });
    return cloneArray;
  },
  
  safeCloneObject: (obj) => {
    return Object.assign({}, obj);
  },

  safeCloneArray: (arr) => {
    return [...arr];
  },

  shuffleArray:(a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
  },

  randomValueFromArray: (arr) => {
    return arr[Math.floor(Math.random() * ((arr.length-1)-0+1) + 0)];
  },

  isHexValue: (v) => {
    const re = /^#(?:[0-9a-f]{3}){1,2}$/i;
    return re.test(v);
  },

  convertHexToRGB: (v) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(v);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  isKeyboardClick: (e) => {
    return (e.keyCode == 13 || e.keyCode == 32);
  },

  // converts an element thats not a button to be accessible and act like a button
  convertToButton: (el, event) => {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', 0);
    if(event)
    {
      el.addEventListener('keydown', (ev)=>{
        if(rwxMisc.isKeyboardClick(ev))
        {
          ev.preventDefault();
          event(ev);
        }
      });
    }
  }
}

export default rwxMisc;