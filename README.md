roseworx.adyrose.co.uk

Documentation
mixin provided for changing link color @include change-link-color($white); - useful for having links in navigations which dont follow the general rule for <a> tags in normal content. For example .navigation ul li {@include change-link-color($white);} will change all <a> tags and the underline color to white in each .navigation ul li

//modules
add .preload class to the body and import {rwxPreload} from 'roseworx' and new rwxPreload() - this removes the problem of css animations runnning on page load
//RoseWorx SkrollX
Scroll animation library for parallax scrolling animations
import {SkrollX} from 'roseworx' new SkrollX(trigger) - trigger is the distance from the bottom of the screen which when scrolled - triggers the animation.
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
