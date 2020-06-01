roseworx.adyrose.co.uk
require('rose-utils'); for everything

npm package
scss split page grid
variables !default
named exports + whole frameowkr imports, just grid, just components (component SCSS files might have dependencies on core), sass only, etc
all components from innovation and strip out fruit machine to own repo and use as test case for this framework via npm and delete innovation repo
set up how to develop this with HMR and demoing each component
add particle countup and picture grid component
add everything from utilities repo and delete
zopaque levels and opaque in keyframes
flex slider?
react components ?
get the ID generation method into helpers also from mps-app

Bugs
JS include everything even for named export/import


Documentation
Import your own variables in SCSS before importing rose-utils to overide varibales
after md breakpoint everything is full width by default
add .preload class to the body and import {rwxPreload} from 'roseworx' and new rwxPreload() - this removes the problem of css animations runnning on page load
//import * as rwx from 'roseworx';
//new rwx.Test2();
//import Test2 from 'roseworx/js/components/Test2';
//new Test2();
mixin provided for changing link color @include change-link-color($white); - useful for having links in navigations which dont follow the general rule for <a> tags in normal content. For example .navigation ul li {@include change-link-color($white);} will change all <a> tags and the underline color to white in each .navigation ul li
a.no-decoration for normal type
a rwx-table-data can be an a tag with no-decoration class and highlightable to become a linkf
all JS modules need to be instantiated in docoument.load method

//RoseWorx SkrollX
Scroll animation library for parallax scrolling animations
import {SkrollX} from 'roseworx' new SkrollX(trigger) - trigger is the distance from the bottom of the screen which when scrolled - triggers the animation.
p.small
// give any element [rwx-skrlx] attribute and either .rwxsx-start-left, .rwxsx-start-right, .rwxsx-start-top, .rwxsx-start-bottom
// for a delay use data-rwxsx-delay="ms"
// calculations will be done on page load so if content is above the current scroll when the page loads, it will animate in


// Colors

'black':$black, 
'grey':$grey, 
'dark-grey':$dark-grey, 
'white':$white, 
'orange':$orange,
'red': $red,
'blue': $blue,
'light-blue': $light-blue,
'green': $green,
'light-green': $light-green,
'turquoise': $turquoise,
'yellow': $yellow,
'purple': $purple,
'pink': $pink,
'brown': $brown

// HELPER CLASSES

// RoseWorx Buttons
default button color and style is set with $button-primary-color $button-color-secondary variables but included in the framework are color modifers to easily switch a button style inline to a different named color. E.G <button class="--red"></button>. Give any element a class rwx-button + modifer to receive button styles e.g <a class="rwx-button"></a>

// RoseWorx Spacing (margin)
.rwxs-m-sm, .rwxs-m-md, .rwxs-m-lg, .rwxs-m-no, .rwxs-m-l-no, .rwxs-m-r-no, .rwxs-m-t-no, .rwxs-m-b-no .rwxs-m-l-sm, .rwxs-m-r-sm, .rwxs-m-t-sm, .rwxs-m-b-sm, .rwxs-m-l-md, .rwxs-m-r-md, .rwxs-m-t-md, .rwxs-m-b-md, .rwxs-m-l-lg, .rwxs-m-r-lg, .rwxs-m-t-lg, .rwxs-m-b-lg

// RoseWorx Spacing (padding)
.rwxs-p-sm, .rwxs-p-md, .rwxs-p-lg, .rwxs-p-no, .rwxs-p-l-no, .rwxs-p-r-no, .rwxs-p-t-no, .rwxs-p-b-no .rwxs-p-l-sm, .rwxs-p-r-sm, .rwxs-p-t-sm, .rwxs-p-b-sm, .rwxs-p-l-md, .rwxs-p-r-md, .rwxs-p-t-md, .rwxs-p-b-md, .rwxs-p-l-lg, .rwxs-p-r-lg, .rwxs-p-t-lg, .rwxs-p-b-lg

// RoseWorx Font
.rwxf-light, .rwxf-normal, .rwxf-bold, .rwxf-extra-bold, .rwxf-small

// RoseWorx Utilities
//.rwxu

// RoseWorx Forms ??
// importing the scss only gets forms styles, import rwxForms in JS, const forms = new rwxForms() and put [rsx-form] attribute on a html form for the js - it is possible to have a custom submit function for a form instead of doing a normal form submit. just save the rwxForms instantiator as a var XXX and call XXX.customSubmitFn with the ID of the form as the first parameter (form must have an ID attribute) and a function as the second attribute -> the customSubmitFn will get called with a parameter - an array of objects with each form fields value in the format [{fieldname: fieldvalue}]. a forms submit button will remain invalid untill all fields are valid
if fields are required
{
	for an input to be valid - has to have a string length > 0 
	if type is email needs to be valid email
	for select to be valid it needs a value of string length ? 0 (TIP to have a placeholder, set an option with value="" which means if someone selects the placeholder the field wont be valid)
	checkbox and toggle need to be TRUE
}
else
{
	all fields are considered valid as they are not required
}

form needs ONE button with type submit which will have disabled property until all fields are valid
Once all the input fields in a form element are considered valid the button will loose the disabled property

add <p class="invalid-message">Invalid Field</p> after the label to provide invalid field feedback when the field is invalid

//RoseWorx tables
by default, the first span in every .rwx-table-data becomes a table heading UNLESS you specify .vertical on the .rwx-table in which all the spans in the first .rwx-table-data will become a heading. If you specify .dual-headings, both will become hedings.
tables work by default without js. if you include the js module, tables will become more advanced and have sticky headers on scroll and a mist gradient in mobile to identify to users that it can be scrolled.

