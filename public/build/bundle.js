
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
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    	let div22;
    	let ul;
    	let h3;
    	let t13;
    	let li0;
    	let div7;
    	let div6;
    	let h40;
    	let t15;
    	let h60;
    	let t17;
    	let h61;
    	let t19;
    	let li1;
    	let div9;
    	let div8;
    	let h41;
    	let t21;
    	let h62;
    	let t23;
    	let h63;
    	let t25;
    	let li2;
    	let div11;
    	let div10;
    	let h42;
    	let t27;
    	let h64;
    	let t29;
    	let h65;
    	let t31;
    	let li3;
    	let div13;
    	let div12;
    	let h43;
    	let t33;
    	let h66;
    	let t35;
    	let h67;
    	let t37;
    	let li4;
    	let div15;
    	let div14;
    	let h44;
    	let t39;
    	let h68;
    	let t41;
    	let h69;
    	let t43;
    	let li5;
    	let div17;
    	let div16;
    	let h45;
    	let t45;
    	let h610;
    	let t47;
    	let h611;
    	let t49;
    	let li6;
    	let div19;
    	let div18;
    	let h46;
    	let t51;
    	let h612;
    	let t53;
    	let h613;
    	let t55;
    	let li7;
    	let div21;
    	let div20;
    	let h47;
    	let t57;
    	let h614;
    	let t59;
    	let h615;
    	let t61;
    	let div25;
    	let div24;
    	let div23;
    	let t62;
    	let div26;
    	let t64;
    	let div27;
    	let button4;
    	let i4;
    	let t65;
    	let div30;
    	let div28;
    	let img1;
    	let img1_src_value;
    	let t66;
    	let div29;
    	let h48;
    	let t67;
    	let t68;
    	let h5;
    	let t69;
    	let t70;
    	let t71;
    	let div31;
    	let t73;
    	let div32;

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
    			div22 = element("div");
    			ul = element("ul");
    			h3 = element("h3");
    			h3.textContent = "Incoming Messages";
    			t13 = space();
    			li0 = element("li");
    			div7 = element("div");
    			div6 = element("div");
    			h40 = element("h4");
    			h40.textContent = "franksfan";
    			t15 = space();
    			h60 = element("h6");
    			h60.textContent = "🍌 Nanism";
    			t17 = space();
    			h61 = element("h6");
    			h61.textContent = "➤ How's u doing?";
    			t19 = space();
    			li1 = element("li");
    			div9 = element("div");
    			div8 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Definitely Luna";
    			t21 = space();
    			h62 = element("h6");
    			h62.textContent = "❤️ Love EMERGY DWINKS";
    			t23 = space();
    			h63 = element("h6");
    			h63.textContent = "➤ Goodmorning";
    			t25 = space();
    			li2 = element("li");
    			div11 = element("div");
    			div10 = element("div");
    			h42 = element("h4");
    			h42.textContent = "RosePhoenix";
    			t27 = space();
    			h64 = element("h6");
    			h64.textContent = "Catgirl";
    			t29 = space();
    			h65 = element("h6");
    			h65.textContent = "➤ [Attachment] -";
    			t31 = space();
    			li3 = element("li");
    			div13 = element("div");
    			div12 = element("div");
    			h43 = element("h4");
    			h43.textContent = "John";
    			t33 = space();
    			h66 = element("h6");
    			h66.textContent = "🍌 Nanism";
    			t35 = space();
    			h67 = element("h6");
    			h67.textContent = "➤ Hey whats up?";
    			t37 = space();
    			li4 = element("li");
    			div15 = element("div");
    			div14 = element("div");
    			h44 = element("h4");
    			h44.textContent = "John";
    			t39 = space();
    			h68 = element("h6");
    			h68.textContent = "🍌 Nanism";
    			t41 = space();
    			h69 = element("h6");
    			h69.textContent = "➤ Hey whats up?";
    			t43 = space();
    			li5 = element("li");
    			div17 = element("div");
    			div16 = element("div");
    			h45 = element("h4");
    			h45.textContent = "John";
    			t45 = space();
    			h610 = element("h6");
    			h610.textContent = "🍌 Nanism";
    			t47 = space();
    			h611 = element("h6");
    			h611.textContent = "➤ Hey whats up?";
    			t49 = space();
    			li6 = element("li");
    			div19 = element("div");
    			div18 = element("div");
    			h46 = element("h4");
    			h46.textContent = "John";
    			t51 = space();
    			h612 = element("h6");
    			h612.textContent = "🍌 Nanism";
    			t53 = space();
    			h613 = element("h6");
    			h613.textContent = "➤ Hey whats up?";
    			t55 = space();
    			li7 = element("li");
    			div21 = element("div");
    			div20 = element("div");
    			h47 = element("h4");
    			h47.textContent = "John";
    			t57 = space();
    			h614 = element("h6");
    			h614.textContent = "🍌 Nanism";
    			t59 = space();
    			h615 = element("h6");
    			h615.textContent = "➤ Hey whats up?";
    			t61 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			t62 = space();
    			div26 = element("div");
    			div26.textContent = "8";
    			t64 = space();
    			div27 = element("div");
    			button4 = element("button");
    			i4 = element("i");
    			t65 = space();
    			div30 = element("div");
    			div28 = element("div");
    			img1 = element("img");
    			t66 = space();
    			div29 = element("div");
    			h48 = element("h4");
    			t67 = text(/*name*/ ctx[0]);
    			t68 = space();
    			h5 = element("h5");
    			t69 = text("#");
    			t70 = text(/*id*/ ctx[1]);
    			t71 = space();
    			div31 = element("div");
    			div31.textContent = "11";
    			t73 = space();
    			div32 = element("div");
    			div32.textContent = "12";
    			attr_dev(div0, "class", "sidebar-top noselect svelte-tfezau");
    			add_location(div0, file, 37, 3, 563);
    			attr_dev(div1, "class", "searchbar noselect svelte-tfezau");
    			add_location(div1, file, 39, 3, 611);
    			attr_dev(div2, "class", "navigation-top noselect svelte-tfezau");
    			add_location(div2, file, 43, 3, 735);
    			attr_dev(div3, "class", "sidebar-right noselect svelte-tfezau");
    			add_location(div3, file, 44, 3, 783);
    			attr_dev(img0, "class", "logo svelte-tfezau");
    			if (!src_url_equal(img0.src, img0_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Vision");
    			add_location(img0, file, 46, 59, 927);
    			attr_dev(span0, "data-text", span0_data_text_value = "Hi " + /*name*/ ctx[0] + "!");
    			attr_dev(span0, "class", "tooltip fadein-2s svelte-tfezau");
    			add_location(span0, file, 46, 4, 872);
    			attr_dev(i0, "class", "fa fa-home");
    			add_location(i0, file, 49, 99, 1244);
    			attr_dev(button0, "class", "sidebar-buttons fadein-3s svelte-tfezau");
    			add_location(button0, file, 49, 57, 1202);
    			attr_dev(span1, "data-text", "Home");
    			attr_dev(span1, "class", "tooltip-sidebar-home svelte-tfezau");
    			add_location(span1, file, 49, 5, 1150);
    			attr_dev(i1, "class", "fa fa-user");
    			add_location(i1, file, 50, 122, 1409);
    			attr_dev(button1, "class", "sidebar-buttons fadein-4s svelte-tfezau");
    			attr_dev(button1, "onclick", "showAbout()");
    			add_location(button1, file, 50, 58, 1345);
    			attr_dev(span2, "data-text", "About");
    			attr_dev(span2, "class", "tooltip-sidebar-user svelte-tfezau");
    			add_location(span2, file, 50, 5, 1292);
    			attr_dev(i2, "class", "fa fa-book");
    			add_location(i2, file, 51, 128, 1580);
    			attr_dev(button2, "class", "sidebar-buttons fadein-5s svelte-tfezau");
    			attr_dev(button2, "onclick", "showProjects()");
    			add_location(button2, file, 51, 61, 1513);
    			attr_dev(span3, "data-text", "Projects");
    			attr_dev(span3, "class", "tooltip-sidebar-book svelte-tfezau");
    			add_location(span3, file, 51, 5, 1457);
    			attr_dev(i3, "class", "fa fa-laptop");
    			add_location(i3, file, 52, 132, 1755);
    			attr_dev(button3, "class", "sidebar-buttons fadein-6s svelte-tfezau");
    			attr_dev(button3, "onclick", "showDevProc()");
    			add_location(button3, file, 52, 66, 1689);
    			attr_dev(span4, "data-text", "Development");
    			attr_dev(span4, "class", "tooltip-sidebar-laptop svelte-tfezau");
    			add_location(span4, file, 52, 5, 1628);
    			attr_dev(div4, "class", "sidebar svelte-tfezau");
    			add_location(div4, file, 48, 4, 1123);
    			attr_dev(div5, "class", "sidebar-bottom noselect svelte-tfezau");
    			add_location(div5, file, 45, 3, 830);
    			set_style(h3, "color", "lightgray");
    			set_style(h3, "border-bottom", "solid 0.2vh #3a4f84");
    			set_style(h3, "padding-bottom", "1.5vh");
    			set_style(h3, "width", "80%");
    			set_style(h3, "margin-right", "10%");
    			set_style(h3, "margin-left", "10%");
    			add_location(h3, file, 57, 5, 1928);
    			attr_dev(h40, "class", "item-name svelte-tfezau");
    			add_location(h40, file, 61, 8, 2162);
    			attr_dev(h60, "class", "item-name color-grey svelte-tfezau");
    			add_location(h60, file, 62, 8, 2207);
    			attr_dev(h61, "class", "item-message svelte-tfezau");
    			add_location(h61, file, 63, 8, 2263);
    			attr_dev(div6, "class", "item-text svelte-tfezau");
    			add_location(div6, file, 60, 7, 2130);
    			attr_dev(div7, "class", "items svelte-tfezau");
    			add_location(div7, file, 59, 6, 2103);
    			add_location(li0, file, 58, 5, 2092);
    			attr_dev(h41, "class", "item-name svelte-tfezau");
    			add_location(h41, file, 70, 8, 2427);
    			attr_dev(h62, "class", "item-name color-grey svelte-tfezau");
    			add_location(h62, file, 71, 8, 2478);
    			attr_dev(h63, "class", "item-message svelte-tfezau");
    			add_location(h63, file, 72, 8, 2546);
    			attr_dev(div8, "class", "item-text svelte-tfezau");
    			add_location(div8, file, 69, 7, 2395);
    			attr_dev(div9, "class", "items svelte-tfezau");
    			add_location(div9, file, 68, 6, 2368);
    			add_location(li1, file, 67, 5, 2357);
    			attr_dev(h42, "class", "item-name svelte-tfezau");
    			add_location(h42, file, 79, 8, 2708);
    			attr_dev(h64, "class", "item-name color-grey svelte-tfezau");
    			add_location(h64, file, 80, 8, 2755);
    			attr_dev(h65, "class", "item-message svelte-tfezau");
    			add_location(h65, file, 81, 8, 2809);
    			attr_dev(div10, "class", "item-text svelte-tfezau");
    			add_location(div10, file, 78, 7, 2676);
    			attr_dev(div11, "class", "items svelte-tfezau");
    			add_location(div11, file, 77, 6, 2649);
    			add_location(li2, file, 76, 5, 2638);
    			attr_dev(h43, "class", "item-name svelte-tfezau");
    			add_location(h43, file, 88, 8, 2974);
    			attr_dev(h66, "class", "item-name color-grey svelte-tfezau");
    			add_location(h66, file, 89, 8, 3014);
    			attr_dev(h67, "class", "item-message svelte-tfezau");
    			add_location(h67, file, 90, 8, 3070);
    			attr_dev(div12, "class", "item-text svelte-tfezau");
    			add_location(div12, file, 87, 7, 2942);
    			attr_dev(div13, "class", "items svelte-tfezau");
    			add_location(div13, file, 86, 6, 2915);
    			add_location(li3, file, 85, 5, 2904);
    			attr_dev(h44, "class", "item-name svelte-tfezau");
    			add_location(h44, file, 97, 8, 3233);
    			attr_dev(h68, "class", "item-name color-grey svelte-tfezau");
    			add_location(h68, file, 98, 8, 3273);
    			attr_dev(h69, "class", "item-message svelte-tfezau");
    			add_location(h69, file, 99, 8, 3329);
    			attr_dev(div14, "class", "item-text svelte-tfezau");
    			add_location(div14, file, 96, 7, 3201);
    			attr_dev(div15, "class", "items svelte-tfezau");
    			add_location(div15, file, 95, 6, 3174);
    			add_location(li4, file, 94, 5, 3163);
    			attr_dev(h45, "class", "item-name svelte-tfezau");
    			add_location(h45, file, 106, 8, 3492);
    			attr_dev(h610, "class", "item-name color-grey svelte-tfezau");
    			add_location(h610, file, 107, 8, 3532);
    			attr_dev(h611, "class", "item-message svelte-tfezau");
    			add_location(h611, file, 108, 8, 3588);
    			attr_dev(div16, "class", "item-text svelte-tfezau");
    			add_location(div16, file, 105, 7, 3460);
    			attr_dev(div17, "class", "items svelte-tfezau");
    			add_location(div17, file, 104, 6, 3433);
    			add_location(li5, file, 103, 5, 3422);
    			attr_dev(h46, "class", "item-name svelte-tfezau");
    			add_location(h46, file, 115, 8, 3751);
    			attr_dev(h612, "class", "item-name color-grey svelte-tfezau");
    			add_location(h612, file, 116, 8, 3791);
    			attr_dev(h613, "class", "item-message svelte-tfezau");
    			add_location(h613, file, 117, 8, 3847);
    			attr_dev(div18, "class", "item-text svelte-tfezau");
    			add_location(div18, file, 114, 7, 3719);
    			attr_dev(div19, "class", "items svelte-tfezau");
    			add_location(div19, file, 113, 6, 3692);
    			add_location(li6, file, 112, 5, 3681);
    			attr_dev(h47, "class", "item-name svelte-tfezau");
    			add_location(h47, file, 124, 8, 4010);
    			attr_dev(h614, "class", "item-name color-grey svelte-tfezau");
    			add_location(h614, file, 125, 8, 4050);
    			attr_dev(h615, "class", "item-message svelte-tfezau");
    			add_location(h615, file, 126, 8, 4106);
    			attr_dev(div20, "class", "item-text svelte-tfezau");
    			add_location(div20, file, 123, 7, 3978);
    			attr_dev(div21, "class", "items svelte-tfezau");
    			add_location(div21, file, 122, 6, 3951);
    			add_location(li7, file, 121, 5, 3940);
    			attr_dev(ul, "class", "cards fadein-2s svelte-tfezau");
    			add_location(ul, file, 56, 4, 1894);
    			attr_dev(div22, "class", "secondary-field noselect svelte-tfezau");
    			set_style(div22, "overflow-y", "scroll");
    			add_location(div22, file, 55, 3, 1824);
    			attr_dev(div23, "class", "main-content");
    			add_location(div23, file, 134, 5, 4295);
    			attr_dev(div24, "class", "main-field-container svelte-tfezau");
    			add_location(div24, file, 133, 4, 4255);
    			attr_dev(div25, "class", "main-field noselect svelte-tfezau");
    			add_location(div25, file, 132, 3, 4217);
    			attr_dev(div26, "class", "sidebar-right-bottom noselect svelte-tfezau");
    			add_location(div26, file, 139, 3, 4359);
    			attr_dev(i4, "class", "fa fa-gear");
    			add_location(i4, file, 141, 71, 4522);
    			attr_dev(button4, "class", "sidebar-buttons fadein-6s svelte-tfezau");
    			attr_dev(button4, "onclick", "showSettings()");
    			add_location(button4, file, 141, 4, 4455);
    			attr_dev(div27, "class", "bottombar-left noselect svelte-tfezau");
    			add_location(div27, file, 140, 3, 4413);
    			attr_dev(img1, "class", "profilepicture fadein-6s svelte-tfezau");
    			if (!src_url_equal(img1.src, img1_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966631103211401276/ferret_summer.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "User: ");
    			add_location(img1, file, 145, 5, 4662);
    			attr_dev(div28, "class", "profilepicture-container svelte-tfezau");
    			add_location(div28, file, 144, 4, 4618);
    			attr_dev(h48, "class", "username-profile-field svelte-tfezau");
    			add_location(h48, file, 148, 5, 4873);
    			attr_dev(h5, "class", "username-id-field svelte-tfezau");
    			add_location(h5, file, 149, 5, 4925);
    			attr_dev(div29, "class", "profile-info fadein-6s svelte-tfezau");
    			add_location(div29, file, 147, 4, 4831);
    			attr_dev(div30, "class", "bottombar-secondary noselect svelte-tfezau");
    			add_location(div30, file, 143, 3, 4571);
    			attr_dev(div31, "class", "bottombar-main noselect svelte-tfezau");
    			add_location(div31, file, 152, 3, 4990);
    			attr_dev(div32, "class", "bottombar-right noselect svelte-tfezau");
    			add_location(div32, file, 153, 3, 5039);
    			attr_dev(body, "onload", "startTime()");
    			attr_dev(body, "class", "layout fadein-2s svelte-tfezau");
    			add_location(body, file, 35, 1, 480);
    			attr_dev(main, "class", "svelte-tfezau");
    			add_location(main, file, 34, 0, 472);
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
    			append_dev(body, div22);
    			append_dev(div22, ul);
    			append_dev(ul, h3);
    			append_dev(ul, t13);
    			append_dev(ul, li0);
    			append_dev(li0, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h40);
    			append_dev(div6, t15);
    			append_dev(div6, h60);
    			append_dev(div6, t17);
    			append_dev(div6, h61);
    			append_dev(ul, t19);
    			append_dev(ul, li1);
    			append_dev(li1, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h41);
    			append_dev(div8, t21);
    			append_dev(div8, h62);
    			append_dev(div8, t23);
    			append_dev(div8, h63);
    			append_dev(ul, t25);
    			append_dev(ul, li2);
    			append_dev(li2, div11);
    			append_dev(div11, div10);
    			append_dev(div10, h42);
    			append_dev(div10, t27);
    			append_dev(div10, h64);
    			append_dev(div10, t29);
    			append_dev(div10, h65);
    			append_dev(ul, t31);
    			append_dev(ul, li3);
    			append_dev(li3, div13);
    			append_dev(div13, div12);
    			append_dev(div12, h43);
    			append_dev(div12, t33);
    			append_dev(div12, h66);
    			append_dev(div12, t35);
    			append_dev(div12, h67);
    			append_dev(ul, t37);
    			append_dev(ul, li4);
    			append_dev(li4, div15);
    			append_dev(div15, div14);
    			append_dev(div14, h44);
    			append_dev(div14, t39);
    			append_dev(div14, h68);
    			append_dev(div14, t41);
    			append_dev(div14, h69);
    			append_dev(ul, t43);
    			append_dev(ul, li5);
    			append_dev(li5, div17);
    			append_dev(div17, div16);
    			append_dev(div16, h45);
    			append_dev(div16, t45);
    			append_dev(div16, h610);
    			append_dev(div16, t47);
    			append_dev(div16, h611);
    			append_dev(ul, t49);
    			append_dev(ul, li6);
    			append_dev(li6, div19);
    			append_dev(div19, div18);
    			append_dev(div18, h46);
    			append_dev(div18, t51);
    			append_dev(div18, h612);
    			append_dev(div18, t53);
    			append_dev(div18, h613);
    			append_dev(ul, t55);
    			append_dev(ul, li7);
    			append_dev(li7, div21);
    			append_dev(div21, div20);
    			append_dev(div20, h47);
    			append_dev(div20, t57);
    			append_dev(div20, h614);
    			append_dev(div20, t59);
    			append_dev(div20, h615);
    			append_dev(body, t61);
    			append_dev(body, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div23);
    			append_dev(body, t62);
    			append_dev(body, div26);
    			append_dev(body, t64);
    			append_dev(body, div27);
    			append_dev(div27, button4);
    			append_dev(button4, i4);
    			append_dev(body, t65);
    			append_dev(body, div30);
    			append_dev(div30, div28);
    			append_dev(div28, img1);
    			append_dev(div30, t66);
    			append_dev(div30, div29);
    			append_dev(div29, h48);
    			append_dev(h48, t67);
    			append_dev(div29, t68);
    			append_dev(div29, h5);
    			append_dev(h5, t69);
    			append_dev(h5, t70);
    			append_dev(body, t71);
    			append_dev(body, div31);
    			append_dev(body, t73);
    			append_dev(body, div32);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && span0_data_text_value !== (span0_data_text_value = "Hi " + /*name*/ ctx[0] + "!")) {
    				attr_dev(span0, "data-text", span0_data_text_value);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t67, /*name*/ ctx[0]);
    			if (dirty & /*id*/ 2) set_data_dev(t70, /*id*/ ctx[1]);
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

    function showAbout() {
    	var hideAll = document.getElementById("everything");
    	hideAll.style.display === "none";
    }

    /*-------------------*/
    /* SHOW PROJECTS TAB */
    function showProjects() {
    	
    }

    /*-------------------*/
    /* SHOW PROJECTS TAB */
    function showDevProc() {
    	
    }

    /*-------------------*/
    /* SHOW PROJECTS TAB */
    function showSettings() {
    	
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

    	$$self.$capture_state = () => ({
    		name,
    		id,
    		showAbout,
    		showProjects,
    		showDevProc,
    		showSettings
    	});

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
