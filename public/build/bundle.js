
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
    	let h60;
    	let t2;
    	let div2;
    	let t3;
    	let div3;
    	let t4;
    	let div5;
    	let span0;
    	let img0;
    	let img0_src_value;
    	let span0_data_text_value;
    	let t5;
    	let div4;
    	let span1;
    	let button0;
    	let i0;
    	let t6;
    	let span2;
    	let button1;
    	let i1;
    	let t7;
    	let span3;
    	let button2;
    	let i2;
    	let t8;
    	let span4;
    	let button3;
    	let i3;
    	let t9;
    	let div22;
    	let ul;
    	let h3;
    	let t11;
    	let li0;
    	let div7;
    	let div6;
    	let h40;
    	let t13;
    	let h61;
    	let t15;
    	let h62;
    	let t17;
    	let li1;
    	let div9;
    	let div8;
    	let h41;
    	let t19;
    	let h63;
    	let t21;
    	let h64;
    	let t23;
    	let li2;
    	let div11;
    	let div10;
    	let h42;
    	let t25;
    	let h65;
    	let t27;
    	let h66;
    	let t29;
    	let li3;
    	let div13;
    	let div12;
    	let h43;
    	let t31;
    	let h67;
    	let t33;
    	let h68;
    	let t35;
    	let li4;
    	let div15;
    	let div14;
    	let h44;
    	let t37;
    	let h69;
    	let t39;
    	let h610;
    	let t41;
    	let li5;
    	let div17;
    	let div16;
    	let h45;
    	let t43;
    	let h611;
    	let t45;
    	let h612;
    	let t47;
    	let li6;
    	let div19;
    	let div18;
    	let h46;
    	let t49;
    	let h613;
    	let span5;
    	let t51;
    	let t52;
    	let h614;
    	let t54;
    	let li7;
    	let div21;
    	let div20;
    	let h47;
    	let t56;
    	let h615;
    	let t58;
    	let h616;
    	let t60;
    	let div26;
    	let div25;
    	let div24;
    	let div23;
    	let t61;
    	let div27;
    	let t63;
    	let div28;
    	let button4;
    	let i4;
    	let t64;
    	let div31;
    	let div29;
    	let img1;
    	let img1_src_value;
    	let t65;
    	let div30;
    	let h48;
    	let t66;
    	let t67;
    	let h5;
    	let t68;
    	let t69;
    	let t70;
    	let div32;
    	let t72;
    	let div33;

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h60 = element("h6");
    			h60.textContent = "Vision v.2.4";
    			t2 = space();
    			div2 = element("div");
    			t3 = space();
    			div3 = element("div");
    			t4 = space();
    			div5 = element("div");
    			span0 = element("span");
    			img0 = element("img");
    			t5 = space();
    			div4 = element("div");
    			span1 = element("span");
    			button0 = element("button");
    			i0 = element("i");
    			t6 = space();
    			span2 = element("span");
    			button1 = element("button");
    			i1 = element("i");
    			t7 = space();
    			span3 = element("span");
    			button2 = element("button");
    			i2 = element("i");
    			t8 = space();
    			span4 = element("span");
    			button3 = element("button");
    			i3 = element("i");
    			t9 = space();
    			div22 = element("div");
    			ul = element("ul");
    			h3 = element("h3");
    			h3.textContent = "Incoming Messages";
    			t11 = space();
    			li0 = element("li");
    			div7 = element("div");
    			div6 = element("div");
    			h40 = element("h4");
    			h40.textContent = "franksfan";
    			t13 = space();
    			h61 = element("h6");
    			h61.textContent = "🍌 Nanism";
    			t15 = space();
    			h62 = element("h6");
    			h62.textContent = "➤ How's u doing?";
    			t17 = space();
    			li1 = element("li");
    			div9 = element("div");
    			div8 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Definitely Luna";
    			t19 = space();
    			h63 = element("h6");
    			h63.textContent = "❤️ Love EMERGY DWINKS";
    			t21 = space();
    			h64 = element("h6");
    			h64.textContent = "➤ Goodmorning";
    			t23 = space();
    			li2 = element("li");
    			div11 = element("div");
    			div10 = element("div");
    			h42 = element("h4");
    			h42.textContent = "RosePhoenix";
    			t25 = space();
    			h65 = element("h6");
    			h65.textContent = "Catgirl";
    			t27 = space();
    			h66 = element("h6");
    			h66.textContent = "➤ [Attachment]";
    			t29 = space();
    			li3 = element("li");
    			div13 = element("div");
    			div12 = element("div");
    			h43 = element("h4");
    			h43.textContent = "Raccoonooo";
    			t31 = space();
    			h67 = element("h6");
    			h67.textContent = "😩 we live on lies";
    			t33 = space();
    			h68 = element("h6");
    			h68.textContent = "➤ Kommer du på skolen imorgen?";
    			t35 = space();
    			li4 = element("li");
    			div15 = element("div");
    			div14 = element("div");
    			h44 = element("h4");
    			h44.textContent = "Toro";
    			t37 = space();
    			h69 = element("h6");
    			h69.textContent = "🙄 Based";
    			t39 = space();
    			h610 = element("h6");
    			h610.textContent = "➤ bruker 80 nå";
    			t41 = space();
    			li5 = element("li");
    			div17 = element("div");
    			div16 = element("div");
    			h45 = element("h4");
    			h45.textContent = "Drox";
    			t43 = space();
    			h611 = element("h6");
    			h611.textContent = "💀 Firkant";
    			t45 = space();
    			h612 = element("h6");
    			h612.textContent = "➤ Nattiii natt 💕";
    			t47 = space();
    			li6 = element("li");
    			div19 = element("div");
    			div18 = element("div");
    			h46 = element("h4");
    			h46.textContent = "Marryc";
    			t49 = space();
    			h613 = element("h6");
    			span5 = element("span");
    			span5.textContent = "Playing";
    			t51 = text(" Minecraft");
    			t52 = space();
    			h614 = element("h6");
    			h614.textContent = "➤ Stopp å erp'e! La meg joineee!!";
    			t54 = space();
    			li7 = element("li");
    			div21 = element("div");
    			div20 = element("div");
    			h47 = element("h4");
    			h47.textContent = "Gangstergruppa";
    			t56 = space();
    			h615 = element("h6");
    			h615.textContent = "Luna, Peder, Brage, Tor Oskar...";
    			t58 = space();
    			h616 = element("h6");
    			h616.textContent = "➤ Har vi fri imorgen?";
    			t60 = space();
    			div26 = element("div");
    			div25 = element("div");
    			div24 = element("div");
    			div23 = element("div");
    			t61 = space();
    			div27 = element("div");
    			div27.textContent = "8";
    			t63 = space();
    			div28 = element("div");
    			button4 = element("button");
    			i4 = element("i");
    			t64 = space();
    			div31 = element("div");
    			div29 = element("div");
    			img1 = element("img");
    			t65 = space();
    			div30 = element("div");
    			h48 = element("h4");
    			t66 = text(/*name*/ ctx[0]);
    			t67 = space();
    			h5 = element("h5");
    			t68 = text("#");
    			t69 = text(/*id*/ ctx[1]);
    			t70 = space();
    			div32 = element("div");
    			div32.textContent = "11";
    			t72 = space();
    			div33 = element("div");
    			div33.textContent = "12";
    			attr_dev(div0, "class", "sidebar-top noselect svelte-d79kef");
    			add_location(div0, file, 47, 3, 796);
    			attr_dev(h60, "id", "app-version");
    			attr_dev(h60, "class", "svelte-d79kef");
    			add_location(h60, file, 51, 4, 953);
    			attr_dev(div1, "class", "searchbar noselect svelte-d79kef");
    			add_location(div1, file, 49, 3, 844);
    			attr_dev(div2, "class", "navigation-top noselect svelte-d79kef");
    			add_location(div2, file, 53, 3, 1005);
    			attr_dev(div3, "class", "sidebar-right noselect svelte-d79kef");
    			add_location(div3, file, 55, 3, 1056);
    			attr_dev(img0, "class", "logo svelte-d79kef");
    			if (!src_url_equal(img0.src, img0_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Vision");
    			add_location(img0, file, 58, 59, 1203);
    			attr_dev(span0, "data-text", span0_data_text_value = "Hi " + /*name*/ ctx[0] + "!");
    			attr_dev(span0, "class", "tooltip fadein-2s svelte-d79kef");
    			add_location(span0, file, 58, 4, 1148);
    			attr_dev(i0, "class", "fa fa-home");
    			add_location(i0, file, 61, 99, 1520);
    			attr_dev(button0, "class", "sidebar-buttons fadein-3s svelte-d79kef");
    			add_location(button0, file, 61, 57, 1478);
    			attr_dev(span1, "data-text", "Home");
    			attr_dev(span1, "class", "tooltip-sidebar-home svelte-d79kef");
    			add_location(span1, file, 61, 5, 1426);
    			attr_dev(i1, "class", "fa fa-user");
    			add_location(i1, file, 62, 122, 1685);
    			attr_dev(button1, "class", "sidebar-buttons fadein-4s svelte-d79kef");
    			attr_dev(button1, "onclick", "showAbout()");
    			add_location(button1, file, 62, 58, 1621);
    			attr_dev(span2, "data-text", "About");
    			attr_dev(span2, "class", "tooltip-sidebar-user svelte-d79kef");
    			add_location(span2, file, 62, 5, 1568);
    			attr_dev(i2, "class", "fa fa-book");
    			add_location(i2, file, 63, 128, 1856);
    			attr_dev(button2, "class", "sidebar-buttons fadein-5s svelte-d79kef");
    			attr_dev(button2, "onclick", "showProjects()");
    			add_location(button2, file, 63, 61, 1789);
    			attr_dev(span3, "data-text", "Projects");
    			attr_dev(span3, "class", "tooltip-sidebar-book svelte-d79kef");
    			add_location(span3, file, 63, 5, 1733);
    			attr_dev(i3, "class", "fa fa-laptop");
    			add_location(i3, file, 64, 132, 2031);
    			attr_dev(button3, "class", "sidebar-buttons fadein-6s svelte-d79kef");
    			attr_dev(button3, "onclick", "showDevProc()");
    			add_location(button3, file, 64, 66, 1965);
    			attr_dev(span4, "data-text", "Development");
    			attr_dev(span4, "class", "tooltip-sidebar-laptop svelte-d79kef");
    			add_location(span4, file, 64, 5, 1904);
    			attr_dev(div4, "class", "sidebar svelte-d79kef");
    			add_location(div4, file, 60, 4, 1399);
    			attr_dev(div5, "class", "sidebar-bottom noselect svelte-d79kef");
    			add_location(div5, file, 57, 3, 1106);
    			set_style(h3, "color", "lightgray");
    			set_style(h3, "border-bottom", "solid 0.2vh #3a4f84");
    			set_style(h3, "padding-bottom", "1.5vh");
    			set_style(h3, "width", "80%");
    			set_style(h3, "margin-right", "10%");
    			set_style(h3, "margin-left", "8.5%");
    			add_location(h3, file, 69, 5, 2204);
    			attr_dev(h40, "class", "item-name svelte-d79kef");
    			add_location(h40, file, 73, 8, 2439);
    			attr_dev(h61, "class", "item-name color-grey svelte-d79kef");
    			add_location(h61, file, 74, 8, 2484);
    			attr_dev(h62, "class", "item-message svelte-d79kef");
    			add_location(h62, file, 75, 8, 2540);
    			attr_dev(div6, "class", "item-text svelte-d79kef");
    			add_location(div6, file, 72, 7, 2407);
    			attr_dev(div7, "class", "items svelte-d79kef");
    			add_location(div7, file, 71, 6, 2380);
    			add_location(li0, file, 70, 5, 2369);
    			attr_dev(h41, "class", "item-name svelte-d79kef");
    			add_location(h41, file, 82, 8, 2704);
    			attr_dev(h63, "class", "item-name color-grey svelte-d79kef");
    			add_location(h63, file, 83, 8, 2755);
    			attr_dev(h64, "class", "item-message svelte-d79kef");
    			add_location(h64, file, 84, 8, 2823);
    			attr_dev(div8, "class", "item-text svelte-d79kef");
    			add_location(div8, file, 81, 7, 2672);
    			attr_dev(div9, "class", "items svelte-d79kef");
    			add_location(div9, file, 80, 6, 2645);
    			add_location(li1, file, 79, 5, 2634);
    			attr_dev(h42, "class", "item-name svelte-d79kef");
    			add_location(h42, file, 91, 8, 2985);
    			attr_dev(h65, "class", "item-name color-grey svelte-d79kef");
    			add_location(h65, file, 92, 8, 3032);
    			attr_dev(h66, "class", "item-message svelte-d79kef");
    			add_location(h66, file, 93, 8, 3086);
    			attr_dev(div10, "class", "item-text svelte-d79kef");
    			add_location(div10, file, 90, 7, 2953);
    			attr_dev(div11, "class", "items svelte-d79kef");
    			add_location(div11, file, 89, 6, 2926);
    			add_location(li2, file, 88, 5, 2915);
    			attr_dev(h43, "class", "item-name svelte-d79kef");
    			add_location(h43, file, 100, 8, 3249);
    			attr_dev(h67, "class", "item-name color-grey svelte-d79kef");
    			add_location(h67, file, 101, 8, 3295);
    			attr_dev(h68, "class", "item-message svelte-d79kef");
    			add_location(h68, file, 102, 8, 3360);
    			attr_dev(div12, "class", "item-text svelte-d79kef");
    			add_location(div12, file, 99, 7, 3217);
    			attr_dev(div13, "class", "items svelte-d79kef");
    			add_location(div13, file, 98, 6, 3190);
    			add_location(li3, file, 97, 5, 3179);
    			attr_dev(h44, "class", "item-name svelte-d79kef");
    			add_location(h44, file, 109, 8, 3538);
    			attr_dev(h69, "class", "item-name color-grey svelte-d79kef");
    			add_location(h69, file, 110, 8, 3578);
    			attr_dev(h610, "class", "item-message svelte-d79kef");
    			add_location(h610, file, 111, 8, 3633);
    			attr_dev(div14, "class", "item-text svelte-d79kef");
    			add_location(div14, file, 108, 7, 3506);
    			attr_dev(div15, "class", "items svelte-d79kef");
    			add_location(div15, file, 107, 6, 3479);
    			add_location(li4, file, 106, 5, 3468);
    			attr_dev(h45, "class", "item-name svelte-d79kef");
    			add_location(h45, file, 118, 8, 3795);
    			attr_dev(h611, "class", "item-name color-grey svelte-d79kef");
    			add_location(h611, file, 119, 8, 3835);
    			attr_dev(h612, "class", "item-message svelte-d79kef");
    			add_location(h612, file, 120, 8, 3892);
    			attr_dev(div16, "class", "item-text svelte-d79kef");
    			add_location(div16, file, 117, 7, 3763);
    			attr_dev(div17, "class", "items svelte-d79kef");
    			add_location(div17, file, 116, 6, 3736);
    			add_location(li5, file, 115, 5, 3725);
    			attr_dev(h46, "class", "item-name svelte-d79kef");
    			add_location(h46, file, 127, 8, 4057);
    			set_style(span5, "font-weight", "bold");
    			add_location(span5, file, 128, 41, 4132);
    			attr_dev(h613, "class", "item-name color-grey svelte-d79kef");
    			add_location(h613, file, 128, 8, 4099);
    			attr_dev(h614, "class", "item-message svelte-d79kef");
    			add_location(h614, file, 129, 8, 4202);
    			attr_dev(div18, "class", "item-text svelte-d79kef");
    			add_location(div18, file, 126, 7, 4025);
    			attr_dev(div19, "class", "items svelte-d79kef");
    			add_location(div19, file, 125, 6, 3998);
    			add_location(li6, file, 124, 5, 3987);
    			attr_dev(h47, "class", "item-name svelte-d79kef");
    			add_location(h47, file, 136, 8, 4383);
    			attr_dev(h615, "class", "item-name color-grey svelte-d79kef");
    			add_location(h615, file, 137, 8, 4433);
    			attr_dev(h616, "class", "item-message svelte-d79kef");
    			add_location(h616, file, 138, 8, 4512);
    			attr_dev(div20, "class", "item-text svelte-d79kef");
    			add_location(div20, file, 135, 7, 4351);
    			attr_dev(div21, "class", "items svelte-d79kef");
    			add_location(div21, file, 134, 6, 4324);
    			add_location(li7, file, 133, 5, 4313);
    			attr_dev(ul, "class", "cards fadein-2s svelte-d79kef");
    			add_location(ul, file, 68, 4, 2170);
    			attr_dev(div22, "class", "secondary-field noselect svelte-d79kef");
    			set_style(div22, "overflow-y", "scroll");
    			add_location(div22, file, 67, 3, 2100);
    			attr_dev(div23, "id", "demo");
    			add_location(div23, file, 147, 6, 4740);
    			attr_dev(div24, "class", "main-content");
    			add_location(div24, file, 146, 5, 4707);
    			attr_dev(div25, "class", "main-field-container svelte-d79kef");
    			add_location(div25, file, 145, 4, 4667);
    			attr_dev(div26, "class", "main-field noselect svelte-d79kef");
    			add_location(div26, file, 144, 3, 4629);
    			attr_dev(div27, "class", "sidebar-right-bottom noselect svelte-d79kef");
    			add_location(div27, file, 151, 3, 4798);
    			attr_dev(i4, "class", "fa fa-gear");
    			add_location(i4, file, 153, 71, 4961);
    			attr_dev(button4, "class", "sidebar-buttons fadein-6s svelte-d79kef");
    			attr_dev(button4, "onclick", "showSettings()");
    			add_location(button4, file, 153, 4, 4894);
    			attr_dev(div28, "class", "bottombar-left noselect svelte-d79kef");
    			add_location(div28, file, 152, 3, 4852);
    			attr_dev(img1, "class", "profilepicture fadein-6s svelte-d79kef");
    			if (!src_url_equal(img1.src, img1_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966631103211401276/ferret_summer.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "User: ");
    			add_location(img1, file, 157, 5, 5101);
    			attr_dev(div29, "class", "profilepicture-container svelte-d79kef");
    			add_location(div29, file, 156, 4, 5057);
    			attr_dev(h48, "class", "username-profile-field svelte-d79kef");
    			add_location(h48, file, 160, 5, 5312);
    			attr_dev(h5, "class", "username-id-field svelte-d79kef");
    			add_location(h5, file, 161, 5, 5364);
    			attr_dev(div30, "class", "profile-info fadein-6s svelte-d79kef");
    			add_location(div30, file, 159, 4, 5270);
    			attr_dev(div31, "class", "bottombar-secondary noselect svelte-d79kef");
    			add_location(div31, file, 155, 3, 5010);
    			attr_dev(div32, "class", "bottombar-main noselect svelte-d79kef");
    			add_location(div32, file, 164, 3, 5429);
    			attr_dev(div33, "class", "bottombar-right noselect svelte-d79kef");
    			add_location(div33, file, 165, 3, 5478);
    			attr_dev(body, "onload", "startTime()");
    			attr_dev(body, "class", "layout fadein-2s svelte-d79kef");
    			add_location(body, file, 45, 1, 713);
    			attr_dev(main, "class", "svelte-d79kef");
    			add_location(main, file, 44, 0, 705);
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
    			append_dev(div1, h60);
    			append_dev(body, t2);
    			append_dev(body, div2);
    			append_dev(body, t3);
    			append_dev(body, div3);
    			append_dev(body, t4);
    			append_dev(body, div5);
    			append_dev(div5, span0);
    			append_dev(span0, img0);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, span1);
    			append_dev(span1, button0);
    			append_dev(button0, i0);
    			append_dev(div4, t6);
    			append_dev(div4, span2);
    			append_dev(span2, button1);
    			append_dev(button1, i1);
    			append_dev(div4, t7);
    			append_dev(div4, span3);
    			append_dev(span3, button2);
    			append_dev(button2, i2);
    			append_dev(div4, t8);
    			append_dev(div4, span4);
    			append_dev(span4, button3);
    			append_dev(button3, i3);
    			append_dev(body, t9);
    			append_dev(body, div22);
    			append_dev(div22, ul);
    			append_dev(ul, h3);
    			append_dev(ul, t11);
    			append_dev(ul, li0);
    			append_dev(li0, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h40);
    			append_dev(div6, t13);
    			append_dev(div6, h61);
    			append_dev(div6, t15);
    			append_dev(div6, h62);
    			append_dev(ul, t17);
    			append_dev(ul, li1);
    			append_dev(li1, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h41);
    			append_dev(div8, t19);
    			append_dev(div8, h63);
    			append_dev(div8, t21);
    			append_dev(div8, h64);
    			append_dev(ul, t23);
    			append_dev(ul, li2);
    			append_dev(li2, div11);
    			append_dev(div11, div10);
    			append_dev(div10, h42);
    			append_dev(div10, t25);
    			append_dev(div10, h65);
    			append_dev(div10, t27);
    			append_dev(div10, h66);
    			append_dev(ul, t29);
    			append_dev(ul, li3);
    			append_dev(li3, div13);
    			append_dev(div13, div12);
    			append_dev(div12, h43);
    			append_dev(div12, t31);
    			append_dev(div12, h67);
    			append_dev(div12, t33);
    			append_dev(div12, h68);
    			append_dev(ul, t35);
    			append_dev(ul, li4);
    			append_dev(li4, div15);
    			append_dev(div15, div14);
    			append_dev(div14, h44);
    			append_dev(div14, t37);
    			append_dev(div14, h69);
    			append_dev(div14, t39);
    			append_dev(div14, h610);
    			append_dev(ul, t41);
    			append_dev(ul, li5);
    			append_dev(li5, div17);
    			append_dev(div17, div16);
    			append_dev(div16, h45);
    			append_dev(div16, t43);
    			append_dev(div16, h611);
    			append_dev(div16, t45);
    			append_dev(div16, h612);
    			append_dev(ul, t47);
    			append_dev(ul, li6);
    			append_dev(li6, div19);
    			append_dev(div19, div18);
    			append_dev(div18, h46);
    			append_dev(div18, t49);
    			append_dev(div18, h613);
    			append_dev(h613, span5);
    			append_dev(h613, t51);
    			append_dev(div18, t52);
    			append_dev(div18, h614);
    			append_dev(ul, t54);
    			append_dev(ul, li7);
    			append_dev(li7, div21);
    			append_dev(div21, div20);
    			append_dev(div20, h47);
    			append_dev(div20, t56);
    			append_dev(div20, h615);
    			append_dev(div20, t58);
    			append_dev(div20, h616);
    			append_dev(body, t60);
    			append_dev(body, div26);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div23);
    			append_dev(body, t61);
    			append_dev(body, div27);
    			append_dev(body, t63);
    			append_dev(body, div28);
    			append_dev(div28, button4);
    			append_dev(button4, i4);
    			append_dev(body, t64);
    			append_dev(body, div31);
    			append_dev(div31, div29);
    			append_dev(div29, img1);
    			append_dev(div31, t65);
    			append_dev(div31, div30);
    			append_dev(div30, h48);
    			append_dev(h48, t66);
    			append_dev(div30, t67);
    			append_dev(div30, h5);
    			append_dev(h5, t68);
    			append_dev(h5, t69);
    			append_dev(body, t70);
    			append_dev(body, div32);
    			append_dev(body, t72);
    			append_dev(body, div33);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && span0_data_text_value !== (span0_data_text_value = "Hi " + /*name*/ ctx[0] + "!")) {
    				attr_dev(span0, "data-text", span0_data_text_value);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t66, /*name*/ ctx[0]);
    			if (dirty & /*id*/ 2) set_data_dev(t69, /*id*/ ctx[1]);
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

    	window.addEventListener("load", () => {
    		fetch("v-database.php", { method: "POST" }).then(res => res.text()).then(txt => {
    			document.getElementById("demo").innerHTML = txt;
    		});
    	});

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
