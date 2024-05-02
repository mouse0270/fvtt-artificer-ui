import autoprefixer from 'autoprefixer';
import postcssMixins from 'postcss-mixins';
import simpleVars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnano from 'cssnano';

export default {
  plugins: [
    autoprefixer,
    postcssMixins,
    simpleVars,
    nested,
	  //cssnano
  ]
};
