
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
    	let div5;
    	let span0;
    	let img0;
    	let img0_src_value;
    	let span0_data_text_value;
    	let t7;
    	let div4;
    	let span1;
    	let button0;
    	let i0;
    	let t8;
    	let span2;
    	let button1;
    	let i1;
    	let t9;
    	let span3;
    	let button2;
    	let i2;
    	let t10;
    	let span4;
    	let button3;
    	let i3;
    	let t11;
    	let div6;
    	let t13;
    	let div9;
    	let div8;
    	let div7;
    	let h1;
    	let t15;
    	let h40;
    	let t17;
    	let div10;
    	let t19;
    	let div11;
    	let button4;
    	let i4;
    	let t20;
    	let div14;
    	let div12;
    	let img1;
    	let img1_src_value;
    	let t21;
    	let div13;
    	let h41;
    	let t22;
    	let t23;
    	let h5;
    	let t24;
    	let t25;
    	let t26;
    	let div15;
    	let t28;
    	let div16;

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
    			div5 = element("div");
    			span0 = element("span");
    			img0 = element("img");
    			t7 = space();
    			div4 = element("div");
    			span1 = element("span");
    			button0 = element("button");
    			i0 = element("i");
    			t8 = space();
    			span2 = element("span");
    			button1 = element("button");
    			i1 = element("i");
    			t9 = space();
    			span3 = element("span");
    			button2 = element("button");
    			i2 = element("i");
    			t10 = space();
    			span4 = element("span");
    			button3 = element("button");
    			i3 = element("i");
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "6";
    			t13 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Mellowie";
    			t15 = space();
    			h40 = element("h4");
    			h40.textContent = "Fullstack Developer";
    			t17 = space();
    			div10 = element("div");
    			div10.textContent = "8";
    			t19 = space();
    			div11 = element("div");
    			button4 = element("button");
    			i4 = element("i");
    			t20 = space();
    			div14 = element("div");
    			div12 = element("div");
    			img1 = element("img");
    			t21 = space();
    			div13 = element("div");
    			h41 = element("h4");
    			t22 = text(/*name*/ ctx[0]);
    			t23 = space();
    			h5 = element("h5");
    			t24 = text("#");
    			t25 = text(/*id*/ ctx[1]);
    			t26 = space();
    			div15 = element("div");
    			div15.textContent = "11";
    			t28 = space();
    			div16 = element("div");
    			div16.textContent = "12";
    			attr_dev(div0, "class", "sidebar-top noselect svelte-18wfsbx");
    			add_location(div0, file, 7, 2, 117);
    			attr_dev(div1, "class", "searchbar noselect svelte-18wfsbx");
    			add_location(div1, file, 9, 2, 163);
    			attr_dev(div2, "class", "navigation-top noselect svelte-18wfsbx");
    			add_location(div2, file, 13, 2, 283);
    			attr_dev(div3, "class", "sidebar-right noselect svelte-18wfsbx");
    			add_location(div3, file, 14, 2, 330);
    			attr_dev(img0, "class", "logo svelte-18wfsbx");
    			if (!src_url_equal(img0.src, img0_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Vision");
    			add_location(img0, file, 16, 58, 472);
    			attr_dev(span0, "data-text", span0_data_text_value = "Hi " + /*name*/ ctx[0] + "!");
    			attr_dev(span0, "class", "tooltip fadein-2s svelte-18wfsbx");
    			add_location(span0, file, 16, 3, 417);
    			attr_dev(i0, "class", "fa fa-home");
    			add_location(i0, file, 19, 98, 786);
    			attr_dev(button0, "class", "sidebar-buttons fadein-3s svelte-18wfsbx");
    			add_location(button0, file, 19, 56, 744);
    			attr_dev(span1, "data-text", "Home");
    			attr_dev(span1, "class", "tooltip-sidebar-home svelte-18wfsbx");
    			add_location(span1, file, 19, 4, 692);
    			attr_dev(i1, "class", "fa fa-user");
    			add_location(i1, file, 20, 99, 928);
    			attr_dev(button1, "class", "sidebar-buttons fadein-4s svelte-18wfsbx");
    			add_location(button1, file, 20, 57, 886);
    			attr_dev(span2, "data-text", "About");
    			attr_dev(span2, "class", "tooltip-sidebar-user svelte-18wfsbx");
    			add_location(span2, file, 20, 4, 833);
    			attr_dev(i2, "class", "fa fa-book");
    			add_location(i2, file, 21, 102, 1073);
    			attr_dev(button2, "class", "sidebar-buttons fadein-5s svelte-18wfsbx");
    			add_location(button2, file, 21, 60, 1031);
    			attr_dev(span3, "data-text", "Projects");
    			attr_dev(span3, "class", "tooltip-sidebar-book svelte-18wfsbx");
    			add_location(span3, file, 21, 4, 975);
    			attr_dev(i3, "class", "fa fa-laptop");
    			add_location(i3, file, 22, 115, 1231);
    			attr_dev(button3, "class", "sidebar-buttons fadein-6s svelte-18wfsbx");
    			add_location(button3, file, 22, 73, 1189);
    			attr_dev(span4, "data-text", "Development process");
    			attr_dev(span4, "class", "tooltip-sidebar-laptop svelte-18wfsbx");
    			add_location(span4, file, 22, 4, 1120);
    			attr_dev(div4, "class", "sidebar svelte-18wfsbx");
    			add_location(div4, file, 18, 3, 666);
    			attr_dev(div5, "class", "sidebar-bottom noselect svelte-18wfsbx");
    			add_location(div5, file, 15, 2, 376);
    			attr_dev(div6, "class", "secondary-field noselect svelte-18wfsbx");
    			add_location(div6, file, 25, 2, 1297);
    			attr_dev(h1, "id", "main-field-title");
    			attr_dev(h1, "class", "svelte-18wfsbx");
    			add_location(h1, file, 29, 5, 1460);
    			attr_dev(h40, "id", "main-field-tip");
    			attr_dev(h40, "class", "svelte-18wfsbx");
    			add_location(h40, file, 30, 5, 1505);
    			attr_dev(div7, "class", "main-field-container svelte-18wfsbx");
    			add_location(div7, file, 28, 4, 1420);
    			attr_dev(div8, "class", "main-field-gradient svelte-18wfsbx");
    			add_location(div8, file, 27, 3, 1382);
    			attr_dev(div9, "class", "main-field noselect svelte-18wfsbx");
    			add_location(div9, file, 26, 2, 1345);
    			attr_dev(div10, "class", "sidebar-right-bottom noselect svelte-18wfsbx");
    			add_location(div10, file, 34, 2, 1586);
    			attr_dev(i4, "class", "fa fa-gear");
    			add_location(i4, file, 36, 45, 1722);
    			attr_dev(button4, "class", "sidebar-buttons fadein-6s svelte-18wfsbx");
    			add_location(button4, file, 36, 3, 1680);
    			attr_dev(div11, "class", "bottombar-left noselect svelte-18wfsbx");
    			add_location(div11, file, 35, 2, 1639);
    			attr_dev(img1, "class", "profilepicture fadein-6s svelte-18wfsbx");
    			if (!src_url_equal(img1.src, img1_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966631103211401276/ferret_summer.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "User: ");
    			add_location(img1, file, 40, 4, 1858);
    			attr_dev(div12, "class", "profilepicture-container svelte-18wfsbx");
    			add_location(div12, file, 39, 3, 1815);
    			attr_dev(h41, "class", "username-profile-field svelte-18wfsbx");
    			add_location(h41, file, 43, 4, 2066);
    			attr_dev(h5, "class", "username-id-field svelte-18wfsbx");
    			add_location(h5, file, 44, 4, 2117);
    			attr_dev(div13, "class", "profile-info fadein-6s svelte-18wfsbx");
    			add_location(div13, file, 42, 3, 2025);
    			attr_dev(div14, "class", "bottombar-secondary noselect svelte-18wfsbx");
    			add_location(div14, file, 38, 2, 1769);
    			attr_dev(div15, "class", "bottombar-main noselect svelte-18wfsbx");
    			add_location(div15, file, 47, 2, 2179);
    			attr_dev(div16, "class", "bottombar-right noselect svelte-18wfsbx");
    			add_location(div16, file, 48, 2, 2227);
    			attr_dev(body, "onload", "startTime()");
    			attr_dev(body, "class", "layout fadein-2s svelte-18wfsbx");
    			add_location(body, file, 6, 1, 62);
    			attr_dev(main, "class", "svelte-18wfsbx");
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
    			append_dev(body, div5);
    			append_dev(div5, span0);
    			append_dev(span0, img0);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, span1);
    			append_dev(span1, button0);
    			append_dev(button0, i0);
    			append_dev(div4, t8);
    			append_dev(div4, span2);
    			append_dev(span2, button1);
    			append_dev(button1, i1);
    			append_dev(div4, t9);
    			append_dev(div4, span3);
    			append_dev(span3, button2);
    			append_dev(button2, i2);
    			append_dev(div4, t10);
    			append_dev(div4, span4);
    			append_dev(span4, button3);
    			append_dev(button3, i3);
    			append_dev(body, t11);
    			append_dev(body, div6);
    			append_dev(body, t13);
    			append_dev(body, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, h1);
    			append_dev(div7, t15);
    			append_dev(div7, h40);
    			append_dev(body, t17);
    			append_dev(body, div10);
    			append_dev(body, t19);
    			append_dev(body, div11);
    			append_dev(div11, button4);
    			append_dev(button4, i4);
    			append_dev(body, t20);
    			append_dev(body, div14);
    			append_dev(div14, div12);
    			append_dev(div12, img1);
    			append_dev(div14, t21);
    			append_dev(div14, div13);
    			append_dev(div13, h41);
    			append_dev(h41, t22);
    			append_dev(div13, t23);
    			append_dev(div13, h5);
    			append_dev(h5, t24);
    			append_dev(h5, t25);
    			append_dev(body, t26);
    			append_dev(body, div15);
    			append_dev(body, t28);
    			append_dev(body, div16);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && span0_data_text_value !== (span0_data_text_value = "Hi " + /*name*/ ctx[0] + "!")) {
    				attr_dev(span0, "data-text", span0_data_text_value);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t22, /*name*/ ctx[0]);
    			if (dirty & /*id*/ 2) set_data_dev(t25, /*id*/ ctx[1]);
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
