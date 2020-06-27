const rwxMath = 
{
	randomInt: (min, max) => {return Math.floor(Math.random() * (max-min+1) + min);},
  randomFloat: (min, max) => {return Math.random() * (max-min) + min;},
}

export default rwxMath;