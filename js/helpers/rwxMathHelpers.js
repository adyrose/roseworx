const rwxMathHelpers = 
{
	toRadians: ()=>{return (degree * Math.PI / 180);},
	randomInt: ()=>{return Math.floor(Math.random() * (max-min+1) + min);}
}