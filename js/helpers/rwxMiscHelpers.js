const rwxMiscHelpers = 
{
	uniqueId: ()=>{return "_"+Math.random().toString(36).substr(2,9)} // returns a unique and random 8 character string prefixed with an underscore.
}

export default rwxMiscHelpers;