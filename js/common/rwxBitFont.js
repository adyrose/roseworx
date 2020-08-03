import {rwxError} from '../rwxCore';

const rwxBitFontOrientationDefault = 'horizontal';
const rwxBitFontOrientations = ['horizontal', 'vertical', 'slanted', 'wrap'];

const rwxBitFontGetMatrix = (letters, orientation, width, height)=>{
	if(!rwxBitFontOrientations.includes(orientation)){rwxError(`${orientation} is not a valid orientation. Valid orientations include ['${rwxBitFontOrientations.join("', '")}']. Using '${rwxBitFontOrientationDefault}'.`, 'rwxBitFont'); orientation = rwxBitFontOrientationDefault;}
	letters = split(letters, orientation);
	if(!letters)return;
	let dimensions = [];
	let size = calculateSize(width);
	let counter = 0;
	let toReturn = [];
	if(orientation == "wrap" && letters.includes(' '))
	{
		let words = letters.join('').split(' ');
		dimensions = words.map((w,i)=>calculateDimensions(w.length, i, words.length, orientation, width, height, size));
	}
	else
	{
		dimensions.push(calculateDimensions(letters.length, 0, 0, orientation, width, height, size));
	}

	let bitx = dimensions[counter].x;
	let bity = dimensions[counter].y;	

	letters.map((l, i)=>{

		if(l==" "){
			counter+=1; 
			bitx=dimensions[counter].x; 
			bity=dimensions[counter].y; 
			return;
		}
		else {
			let matrix = [];
			rwxBitFontMatrix[l].map((p)=>{
				matrix.push({x: bitx + (p.x * size.particleGap), y: bity + (p.y * size.particleGap)});
			});
			toReturn.push({bitx, bity, matrix, dimensions:size});
		}

		bitx += dimensions[counter].bitXPlus;
		bity += dimensions[counter].bitYPlus;
		return;
	});
	return toReturn;
}

const split = (bits, orientation) =>
{
	const letters = [...bits.toUpperCase()];
	const allowed = Object.keys(rwxBitFontMatrix);
	if(orientation == 'wrap'){allowed.push(' ')}
	const notAllowed = letters.filter((l)=>!allowed.includes(l));
	if(notAllowed.length > 0){rwxError(`[${notAllowed}] ${notAllowed.length > 1 ? 'are not supported bits' : 'is not a supported bit'}. Supported bits are [${Object.keys(rwxBitFontMatrix)}]. CASE INSENSITIVE. Note - ' ' spaces are only allowed if the 'wrap' orientation is specified.`, 'rwxBitFont'); return false;}
	return letters;
}

const calculateDimensions = (bitlength, index=0, length=0, orientation, width, height, size)=>
{
	let x, y, bitYPlus, bitXPlus;
	if(orientation == "slanted")
	{
		bitXPlus = (size.bitSize + size.bitSpacing);
		bitYPlus = size.bitSpacing+20;
		y = (height/2) - ((size.bitSpacing+20)*bitlength)/2;
		x = (width/2) - (((bitlength*size.bitSize) + ((bitlength-1)*size.bitSpacing))/2);
	}
	else if(orientation == "wrap")
	{
		bitXPlus = (size.bitSize + size.bitSpacing);
		bitYPlus = 0;
		y = (height/2) - (((length*size.bitSize) + ((length-1)*size.bitSpacing))/2) + (index * (size.bitSize + size.bitSpacing));
		x = (width/2) - (((bitlength*size.bitSize) + ((bitlength-1)*size.bitSpacing))/2);
	}
	else if (orientation == "vertical")
	{
		bitXPlus = 0;
		bitYPlus = (size.bitSize + size.bitSpacing);
		x = (width/2) - (size.bitSize/2);
		y = (height/2) - (((bitlength*size.bitSize) + ((bitlength-1)*size.bitSpacing))/2);
	}
	else if(orientation == "horizontal")
	{
		bitXPlus = (size.bitSize + size.bitSpacing);
		bitYPlus = 0;
		y = (height/2) - (size.bitSize/2);
		x = (width/2) - (((bitlength*size.bitSize) + ((bitlength-1)*size.bitSpacing))/2);
	}

	return {x, y, bitXPlus, bitYPlus};
}

const calculateSize = (w) =>
{
	if(w <= 500)
	{
		return rwxBitFontSizing.sm;
	}
	else if(w > 500 && w <= 750)
	{
		return rwxBitFontSizing.md;
	}
	else if(w > 750 && w <= 1000)
	{
		return rwxBitFontSizing.lg;
	}
	else if(w > 1000)
	{
		return rwxBitFontSizing.xl;
	}
}

const rwxBitFontSizing = {
	'sm': {
		particleSize: 2,
		particleGap: 5,
		bitSize: 20,
		bitSpacing: 10
	},
	'md': {
		particleSize: 4,
		particleGap: 10,
		bitSize: 40,
		bitSpacing: 25
	},
	'lg': {
		particleSize: 6,
		particleGap: 15,
		bitSize: 60,
		bitSpacing: 40
	},
	'xl': {
		particleSize: 8,
		particleGap: 20,
		bitSize: 80,
		bitSpacing: 55
	}
};

const rwxBitFontMatrix = {
	"R": [
		{x:0, y:0},
		{x:1, y:0},
		{x:2, y:0},
		{x:3, y:0},
		{x:4, y:0},
		{x:4, y:1},
		{x:4, y:2},
		{x:3, y:2},
		{x:2, y:2},
		{x:1, y:2},
		{x:0, y:1},
		{x:0, y:2},
		{x:0, y:3},
		{x:0, y:4},
		{x:3, y:3},
		{x:4, y:4},
	],
	"O": [
		{x:0, y:0},
		{x:1, y:0},
		{x:2, y:0},
		{x:3, y:0},
		{x:4, y:0},
		{x:4, y:1},
		{x:4, y:2},
		{x:4, y:3},
		{x:4, y:4},
		{x:3, y:4},
		{x:2, y:4},
		{x:1, y:4},
		{x:0, y:4},
		{x:0, y:3},
		{x:0, y:2},
		{x:0, y:1},
	],
	"S": [
		{x:4, y:0},
		{x:3, y:0},
		{x:2, y:0},
		{x:1, y:0},
		{x:0, y:0},
		{x:0, y:1},
		{x:0, y:2},
		{x:1, y:2},
		{x:2, y:2},
		{x:3, y:2},
		{x:4, y:2},
		{x:4, y:3},
		{x:4, y:4},
		{x:3, y:4},
		{x:2, y:4},
		{x:1, y:4},
		{x:0, y:4}
	],
	"E": [
		{x:0, y:0},
		{x:0, y:1},
		{x:0, y:2},
		{x:0, y:3},
		{x:0, y:4},
		{x:1, y:0},
		{x:2, y:0},
		{x:3, y:0},
		{x:4, y:0},
		{x:1, y:2},
		{x:2, y:2},
		{x:3, y:2},
		{x:4, y:2},
		{x:1, y:4},
		{x:2, y:4},
		{x:3, y:4},
		{x:4, y:4},
	],
	"W": [
		{x:0, y:0},
		{x:0.25, y:1},
		{x:0.5, y:2},
		{x:0.75, y:3},
		{x:1, y:4},
		{x:1.25, y:3},
		{x:1.5, y:2},
		{x:1.75, y:1},
		{x:2, y:0},
		{x:2.25, y:1},
		{x:2.5, y:2},
		{x:2.75, y:3},
		{x:3, y:4},
		{x:3.25, y:3},
		{x:3.5, y:2},
		{x:3.75, y:1},
		{x:4, y:0}
	],
	"X": [
		{x:0, y:0},
		{x:0.66, y:0.66},
		{x:1.32, y:1.32},
		{x:2, y:2},
		{x:2.66, y:2.66},
		{x:3.32, y:3.32},
		{x:4, y:4},
		{x:4, y:0},
		{x:3.32, y:0.66},
		{x:2.66, y:1.32},
		{x:1.32, y:2.66},
		{x:0.66, y:3.32},
		{x:0, y:4},
	]
}

export default rwxBitFontGetMatrix;