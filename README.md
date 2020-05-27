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
scroll animation factory with scroll utilities
zopaque levels and opaque in keyframes
flex slider?
react components ?
forms - svg tickbox animation


Bugs
JS include everything even for named export/import


Documentation
Import your own variables in SCSS before importing rose-utils to overide varibales
after md breakpoint everything is full width by default
add .preload class to the body and import {rwxPreload} from 'roseworx' and new rwxPreload() - this removes the problem of css animations runnning on page load


//RoseWorx SkrollX
Scroll animation library for parallax scrolling animations
import {SkrollX} from 'roseworx' new SkrollX(trigger) - trigger is the distance from the bottom of the screen which when scrolled - triggers the animation.
// give any element [rsw-skrlx] attribute and either .rwxsx-start-left, .rwxsx-start-right, .rwxsx-start-top, .rwxsx-start-bottom


// HELPER CLASSES

// RoseWorx Spacing (margin)
.rwxs-m-sm, .rwxs-m-md, .rwxs-m-lg, .rwxs-m-no, .rwxs-m-l-no, .rwxs-m-r-no, .rwxs-m-t-no, .rwxs-m-b-no .rwxs-m-l-sm, .rwxs-m-r-sm, .rwxs-m-t-sm, .rwxs-m-b-sm, .rwxs-m-l-md, .rwxs-m-r-md, .rwxs-m-t-md, .rwxs-m-b-md, .rwxs-m-l-lg, .rwxs-m-r-lg, .rwxs-m-t-lg, .rwxs-m-b-lg

// RoseWorx Spacing (padding)
.rwxs-p-sm, .rwxs-p-md, .rwxs-p-lg, .rwxs-p-no, .rwxs-p-l-no, .rwxs-p-r-no, .rwxs-p-t-no, .rwxs-p-b-no .rwxs-p-l-sm, .rwxs-p-r-sm, .rwxs-p-t-sm, .rwxs-p-b-sm, .rwxs-p-l-md, .rwxs-p-r-md, .rwxs-p-t-md, .rwxs-p-b-md, .rwxs-p-l-lg, .rwxs-p-r-lg, .rwxs-p-t-lg, .rwxs-p-b-lg

// RoseWorx Font
.rwxf-light, .rwxf-normal, .rwxf-bold, .rwxf-extra-bold

// RoseWorx Utilities
//.rwxu

// RoseWorx Forms ??
// importing the scss only gets forms styles, import Form in JS and put [rsx-form] attribute to a html form for the js
