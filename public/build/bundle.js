
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.47.0 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let body;
    	let div0;
    	let t0;
    	let div1;
    	let t2;
    	let div2;
    	let t4;
    	let div3;
    	let t6;
    	let div4;
    	let span;
    	let img0;
    	let img0_src_value;
    	let span_data_text_value;
    	let t7;
    	let div5;
    	let t9;
    	let div6;
    	let t11;
    	let div7;
    	let t13;
    	let div8;
    	let t15;
    	let div10;
    	let img1;
    	let img1_src_value;
    	let t16;
    	let div9;
    	let h4;
    	let t17;
    	let t18;
    	let h5;
    	let t19;
    	let t20;
    	let t21;
    	let div11;
    	let t23;
    	let div12;

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "2";
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "3";
    			t4 = space();
    			div3 = element("div");
    			div3.textContent = "4";
    			t6 = space();
    			div4 = element("div");
    			span = element("span");
    			img0 = element("img");
    			t7 = space();
    			div5 = element("div");
    			div5.textContent = "6";
    			t9 = space();
    			div6 = element("div");
    			div6.textContent = "7";
    			t11 = space();
    			div7 = element("div");
    			div7.textContent = "8";
    			t13 = space();
    			div8 = element("div");
    			div8.textContent = "9";
    			t15 = space();
    			div10 = element("div");
    			img1 = element("img");
    			t16 = space();
    			div9 = element("div");
    			h4 = element("h4");
    			t17 = text(/*name*/ ctx[0]);
    			t18 = space();
    			h5 = element("h5");
    			t19 = text("#");
    			t20 = text(/*id*/ ctx[1]);
    			t21 = space();
    			div11 = element("div");
    			div11.textContent = "11";
    			t23 = space();
    			div12 = element("div");
    			div12.textContent = "12";
    			attr_dev(div0, "class", "sidebar-top noselect svelte-at9h5");
    			add_location(div0, file, 7, 2, 86);
    			attr_dev(div1, "class", "searchbar svelte-at9h5");
    			add_location(div1, file, 9, 2, 132);
    			attr_dev(div2, "class", "navigation-top noselect svelte-at9h5");
    			add_location(div2, file, 13, 2, 243);
    			attr_dev(div3, "class", "sidebar-right svelte-at9h5");
    			add_location(div3, file, 14, 2, 290);
    			attr_dev(img0, "class", "logo svelte-at9h5");
    			if (!src_url_equal(img0.src, img0_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Vision");
    			add_location(img0, file, 16, 48, 404);
    			attr_dev(span, "data-text", span_data_text_value = "Hi " + /*name*/ ctx[0] + "!");
    			attr_dev(span, "class", "tooltip svelte-at9h5");
    			add_location(span, file, 16, 3, 359);
    			attr_dev(div4, "class", "sidebar-bottom svelte-at9h5");
    			add_location(div4, file, 15, 2, 327);
    			attr_dev(div5, "class", "secondary-field svelte-at9h5");
    			add_location(div5, file, 19, 2, 606);
    			attr_dev(div6, "class", "main-field svelte-at9h5");
    			add_location(div6, file, 20, 2, 645);
    			attr_dev(div7, "class", "sidebar-right-bottom svelte-at9h5");
    			add_location(div7, file, 21, 2, 679);
    			attr_dev(div8, "class", "bottombar-left svelte-at9h5");
    			add_location(div8, file, 22, 2, 723);
    			attr_dev(img1, "class", "profilepicture svelte-at9h5");
    			if (!src_url_equal(img1.src, img1_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966631103211401276/ferret_summer.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "User: ");
    			add_location(img1, file, 24, 3, 807);
    			attr_dev(h4, "class", "username-profile-field svelte-at9h5");
    			add_location(h4, file, 26, 4, 985);
    			attr_dev(h5, "class", "username-id-field svelte-at9h5");
    			add_location(h5, file, 27, 4, 1036);
    			attr_dev(div9, "class", "profile-info svelte-at9h5");
    			add_location(div9, file, 25, 3, 954);
    			attr_dev(div10, "class", "bottombar-secondary noselect svelte-at9h5");
    			add_location(div10, file, 23, 2, 761);
    			attr_dev(div11, "class", "bottombar-main svelte-at9h5");
    			add_location(div11, file, 30, 2, 1098);
    			attr_dev(div12, "class", "bottombar-right svelte-at9h5");
    			add_location(div12, file, 31, 2, 1137);
    			attr_dev(body, "class", "layout svelte-at9h5");
    			add_location(body, file, 6, 1, 62);
    			attr_dev(main, "class", "svelte-at9h5");
    			add_location(main, file, 5, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			append_dev(body, div0);
    			append_dev(body, t0);
    			append_dev(body, div1);
    			append_dev(body, t2);
    			append_dev(body, div2);
    			append_dev(body, t4);
    			append_dev(body, div3);
    			append_dev(body, t6);
    			append_dev(body, div4);
    			append_dev(div4, span);
    			append_dev(span, img0);
    			append_dev(body, t7);
    			append_dev(body, div5);
    			append_dev(body, t9);
    			append_dev(body, div6);
    			append_dev(body, t11);
    			append_dev(body, div7);
    			append_dev(body, t13);
    			append_dev(body, div8);
    			append_dev(body, t15);
    			append_dev(body, div10);
    			append_dev(div10, img1);
    			append_dev(div10, t16);
    			append_dev(div10, div9);
    			append_dev(div9, h4);
    			append_dev(h4, t17);
    			append_dev(div9, t18);
    			append_dev(div9, h5);
    			append_dev(h5, t19);
    			append_dev(h5, t20);
    			append_dev(body, t21);
    			append_dev(body, div11);
    			append_dev(body, t23);
    			append_dev(body, div12);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && span_data_text_value !== (span_data_text_value = "Hi " + /*name*/ ctx[0] + "!")) {
    				attr_dev(span, "data-text", span_data_text_value);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t17, /*name*/ ctx[0]);
    			if (dirty & /*id*/ 2) set_data_dev(t20, /*id*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name } = $$props;
    	let { id } = $$props;
    	const writable_props = ['name', 'id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ name, id });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, id];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0, id: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}

    		if (/*id*/ ctx[1] === undefined && !('id' in props)) {
    			console.warn("<App> was created without expected prop 'id'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'LunaMellow',
    		id: '3333'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
