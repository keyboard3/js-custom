import h from './h.mjs';
import Component from './component.mjs';
import render from './render.mjs';
import { rerender } from './render-queue.mjs';
import options from './options.mjs';

export default {
	h,
	Component,
	render,
	rerender,
	options,
	hooks: options
};
