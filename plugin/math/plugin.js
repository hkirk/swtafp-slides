import {KaTeX} from "./katex";
import {MathJax2} from "./mathjax2";
import {MathJax3} from "./mathjax3";
<<<<<<< HEAD
import {MathJax4} from "./mathjax4";
=======
>>>>>>> baf60f65bd66f82a2551ad4ba8123230ee0fcec9

const defaultTypesetter = MathJax2;

/*!
 * This plugin is a wrapper for the MathJax2,
<<<<<<< HEAD
 * MathJax3, MathJax4 and KaTeX typesetter plugins.
=======
 * MathJax3 and KaTeX typesetter plugins.
>>>>>>> baf60f65bd66f82a2551ad4ba8123230ee0fcec9
 */
export default Plugin = Object.assign( defaultTypesetter(), {
	KaTeX,
	MathJax2,
<<<<<<< HEAD
	MathJax3,
	MathJax4
=======
	MathJax3
>>>>>>> baf60f65bd66f82a2551ad4ba8123230ee0fcec9
} );