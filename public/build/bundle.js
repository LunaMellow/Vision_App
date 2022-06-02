
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
    	let div17;
    	let ul;
    	let h3;
    	let t2;
    	let li0;
    	let div2;
    	let div1;
    	let h40;
    	let t4;
    	let h60;
    	let t6;
    	let h61;
    	let t8;
    	let li1;
    	let div4;
    	let div3;
    	let h41;
    	let t10;
    	let h62;
    	let t12;
    	let h63;
    	let t14;
    	let li2;
    	let div6;
    	let div5;
    	let h42;
    	let t16;
    	let h64;
    	let t18;
    	let h65;
    	let t20;
    	let li3;
    	let div8;
    	let div7;
    	let h43;
    	let t22;
    	let h66;
    	let t24;
    	let h67;
    	let t26;
    	let li4;
    	let div10;
    	let div9;
    	let h44;
    	let t28;
    	let h68;
    	let t30;
    	let h69;
    	let t32;
    	let li5;
    	let div12;
    	let div11;
    	let h45;
    	let t34;
    	let h610;
    	let t36;
    	let h611;
    	let t38;
    	let li6;
    	let div14;
    	let div13;
    	let h46;
    	let t40;
    	let h612;
    	let span0;
    	let t42;
    	let t43;
    	let h613;
    	let t45;
    	let li7;
    	let div16;
    	let div15;
    	let h47;
    	let t47;
    	let h614;
    	let t49;
    	let h615;
    	let t51;
    	let div18;
    	let h616;
    	let t53;
    	let div19;
    	let t54;
    	let div20;
    	let t55;
    	let div22;
    	let span1;
    	let img0;
    	let img0_src_value;
    	let span1_data_text_value;
    	let t56;
    	let div21;
    	let span2;
    	let button0;
    	let i0;
    	let t57;
    	let span3;
    	let button1;
    	let i1;
    	let t58;
    	let span4;
    	let button2;
    	let i2;
    	let t59;
    	let span5;
    	let button3;
    	let i3;
    	let t60;
    	let div41;
    	let div33;
    	let div32;
    	let div24;
    	let div23;
    	let h48;
    	let t62;
    	let h1;
    	let t64;
    	let div26;
    	let div25;
    	let a0;
    	let img1;
    	let img1_src_value;
    	let t65;
    	let a1;
    	let img2;
    	let img2_src_value;
    	let t66;
    	let div28;
    	let div27;
    	let img3;
    	let img3_src_value;
    	let t67;
    	let img4;
    	let img4_src_value;
    	let t68;
    	let img5;
    	let img5_src_value;
    	let t69;
    	let img6;
    	let img6_src_value;
    	let t70;
    	let img7;
    	let img7_src_value;
    	let t71;
    	let img8;
    	let img8_src_value;
    	let t72;
    	let img9;
    	let img9_src_value;
    	let t73;
    	let img10;
    	let img10_src_value;
    	let t74;
    	let div30;
    	let div29;
    	let t75;
    	let div31;
    	let t76;
    	let div34;
    	let t78;
    	let div35;
    	let button4;
    	let i4;
    	let t79;
    	let div38;
    	let div36;
    	let img11;
    	let img11_src_value;
    	let t80;
    	let div37;
    	let h49;
    	let t81;
    	let t82;
    	let h5;
    	let t83;
    	let t84;
    	let t85;
    	let div39;
    	let t87;
    	let div40;

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			div0 = element("div");
    			t0 = space();
    			div17 = element("div");
    			ul = element("ul");
    			h3 = element("h3");
    			h3.textContent = "Incoming Messages";
    			t2 = space();
    			li0 = element("li");
    			div2 = element("div");
    			div1 = element("div");
    			h40 = element("h4");
    			h40.textContent = "franksfan";
    			t4 = space();
    			h60 = element("h6");
    			h60.textContent = "🍌 Nanism";
    			t6 = space();
    			h61 = element("h6");
    			h61.textContent = "➤ How's u doing?";
    			t8 = space();
    			li1 = element("li");
    			div4 = element("div");
    			div3 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Definitely Luna";
    			t10 = space();
    			h62 = element("h6");
    			h62.textContent = "❤️ Love EMERGY DWINKS";
    			t12 = space();
    			h63 = element("h6");
    			h63.textContent = "➤ Goodmorning";
    			t14 = space();
    			li2 = element("li");
    			div6 = element("div");
    			div5 = element("div");
    			h42 = element("h4");
    			h42.textContent = "RosePhoenix";
    			t16 = space();
    			h64 = element("h6");
    			h64.textContent = "Catgirl";
    			t18 = space();
    			h65 = element("h6");
    			h65.textContent = "➤ [Attachment]";
    			t20 = space();
    			li3 = element("li");
    			div8 = element("div");
    			div7 = element("div");
    			h43 = element("h4");
    			h43.textContent = "Raccoonooo";
    			t22 = space();
    			h66 = element("h6");
    			h66.textContent = "😩 we live on lies";
    			t24 = space();
    			h67 = element("h6");
    			h67.textContent = "➤ Kommer du på skolen imorgen?";
    			t26 = space();
    			li4 = element("li");
    			div10 = element("div");
    			div9 = element("div");
    			h44 = element("h4");
    			h44.textContent = "Toro";
    			t28 = space();
    			h68 = element("h6");
    			h68.textContent = "🙄 Based";
    			t30 = space();
    			h69 = element("h6");
    			h69.textContent = "➤ bruker 80 nå";
    			t32 = space();
    			li5 = element("li");
    			div12 = element("div");
    			div11 = element("div");
    			h45 = element("h4");
    			h45.textContent = "Drox";
    			t34 = space();
    			h610 = element("h6");
    			h610.textContent = "💀 Firkant";
    			t36 = space();
    			h611 = element("h6");
    			h611.textContent = "➤ Nattiii natt 💕";
    			t38 = space();
    			li6 = element("li");
    			div14 = element("div");
    			div13 = element("div");
    			h46 = element("h4");
    			h46.textContent = "Marryc";
    			t40 = space();
    			h612 = element("h6");
    			span0 = element("span");
    			span0.textContent = "Playing";
    			t42 = text(" Minecraft");
    			t43 = space();
    			h613 = element("h6");
    			h613.textContent = "➤ Stopp å erp'e! La meg joineee!!";
    			t45 = space();
    			li7 = element("li");
    			div16 = element("div");
    			div15 = element("div");
    			h47 = element("h4");
    			h47.textContent = "Gangstergruppa";
    			t47 = space();
    			h614 = element("h6");
    			h614.textContent = "Luna, Peder, Brage, Tor Oskar...";
    			t49 = space();
    			h615 = element("h6");
    			h615.textContent = "➤ Har vi fri imorgen?";
    			t51 = space();
    			div18 = element("div");
    			h616 = element("h6");
    			h616.textContent = "Vision v.2.4";
    			t53 = space();
    			div19 = element("div");
    			t54 = space();
    			div20 = element("div");
    			t55 = space();
    			div22 = element("div");
    			span1 = element("span");
    			img0 = element("img");
    			t56 = space();
    			div21 = element("div");
    			span2 = element("span");
    			button0 = element("button");
    			i0 = element("i");
    			t57 = space();
    			span3 = element("span");
    			button1 = element("button");
    			i1 = element("i");
    			t58 = space();
    			span4 = element("span");
    			button2 = element("button");
    			i2 = element("i");
    			t59 = space();
    			span5 = element("span");
    			button3 = element("button");
    			i3 = element("i");
    			t60 = space();
    			div41 = element("div");
    			div33 = element("div");
    			div32 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			h48 = element("h4");
    			h48.textContent = "Fullstack DEV";
    			t62 = space();
    			h1 = element("h1");
    			h1.textContent = "Luna Sofie Bergh";
    			t64 = space();
    			div26 = element("div");
    			div25 = element("div");
    			a0 = element("a");
    			img1 = element("img");
    			t65 = space();
    			a1 = element("a");
    			img2 = element("img");
    			t66 = space();
    			div28 = element("div");
    			div27 = element("div");
    			img3 = element("img");
    			t67 = space();
    			img4 = element("img");
    			t68 = space();
    			img5 = element("img");
    			t69 = space();
    			img6 = element("img");
    			t70 = space();
    			img7 = element("img");
    			t71 = space();
    			img8 = element("img");
    			t72 = space();
    			img9 = element("img");
    			t73 = space();
    			img10 = element("img");
    			t74 = space();
    			div30 = element("div");
    			div29 = element("div");
    			t75 = space();
    			div31 = element("div");
    			t76 = space();
    			div34 = element("div");
    			div34.textContent = "8";
    			t78 = space();
    			div35 = element("div");
    			button4 = element("button");
    			i4 = element("i");
    			t79 = space();
    			div38 = element("div");
    			div36 = element("div");
    			img11 = element("img");
    			t80 = space();
    			div37 = element("div");
    			h49 = element("h4");
    			t81 = text(/*name*/ ctx[0]);
    			t82 = space();
    			h5 = element("h5");
    			t83 = text("#");
    			t84 = text(/*id*/ ctx[1]);
    			t85 = space();
    			div39 = element("div");
    			div39.textContent = "11";
    			t87 = space();
    			div40 = element("div");
    			div40.textContent = "12";
    			attr_dev(div0, "class", "sidebar-top noselect svelte-fmlket");
    			add_location(div0, file, 43, 3, 898);
    			set_style(h3, "color", "lightgray");
    			set_style(h3, "border-bottom", "solid 0.2vh #3a4f84");
    			set_style(h3, "padding-bottom", "1.5vh");
    			set_style(h3, "width", "80%");
    			set_style(h3, "margin-right", "10%");
    			set_style(h3, "margin-left", "8.5%");
    			add_location(h3, file, 47, 5, 1050);
    			attr_dev(h40, "class", "item-name svelte-fmlket");
    			add_location(h40, file, 51, 8, 1285);
    			attr_dev(h60, "class", "item-name color-grey svelte-fmlket");
    			add_location(h60, file, 52, 8, 1330);
    			attr_dev(h61, "class", "item-message svelte-fmlket");
    			add_location(h61, file, 53, 8, 1386);
    			attr_dev(div1, "class", "item-text svelte-fmlket");
    			add_location(div1, file, 50, 7, 1253);
    			attr_dev(div2, "class", "items svelte-fmlket");
    			add_location(div2, file, 49, 6, 1226);
    			add_location(li0, file, 48, 5, 1215);
    			attr_dev(h41, "class", "item-name svelte-fmlket");
    			add_location(h41, file, 60, 8, 1550);
    			attr_dev(h62, "class", "item-name color-grey svelte-fmlket");
    			add_location(h62, file, 61, 8, 1601);
    			attr_dev(h63, "class", "item-message svelte-fmlket");
    			add_location(h63, file, 62, 8, 1669);
    			attr_dev(div3, "class", "item-text svelte-fmlket");
    			add_location(div3, file, 59, 7, 1518);
    			attr_dev(div4, "class", "items svelte-fmlket");
    			add_location(div4, file, 58, 6, 1491);
    			add_location(li1, file, 57, 5, 1480);
    			attr_dev(h42, "class", "item-name svelte-fmlket");
    			add_location(h42, file, 69, 8, 1831);
    			attr_dev(h64, "class", "item-name color-grey svelte-fmlket");
    			add_location(h64, file, 70, 8, 1878);
    			attr_dev(h65, "class", "item-message svelte-fmlket");
    			add_location(h65, file, 71, 8, 1932);
    			attr_dev(div5, "class", "item-text svelte-fmlket");
    			add_location(div5, file, 68, 7, 1799);
    			attr_dev(div6, "class", "items svelte-fmlket");
    			add_location(div6, file, 67, 6, 1772);
    			add_location(li2, file, 66, 5, 1761);
    			attr_dev(h43, "class", "item-name svelte-fmlket");
    			add_location(h43, file, 78, 8, 2095);
    			attr_dev(h66, "class", "item-name color-grey svelte-fmlket");
    			add_location(h66, file, 79, 8, 2141);
    			attr_dev(h67, "class", "item-message svelte-fmlket");
    			add_location(h67, file, 80, 8, 2206);
    			attr_dev(div7, "class", "item-text svelte-fmlket");
    			add_location(div7, file, 77, 7, 2063);
    			attr_dev(div8, "class", "items svelte-fmlket");
    			add_location(div8, file, 76, 6, 2036);
    			add_location(li3, file, 75, 5, 2025);
    			attr_dev(h44, "class", "item-name svelte-fmlket");
    			add_location(h44, file, 87, 8, 2384);
    			attr_dev(h68, "class", "item-name color-grey svelte-fmlket");
    			add_location(h68, file, 88, 8, 2424);
    			attr_dev(h69, "class", "item-message svelte-fmlket");
    			add_location(h69, file, 89, 8, 2479);
    			attr_dev(div9, "class", "item-text svelte-fmlket");
    			add_location(div9, file, 86, 7, 2352);
    			attr_dev(div10, "class", "items svelte-fmlket");
    			add_location(div10, file, 85, 6, 2325);
    			add_location(li4, file, 84, 5, 2314);
    			attr_dev(h45, "class", "item-name svelte-fmlket");
    			add_location(h45, file, 96, 8, 2641);
    			attr_dev(h610, "class", "item-name color-grey svelte-fmlket");
    			add_location(h610, file, 97, 8, 2681);
    			attr_dev(h611, "class", "item-message svelte-fmlket");
    			add_location(h611, file, 98, 8, 2738);
    			attr_dev(div11, "class", "item-text svelte-fmlket");
    			add_location(div11, file, 95, 7, 2609);
    			attr_dev(div12, "class", "items svelte-fmlket");
    			add_location(div12, file, 94, 6, 2582);
    			add_location(li5, file, 93, 5, 2571);
    			attr_dev(h46, "class", "item-name svelte-fmlket");
    			add_location(h46, file, 105, 8, 2903);
    			set_style(span0, "font-weight", "bold");
    			add_location(span0, file, 106, 41, 2978);
    			attr_dev(h612, "class", "item-name color-grey svelte-fmlket");
    			add_location(h612, file, 106, 8, 2945);
    			attr_dev(h613, "class", "item-message svelte-fmlket");
    			add_location(h613, file, 107, 8, 3048);
    			attr_dev(div13, "class", "item-text svelte-fmlket");
    			add_location(div13, file, 104, 7, 2871);
    			attr_dev(div14, "class", "items svelte-fmlket");
    			add_location(div14, file, 103, 6, 2844);
    			add_location(li6, file, 102, 5, 2833);
    			attr_dev(h47, "class", "item-name svelte-fmlket");
    			add_location(h47, file, 114, 8, 3229);
    			attr_dev(h614, "class", "item-name color-grey svelte-fmlket");
    			add_location(h614, file, 115, 8, 3279);
    			attr_dev(h615, "class", "item-message svelte-fmlket");
    			add_location(h615, file, 116, 8, 3358);
    			attr_dev(div15, "class", "item-text svelte-fmlket");
    			add_location(div15, file, 113, 7, 3197);
    			attr_dev(div16, "class", "items svelte-fmlket");
    			add_location(div16, file, 112, 6, 3170);
    			add_location(li7, file, 111, 5, 3159);
    			attr_dev(ul, "class", "cards fadein-2s svelte-fmlket");
    			set_style(ul, "overflow-y", "scroll");
    			add_location(ul, file, 46, 4, 989);
    			attr_dev(div17, "class", "secondary-field noselect svelte-fmlket");
    			add_location(div17, file, 45, 3, 946);
    			attr_dev(h616, "id", "app-version");
    			attr_dev(h616, "class", "svelte-fmlket");
    			add_location(h616, file, 124, 4, 3584);
    			attr_dev(div18, "class", "searchbar noselect svelte-fmlket");
    			add_location(div18, file, 122, 3, 3475);
    			attr_dev(div19, "class", "navigation-top noselect svelte-fmlket");
    			add_location(div19, file, 126, 3, 3636);
    			attr_dev(div20, "class", "sidebar-right noselect svelte-fmlket");
    			add_location(div20, file, 128, 3, 3687);
    			attr_dev(img0, "class", "logo svelte-fmlket");
    			if (!src_url_equal(img0.src, img0_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Vision");
    			add_location(img0, file, 131, 59, 3834);
    			attr_dev(span1, "data-text", span1_data_text_value = "Hi " + /*name*/ ctx[0] + "!");
    			attr_dev(span1, "class", "tooltip fadein-2s svelte-fmlket");
    			add_location(span1, file, 131, 4, 3779);
    			attr_dev(i0, "class", "fa fa-home");
    			add_location(i0, file, 134, 99, 4151);
    			attr_dev(button0, "class", "sidebar-buttons fadein-3s svelte-fmlket");
    			add_location(button0, file, 134, 57, 4109);
    			attr_dev(span2, "data-text", "Home");
    			attr_dev(span2, "class", "tooltip-sidebar-home svelte-fmlket");
    			add_location(span2, file, 134, 5, 4057);
    			attr_dev(i1, "class", "fa fa-user");
    			add_location(i1, file, 135, 122, 4316);
    			attr_dev(button1, "class", "sidebar-buttons fadein-4s svelte-fmlket");
    			attr_dev(button1, "onclick", "showAbout()");
    			add_location(button1, file, 135, 58, 4252);
    			attr_dev(span3, "data-text", "About");
    			attr_dev(span3, "class", "tooltip-sidebar-user svelte-fmlket");
    			add_location(span3, file, 135, 5, 4199);
    			attr_dev(i2, "class", "fa fa-book");
    			add_location(i2, file, 136, 128, 4487);
    			attr_dev(button2, "class", "sidebar-buttons fadein-5s svelte-fmlket");
    			attr_dev(button2, "onclick", "showProjects()");
    			add_location(button2, file, 136, 61, 4420);
    			attr_dev(span4, "data-text", "Projects");
    			attr_dev(span4, "class", "tooltip-sidebar-book svelte-fmlket");
    			add_location(span4, file, 136, 5, 4364);
    			attr_dev(i3, "class", "fa fa-laptop");
    			add_location(i3, file, 137, 132, 4662);
    			attr_dev(button3, "class", "sidebar-buttons fadein-6s svelte-fmlket");
    			attr_dev(button3, "onclick", "showDevProc()");
    			add_location(button3, file, 137, 66, 4596);
    			attr_dev(span5, "data-text", "Development");
    			attr_dev(span5, "class", "tooltip-sidebar-laptop svelte-fmlket");
    			add_location(span5, file, 137, 5, 4535);
    			attr_dev(div21, "class", "sidebar svelte-fmlket");
    			add_location(div21, file, 133, 4, 4030);
    			attr_dev(div22, "class", "sidebar-bottom noselect svelte-fmlket");
    			add_location(div22, file, 130, 3, 3737);
    			attr_dev(h48, "id", "fullstack-title");
    			attr_dev(h48, "class", "svelte-fmlket");
    			add_location(h48, file, 145, 8, 4927);
    			attr_dev(h1, "id", "name-title");
    			attr_dev(h1, "class", "svelte-fmlket");
    			add_location(h1, file, 146, 8, 4979);
    			attr_dev(div23, "class", "main-top-left-text svelte-fmlket");
    			add_location(div23, file, 144, 7, 4886);
    			attr_dev(div24, "class", "main-top-left main-box svelte-fmlket");
    			add_location(div24, file, 143, 6, 4842);
    			if (!src_url_equal(img1.src, img1_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982030723550707762/git.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "GIT");
    			set_style(img1, "height", "5vh");
    			set_style(img1, "float", "right");
    			set_style(img1, "margin-right", "1vh");
    			set_style(img1, "margin-top", "1vh");
    			add_location(img1, file, 151, 48, 5312);
    			attr_dev(a0, "href", "https://github.com/LunaMellow");
    			add_location(a0, file, 151, 8, 5272);
    			if (!src_url_equal(img2.src, img2_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982032293151535194/repl.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "GIT");
    			set_style(img2, "height", "5vh");
    			set_style(img2, "float", "right");
    			set_style(img2, "margin-right", "1vh");
    			set_style(img2, "margin-top", "1vh");
    			add_location(img2, file, 152, 49, 5543);
    			attr_dev(a1, "href", "https://replit.com/@LunaMellow");
    			add_location(a1, file, 152, 8, 5502);
    			attr_dev(div25, "class", "socials svelte-fmlket");
    			add_location(div25, file, 150, 7, 5242);
    			attr_dev(div26, "class", "main-top-right main-box svelte-fmlket");
    			add_location(div26, file, 149, 6, 5054);
    			attr_dev(img3, "class", "slideshow svelte-fmlket");
    			if (!src_url_equal(img3.src, img3_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049506206040084/1.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "s");
    			add_location(img3, file, 157, 8, 5836);
    			attr_dev(img4, "class", "slideshow svelte-fmlket");
    			if (!src_url_equal(img4.src, img4_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049506633863198/2.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "s");
    			add_location(img4, file, 158, 8, 5965);
    			attr_dev(img5, "class", "slideshow svelte-fmlket");
    			if (!src_url_equal(img5.src, img5_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049507191713804/3.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "s");
    			add_location(img5, file, 159, 8, 6094);
    			attr_dev(img6, "class", "slideshow svelte-fmlket");
    			if (!src_url_equal(img6.src, img6_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049507623706654/4.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "s");
    			add_location(img6, file, 160, 8, 6223);
    			attr_dev(img7, "class", "slideshow svelte-fmlket");
    			if (!src_url_equal(img7.src, img7_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049507921506304/5.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "s");
    			add_location(img7, file, 161, 8, 6352);
    			attr_dev(img8, "class", "slideshow svelte-fmlket");
    			if (!src_url_equal(img8.src, img8_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049508168982538/6.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "s");
    			add_location(img8, file, 162, 8, 6481);
    			attr_dev(img9, "class", "slideshow svelte-fmlket");
    			if (!src_url_equal(img9.src, img9_src_value = "https://media.discordapp.net/attachments/640641733151162388/982050416458076210/7.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "s");
    			add_location(img9, file, 163, 8, 6610);
    			attr_dev(img10, "class", "slideshow svelte-fmlket");
    			if (!src_url_equal(img10.src, img10_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982050416667811840/8.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "s");
    			add_location(img10, file, 164, 8, 6741);
    			attr_dev(div27, "class", "wrapper svelte-fmlket");
    			add_location(div27, file, 156, 7, 5806);
    			attr_dev(div28, "class", "main-middle-left main-box svelte-fmlket");
    			add_location(div28, file, 155, 6, 5759);
    			attr_dev(div29, "class", "news svelte-fmlket");
    			add_location(div29, file, 168, 7, 6945);
    			attr_dev(div30, "class", "main-middle-right main-box svelte-fmlket");
    			add_location(div30, file, 167, 6, 6897);
    			attr_dev(div31, "class", "main-bottom main-box svelte-fmlket");
    			add_location(div31, file, 172, 6, 6998);
    			attr_dev(div32, "class", "main-content svelte-fmlket");
    			add_location(div32, file, 142, 5, 4809);
    			attr_dev(div33, "class", "main-field-container svelte-fmlket");
    			add_location(div33, file, 141, 4, 4769);
    			attr_dev(div34, "class", "sidebar-right-bottom noselect svelte-fmlket");
    			add_location(div34, file, 176, 3, 7069);
    			attr_dev(i4, "class", "fa fa-gear");
    			add_location(i4, file, 178, 71, 7232);
    			attr_dev(button4, "class", "sidebar-buttons fadein-6s svelte-fmlket");
    			attr_dev(button4, "onclick", "showSettings()");
    			add_location(button4, file, 178, 4, 7165);
    			attr_dev(div35, "class", "bottombar-left noselect svelte-fmlket");
    			add_location(div35, file, 177, 3, 7123);
    			attr_dev(img11, "class", "profilepicture fadein-6s svelte-fmlket");
    			if (!src_url_equal(img11.src, img11_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966631103211401276/ferret_summer.jpeg")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "User: ");
    			add_location(img11, file, 182, 5, 7372);
    			attr_dev(div36, "class", "profilepicture-container svelte-fmlket");
    			add_location(div36, file, 181, 4, 7328);
    			attr_dev(h49, "class", "username-profile-field svelte-fmlket");
    			add_location(h49, file, 185, 5, 7583);
    			attr_dev(h5, "class", "username-id-field svelte-fmlket");
    			add_location(h5, file, 186, 5, 7635);
    			attr_dev(div37, "class", "profile-info fadein-6s svelte-fmlket");
    			add_location(div37, file, 184, 4, 7541);
    			attr_dev(div38, "class", "bottombar-secondary noselect svelte-fmlket");
    			add_location(div38, file, 180, 3, 7281);
    			attr_dev(div39, "class", "bottombar-main noselect svelte-fmlket");
    			add_location(div39, file, 189, 3, 7700);
    			attr_dev(div40, "class", "bottombar-right noselect svelte-fmlket");
    			add_location(div40, file, 190, 3, 7749);
    			attr_dev(div41, "class", "main-field noselect svelte-fmlket");
    			add_location(div41, file, 140, 3, 4731);
    			attr_dev(body, "onload", "loadingAnimation()");
    			attr_dev(body, "class", "layout fadein-2s svelte-fmlket");
    			add_location(body, file, 40, 1, 601);
    			attr_dev(main, "class", "svelte-fmlket");
    			add_location(main, file, 39, 0, 593);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			append_dev(body, div0);
    			append_dev(body, t0);
    			append_dev(body, div17);
    			append_dev(div17, ul);
    			append_dev(ul, h3);
    			append_dev(ul, t2);
    			append_dev(ul, li0);
    			append_dev(li0, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h40);
    			append_dev(div1, t4);
    			append_dev(div1, h60);
    			append_dev(div1, t6);
    			append_dev(div1, h61);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(li1, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h41);
    			append_dev(div3, t10);
    			append_dev(div3, h62);
    			append_dev(div3, t12);
    			append_dev(div3, h63);
    			append_dev(ul, t14);
    			append_dev(ul, li2);
    			append_dev(li2, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h42);
    			append_dev(div5, t16);
    			append_dev(div5, h64);
    			append_dev(div5, t18);
    			append_dev(div5, h65);
    			append_dev(ul, t20);
    			append_dev(ul, li3);
    			append_dev(li3, div8);
    			append_dev(div8, div7);
    			append_dev(div7, h43);
    			append_dev(div7, t22);
    			append_dev(div7, h66);
    			append_dev(div7, t24);
    			append_dev(div7, h67);
    			append_dev(ul, t26);
    			append_dev(ul, li4);
    			append_dev(li4, div10);
    			append_dev(div10, div9);
    			append_dev(div9, h44);
    			append_dev(div9, t28);
    			append_dev(div9, h68);
    			append_dev(div9, t30);
    			append_dev(div9, h69);
    			append_dev(ul, t32);
    			append_dev(ul, li5);
    			append_dev(li5, div12);
    			append_dev(div12, div11);
    			append_dev(div11, h45);
    			append_dev(div11, t34);
    			append_dev(div11, h610);
    			append_dev(div11, t36);
    			append_dev(div11, h611);
    			append_dev(ul, t38);
    			append_dev(ul, li6);
    			append_dev(li6, div14);
    			append_dev(div14, div13);
    			append_dev(div13, h46);
    			append_dev(div13, t40);
    			append_dev(div13, h612);
    			append_dev(h612, span0);
    			append_dev(h612, t42);
    			append_dev(div13, t43);
    			append_dev(div13, h613);
    			append_dev(ul, t45);
    			append_dev(ul, li7);
    			append_dev(li7, div16);
    			append_dev(div16, div15);
    			append_dev(div15, h47);
    			append_dev(div15, t47);
    			append_dev(div15, h614);
    			append_dev(div15, t49);
    			append_dev(div15, h615);
    			append_dev(body, t51);
    			append_dev(body, div18);
    			append_dev(div18, h616);
    			append_dev(body, t53);
    			append_dev(body, div19);
    			append_dev(body, t54);
    			append_dev(body, div20);
    			append_dev(body, t55);
    			append_dev(body, div22);
    			append_dev(div22, span1);
    			append_dev(span1, img0);
    			append_dev(div22, t56);
    			append_dev(div22, div21);
    			append_dev(div21, span2);
    			append_dev(span2, button0);
    			append_dev(button0, i0);
    			append_dev(div21, t57);
    			append_dev(div21, span3);
    			append_dev(span3, button1);
    			append_dev(button1, i1);
    			append_dev(div21, t58);
    			append_dev(div21, span4);
    			append_dev(span4, button2);
    			append_dev(button2, i2);
    			append_dev(div21, t59);
    			append_dev(div21, span5);
    			append_dev(span5, button3);
    			append_dev(button3, i3);
    			append_dev(body, t60);
    			append_dev(body, div41);
    			append_dev(div41, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div24);
    			append_dev(div24, div23);
    			append_dev(div23, h48);
    			append_dev(div23, t62);
    			append_dev(div23, h1);
    			append_dev(div32, t64);
    			append_dev(div32, div26);
    			append_dev(div26, div25);
    			append_dev(div25, a0);
    			append_dev(a0, img1);
    			append_dev(div25, t65);
    			append_dev(div25, a1);
    			append_dev(a1, img2);
    			append_dev(div32, t66);
    			append_dev(div32, div28);
    			append_dev(div28, div27);
    			append_dev(div27, img3);
    			append_dev(div27, t67);
    			append_dev(div27, img4);
    			append_dev(div27, t68);
    			append_dev(div27, img5);
    			append_dev(div27, t69);
    			append_dev(div27, img6);
    			append_dev(div27, t70);
    			append_dev(div27, img7);
    			append_dev(div27, t71);
    			append_dev(div27, img8);
    			append_dev(div27, t72);
    			append_dev(div27, img9);
    			append_dev(div27, t73);
    			append_dev(div27, img10);
    			append_dev(div32, t74);
    			append_dev(div32, div30);
    			append_dev(div30, div29);
    			append_dev(div32, t75);
    			append_dev(div32, div31);
    			append_dev(div41, t76);
    			append_dev(div41, div34);
    			append_dev(div41, t78);
    			append_dev(div41, div35);
    			append_dev(div35, button4);
    			append_dev(button4, i4);
    			append_dev(div41, t79);
    			append_dev(div41, div38);
    			append_dev(div38, div36);
    			append_dev(div36, img11);
    			append_dev(div38, t80);
    			append_dev(div38, div37);
    			append_dev(div37, h49);
    			append_dev(h49, t81);
    			append_dev(div37, t82);
    			append_dev(div37, h5);
    			append_dev(h5, t83);
    			append_dev(h5, t84);
    			append_dev(div41, t85);
    			append_dev(div41, div39);
    			append_dev(div41, t87);
    			append_dev(div41, div40);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && span1_data_text_value !== (span1_data_text_value = "Hi " + /*name*/ ctx[0] + "!")) {
    				attr_dev(span1, "data-text", span1_data_text_value);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t81, /*name*/ ctx[0]);
    			if (dirty & /*id*/ 2) set_data_dev(t84, /*id*/ ctx[1]);
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
    	var showElement = document.getElementById("layout");
    	showElement.style.display === "none";
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
