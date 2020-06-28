const rwxMisc = 
{
	uniqueId: ()=>{return "_"+Math.random().toString(36).substr(2,12)},

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
}

export default rwxMisc;