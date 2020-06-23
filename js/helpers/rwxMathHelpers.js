const rwxMath = 
{
	toRadians: (degree) => {return (degree * Math.PI / 180);},
	randomInt: (min, max) => {return Math.floor(Math.random() * (max-min+1) + min);}
}

export default rwxMath;