const rwxMath = 
{
	toRadians: (degree) => {return (degree * Math.PI / 180);},
	randomInt: (min, max) => {return Math.floor(Math.random() * (max-min+1) + min);},
  randomFloat: (min, max) => {return Math.random() * (max-min) + min;},
}

export default rwxMath;