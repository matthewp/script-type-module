import { __moduleExports as acorn } from 'acorn/dist/acorn.js';
import { __moduleExports as walk } from 'acorn/dist/walk.js';

acorn.walk = walk;
export default acorn;
