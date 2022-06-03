
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    const { console: console_1 } = globals;
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
    	let div46;
    	let div38;
    	let div37;
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
    	let a2;
    	let img3;
    	let img3_src_value;
    	let t67;
    	let a3;
    	let img4;
    	let img4_src_value;
    	let t68;
    	let a4;
    	let img5;
    	let img5_src_value;
    	let t69;
    	let div28;
    	let div27;
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
    	let img11;
    	let img11_src_value;
    	let t75;
    	let img12;
    	let img12_src_value;
    	let t76;
    	let img13;
    	let img13_src_value;
    	let t77;
    	let div34;
    	let div33;
    	let h2;
    	let t79;
    	let div29;
    	let h49;
    	let t80;
    	let span6;
    	let t82;
    	let t83;
    	let h617;
    	let t84;
    	let span7;
    	let t86;
    	let t87;
    	let div30;
    	let h410;
    	let t89;
    	let h618;
    	let t91;
    	let div31;
    	let h411;
    	let t93;
    	let h619;
    	let t95;
    	let div32;
    	let h412;
    	let t97;
    	let h620;
    	let t99;
    	let div36;
    	let div35;
    	let t100;
    	let div39;
    	let t102;
    	let div40;
    	let button4;
    	let i4;
    	let t103;
    	let div43;
    	let div41;
    	let img14;
    	let img14_src_value;
    	let t104;
    	let div42;
    	let h413;
    	let t105;
    	let t106;
    	let h5;
    	let t107;
    	let t108;
    	let t109;
    	let div44;
    	let t111;
    	let div45;

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
    			div46 = element("div");
    			div38 = element("div");
    			div37 = element("div");
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
    			a2 = element("a");
    			img3 = element("img");
    			t67 = space();
    			a3 = element("a");
    			img4 = element("img");
    			t68 = space();
    			a4 = element("a");
    			img5 = element("img");
    			t69 = space();
    			div28 = element("div");
    			div27 = element("div");
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
    			img11 = element("img");
    			t75 = space();
    			img12 = element("img");
    			t76 = space();
    			img13 = element("img");
    			t77 = space();
    			div34 = element("div");
    			div33 = element("div");
    			h2 = element("h2");
    			h2.textContent = "NEWS";
    			t79 = space();
    			div29 = element("div");
    			h49 = element("h4");
    			t80 = text("Vision ");
    			span6 = element("span");
    			span6.textContent = "v2";
    			t82 = text(" Is Finally Out!");
    			t83 = space();
    			h617 = element("h6");
    			t84 = text("~ ");
    			span7 = element("span");
    			span7.textContent = "V2";
    			t86 = text(" Was launched on march 26th and has since set the new design profile for the app");
    			t87 = space();
    			div30 = element("div");
    			h410 = element("h4");
    			h410.textContent = "Routify Was Removed";
    			t89 = space();
    			h618 = element("h6");
    			h618.textContent = "~ Because of incompatibilty, Routify had to be removed. Routing is now SPA-based";
    			t91 = space();
    			div31 = element("div");
    			h411 = element("h4");
    			h411.textContent = "Crashes From Slots Minigame Fixed!";
    			t93 = space();
    			h619 = element("h6");
    			h619.textContent = "~ A known issue with the Casino Slots was fixes. It was due to a exception error";
    			t95 = space();
    			div32 = element("div");
    			h412 = element("h4");
    			h412.textContent = "First Test Build Failed";
    			t97 = space();
    			h620 = element("h6");
    			h620.textContent = "~ Unfortunately the first test-build of the application failed. I will be looking into this further when the app is ready for packaging";
    			t99 = space();
    			div36 = element("div");
    			div35 = element("div");
    			t100 = space();
    			div39 = element("div");
    			div39.textContent = "8";
    			t102 = space();
    			div40 = element("div");
    			button4 = element("button");
    			i4 = element("i");
    			t103 = space();
    			div43 = element("div");
    			div41 = element("div");
    			img14 = element("img");
    			t104 = space();
    			div42 = element("div");
    			h413 = element("h4");
    			t105 = text(/*name*/ ctx[0]);
    			t106 = space();
    			h5 = element("h5");
    			t107 = text("#");
    			t108 = text(/*id*/ ctx[1]);
    			t109 = space();
    			div44 = element("div");
    			div44.textContent = "11";
    			t111 = space();
    			div45 = element("div");
    			div45.textContent = "12";
    			attr_dev(div0, "class", "sidebar-top noselect svelte-1sawtgv");
    			add_location(div0, file, 13, 3, 448);
    			attr_dev(h3, "id", "incoming-header");
    			attr_dev(h3, "class", "svelte-1sawtgv");
    			add_location(h3, file, 17, 5, 600);
    			attr_dev(h40, "class", "item-name svelte-1sawtgv");
    			add_location(h40, file, 21, 8, 723);
    			attr_dev(h60, "class", "item-name color-grey svelte-1sawtgv");
    			add_location(h60, file, 22, 8, 768);
    			attr_dev(h61, "class", "item-message svelte-1sawtgv");
    			add_location(h61, file, 23, 8, 824);
    			attr_dev(div1, "class", "item-text svelte-1sawtgv");
    			add_location(div1, file, 20, 7, 691);
    			attr_dev(div2, "class", "items svelte-1sawtgv");
    			add_location(div2, file, 19, 6, 664);
    			add_location(li0, file, 18, 5, 653);
    			attr_dev(h41, "class", "item-name svelte-1sawtgv");
    			add_location(h41, file, 30, 8, 988);
    			attr_dev(h62, "class", "item-name color-grey svelte-1sawtgv");
    			add_location(h62, file, 31, 8, 1039);
    			attr_dev(h63, "class", "item-message svelte-1sawtgv");
    			add_location(h63, file, 32, 8, 1107);
    			attr_dev(div3, "class", "item-text svelte-1sawtgv");
    			add_location(div3, file, 29, 7, 956);
    			attr_dev(div4, "class", "items svelte-1sawtgv");
    			add_location(div4, file, 28, 6, 929);
    			add_location(li1, file, 27, 5, 918);
    			attr_dev(h42, "class", "item-name svelte-1sawtgv");
    			add_location(h42, file, 39, 8, 1269);
    			attr_dev(h64, "class", "item-name color-grey svelte-1sawtgv");
    			add_location(h64, file, 40, 8, 1316);
    			attr_dev(h65, "class", "item-message svelte-1sawtgv");
    			add_location(h65, file, 41, 8, 1370);
    			attr_dev(div5, "class", "item-text svelte-1sawtgv");
    			add_location(div5, file, 38, 7, 1237);
    			attr_dev(div6, "class", "items svelte-1sawtgv");
    			add_location(div6, file, 37, 6, 1210);
    			add_location(li2, file, 36, 5, 1199);
    			attr_dev(h43, "class", "item-name svelte-1sawtgv");
    			add_location(h43, file, 48, 8, 1533);
    			attr_dev(h66, "class", "item-name color-grey svelte-1sawtgv");
    			add_location(h66, file, 49, 8, 1579);
    			attr_dev(h67, "class", "item-message svelte-1sawtgv");
    			add_location(h67, file, 50, 8, 1644);
    			attr_dev(div7, "class", "item-text svelte-1sawtgv");
    			add_location(div7, file, 47, 7, 1501);
    			attr_dev(div8, "class", "items svelte-1sawtgv");
    			add_location(div8, file, 46, 6, 1474);
    			add_location(li3, file, 45, 5, 1463);
    			attr_dev(h44, "class", "item-name svelte-1sawtgv");
    			add_location(h44, file, 57, 8, 1822);
    			attr_dev(h68, "class", "item-name color-grey svelte-1sawtgv");
    			add_location(h68, file, 58, 8, 1862);
    			attr_dev(h69, "class", "item-message svelte-1sawtgv");
    			add_location(h69, file, 59, 8, 1917);
    			attr_dev(div9, "class", "item-text svelte-1sawtgv");
    			add_location(div9, file, 56, 7, 1790);
    			attr_dev(div10, "class", "items svelte-1sawtgv");
    			add_location(div10, file, 55, 6, 1763);
    			add_location(li4, file, 54, 5, 1752);
    			attr_dev(h45, "class", "item-name svelte-1sawtgv");
    			add_location(h45, file, 66, 8, 2079);
    			attr_dev(h610, "class", "item-name color-grey svelte-1sawtgv");
    			add_location(h610, file, 67, 8, 2119);
    			attr_dev(h611, "class", "item-message svelte-1sawtgv");
    			add_location(h611, file, 68, 8, 2176);
    			attr_dev(div11, "class", "item-text svelte-1sawtgv");
    			add_location(div11, file, 65, 7, 2047);
    			attr_dev(div12, "class", "items svelte-1sawtgv");
    			add_location(div12, file, 64, 6, 2020);
    			add_location(li5, file, 63, 5, 2009);
    			attr_dev(h46, "class", "item-name svelte-1sawtgv");
    			add_location(h46, file, 75, 8, 2341);
    			set_style(span0, "font-weight", "bold");
    			add_location(span0, file, 76, 41, 2416);
    			attr_dev(h612, "class", "item-name color-grey svelte-1sawtgv");
    			add_location(h612, file, 76, 8, 2383);
    			attr_dev(h613, "class", "item-message svelte-1sawtgv");
    			add_location(h613, file, 77, 8, 2486);
    			attr_dev(div13, "class", "item-text svelte-1sawtgv");
    			add_location(div13, file, 74, 7, 2309);
    			attr_dev(div14, "class", "items svelte-1sawtgv");
    			add_location(div14, file, 73, 6, 2282);
    			add_location(li6, file, 72, 5, 2271);
    			attr_dev(h47, "class", "item-name svelte-1sawtgv");
    			add_location(h47, file, 84, 8, 2667);
    			attr_dev(h614, "class", "item-name color-grey svelte-1sawtgv");
    			add_location(h614, file, 85, 8, 2717);
    			attr_dev(h615, "class", "item-message svelte-1sawtgv");
    			add_location(h615, file, 86, 8, 2796);
    			attr_dev(div15, "class", "item-text svelte-1sawtgv");
    			add_location(div15, file, 83, 7, 2635);
    			attr_dev(div16, "class", "items svelte-1sawtgv");
    			add_location(div16, file, 82, 6, 2608);
    			add_location(li7, file, 81, 5, 2597);
    			attr_dev(ul, "class", "cards fadein-2s svelte-1sawtgv");
    			set_style(ul, "overflow-y", "scroll");
    			add_location(ul, file, 16, 4, 539);
    			attr_dev(div17, "class", "secondary-field noselect svelte-1sawtgv");
    			add_location(div17, file, 15, 3, 496);
    			attr_dev(h616, "id", "app-version");
    			attr_dev(h616, "class", "svelte-1sawtgv");
    			add_location(h616, file, 94, 4, 3022);
    			attr_dev(div18, "class", "searchbar noselect svelte-1sawtgv");
    			add_location(div18, file, 92, 3, 2913);
    			attr_dev(div19, "class", "navigation-top noselect svelte-1sawtgv");
    			add_location(div19, file, 96, 3, 3074);
    			attr_dev(div20, "class", "sidebar-right noselect svelte-1sawtgv");
    			add_location(div20, file, 98, 3, 3125);
    			attr_dev(img0, "class", "logo svelte-1sawtgv");
    			if (!src_url_equal(img0.src, img0_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966421281111150612/logo_white.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Vision");
    			add_location(img0, file, 101, 59, 3272);
    			attr_dev(span1, "data-text", span1_data_text_value = "Hi " + /*name*/ ctx[0] + "!");
    			attr_dev(span1, "class", "tooltip fadein-2s svelte-1sawtgv");
    			add_location(span1, file, 101, 4, 3217);
    			attr_dev(i0, "class", "fa fa-home");
    			add_location(i0, file, 104, 109, 3599);
    			attr_dev(button0, "id", "home");
    			attr_dev(button0, "class", "sidebar-buttons fadein-3s svelte-1sawtgv");
    			add_location(button0, file, 104, 57, 3547);
    			attr_dev(span2, "data-text", "Home");
    			attr_dev(span2, "class", "tooltip-sidebar-home svelte-1sawtgv");
    			add_location(span2, file, 104, 5, 3495);
    			attr_dev(i1, "class", "fa fa-user");
    			add_location(i1, file, 105, 100, 3742);
    			attr_dev(button1, "class", "sidebar-buttons fadein-4s svelte-1sawtgv");
    			add_location(button1, file, 105, 58, 3700);
    			attr_dev(span3, "data-text", "About");
    			attr_dev(span3, "class", "tooltip-sidebar-user svelte-1sawtgv");
    			add_location(span3, file, 105, 5, 3647);
    			attr_dev(i2, "class", "fa fa-book");
    			add_location(i2, file, 106, 128, 3913);
    			attr_dev(button2, "class", "sidebar-buttons fadein-5s svelte-1sawtgv");
    			attr_dev(button2, "onclick", "showProjects()");
    			add_location(button2, file, 106, 61, 3846);
    			attr_dev(span4, "data-text", "Projects");
    			attr_dev(span4, "class", "tooltip-sidebar-book svelte-1sawtgv");
    			add_location(span4, file, 106, 5, 3790);
    			attr_dev(i3, "class", "fa fa-laptop");
    			add_location(i3, file, 107, 132, 4088);
    			attr_dev(button3, "class", "sidebar-buttons fadein-6s svelte-1sawtgv");
    			attr_dev(button3, "onclick", "showDevProc()");
    			add_location(button3, file, 107, 66, 4022);
    			attr_dev(span5, "data-text", "Development");
    			attr_dev(span5, "class", "tooltip-sidebar-laptop svelte-1sawtgv");
    			add_location(span5, file, 107, 5, 3961);
    			attr_dev(div21, "class", "sidebar svelte-1sawtgv");
    			add_location(div21, file, 103, 4, 3468);
    			attr_dev(div22, "class", "sidebar-bottom noselect svelte-1sawtgv");
    			add_location(div22, file, 100, 3, 3175);
    			attr_dev(h48, "id", "fullstack-title");
    			attr_dev(h48, "class", "svelte-1sawtgv");
    			add_location(h48, file, 115, 8, 4353);
    			attr_dev(h1, "id", "name-title");
    			attr_dev(h1, "class", "svelte-1sawtgv");
    			add_location(h1, file, 116, 8, 4405);
    			attr_dev(div23, "class", "main-top-left-text svelte-1sawtgv");
    			add_location(div23, file, 114, 7, 4312);
    			attr_dev(div24, "class", "main-top-left main-box svelte-1sawtgv");
    			add_location(div24, file, 113, 6, 4268);
    			if (!src_url_equal(img1.src, img1_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982030723550707762/git.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "GIT");
    			attr_dev(img1, "class", "social-icon svelte-1sawtgv");
    			set_style(img1, "height", "5vh");
    			set_style(img1, "float", "center");
    			set_style(img1, "margin-left", ".3vh");
    			add_location(img1, file, 121, 48, 4738);
    			attr_dev(a0, "href", "https://github.com/LunaMellow");
    			add_location(a0, file, 121, 8, 4698);
    			if (!src_url_equal(img2.src, img2_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982220695176106014/repl.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "REPL");
    			attr_dev(img2, "class", "social-icon social-icon-gap svelte-1sawtgv");
    			set_style(img2, "height", "5vh");
    			set_style(img2, "float", "center");
    			add_location(img2, file, 122, 49, 4973);
    			attr_dev(a1, "href", "https://replit.com/@LunaMellow");
    			add_location(a1, file, 122, 8, 4932);
    			if (!src_url_equal(img3.src, img3_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982221051289280542/Daco_5303498.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "TTV");
    			attr_dev(img3, "class", "social-icon social-icon-gap svelte-1sawtgv");
    			set_style(img3, "height", "4.8vh");
    			set_style(img3, "float", "center");
    			add_location(img3, file, 123, 51, 5209);
    			attr_dev(a2, "href", "https://www.twitch.tv/lunamellow");
    			add_location(a2, file, 123, 8, 5166);
    			if (!src_url_equal(img4.src, img4_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982222114788618320/insta.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "INSTA");
    			attr_dev(img4, "class", "social-icon social-icon-gap svelte-1sawtgv");
    			set_style(img4, "height", "5vh");
    			set_style(img4, "float", "center");
    			add_location(img4, file, 124, 57, 5460);
    			attr_dev(a3, "href", "https://www.instagram.com/explorevoid/");
    			add_location(a3, file, 124, 8, 5411);
    			if (!src_url_equal(img5.src, img5_src_value = "https://media.discordapp.net/attachments/640641733151162388/982225280569602058/twitter.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "TWT");
    			attr_dev(img5, "class", "social-icon social-icon-gap svelte-1sawtgv");
    			set_style(img5, "height", "5vh");
    			set_style(img5, "float", "center");
    			add_location(img5, file, 125, 51, 5698);
    			attr_dev(a4, "href", "https://twitter.com/Lunamellower");
    			add_location(a4, file, 125, 8, 5655);
    			attr_dev(div25, "class", "socials svelte-1sawtgv");
    			add_location(div25, file, 120, 7, 4668);
    			attr_dev(div26, "class", "main-top-right main-box svelte-1sawtgv");
    			add_location(div26, file, 119, 6, 4480);
    			attr_dev(img6, "class", "slideshow svelte-1sawtgv");
    			if (!src_url_equal(img6.src, img6_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049506206040084/1.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "s");
    			add_location(img6, file, 130, 8, 5997);
    			attr_dev(img7, "class", "slideshow svelte-1sawtgv");
    			if (!src_url_equal(img7.src, img7_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049506633863198/2.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "s");
    			add_location(img7, file, 131, 8, 6126);
    			attr_dev(img8, "class", "slideshow svelte-1sawtgv");
    			if (!src_url_equal(img8.src, img8_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049507191713804/3.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "s");
    			add_location(img8, file, 132, 8, 6255);
    			attr_dev(img9, "class", "slideshow svelte-1sawtgv");
    			if (!src_url_equal(img9.src, img9_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049507623706654/4.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "s");
    			add_location(img9, file, 133, 8, 6384);
    			attr_dev(img10, "class", "slideshow svelte-1sawtgv");
    			if (!src_url_equal(img10.src, img10_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049507921506304/5.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "s");
    			add_location(img10, file, 134, 8, 6513);
    			attr_dev(img11, "class", "slideshow svelte-1sawtgv");
    			if (!src_url_equal(img11.src, img11_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982049508168982538/6.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "s");
    			add_location(img11, file, 135, 8, 6642);
    			attr_dev(img12, "class", "slideshow svelte-1sawtgv");
    			if (!src_url_equal(img12.src, img12_src_value = "https://media.discordapp.net/attachments/640641733151162388/982050416458076210/7.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "s");
    			add_location(img12, file, 136, 8, 6771);
    			attr_dev(img13, "class", "slideshow svelte-1sawtgv");
    			if (!src_url_equal(img13.src, img13_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/982050416667811840/8.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "s");
    			add_location(img13, file, 137, 8, 6902);
    			attr_dev(div27, "class", "wrapper svelte-1sawtgv");
    			add_location(div27, file, 129, 7, 5967);
    			attr_dev(div28, "class", "main-middle-left main-box svelte-1sawtgv");
    			add_location(div28, file, 128, 6, 5920);
    			attr_dev(h2, "id", "news-header");
    			attr_dev(h2, "class", "svelte-1sawtgv");
    			add_location(h2, file, 142, 8, 7133);
    			attr_dev(span6, "class", "gradient svelte-1sawtgv");
    			add_location(span6, file, 144, 45, 7240);
    			attr_dev(h49, "class", "news-under-title svelte-1sawtgv");
    			add_location(h49, file, 144, 9, 7204);
    			attr_dev(span7, "class", "gradient svelte-1sawtgv");
    			add_location(span7, file, 145, 46, 7340);
    			attr_dev(h617, "class", "news-under-description svelte-1sawtgv");
    			add_location(h617, file, 145, 9, 7303);
    			attr_dev(div29, "class", "articles svelte-1sawtgv");
    			add_location(div29, file, 143, 8, 7172);
    			attr_dev(h410, "class", "news-under-title svelte-1sawtgv");
    			add_location(h410, file, 148, 9, 7513);
    			attr_dev(h618, "class", "news-under-description svelte-1sawtgv");
    			add_location(h618, file, 149, 9, 7576);
    			attr_dev(div30, "class", "articles svelte-1sawtgv");
    			add_location(div30, file, 147, 8, 7481);
    			attr_dev(h411, "class", "news-under-title svelte-1sawtgv");
    			add_location(h411, file, 152, 9, 7752);
    			attr_dev(h619, "class", "news-under-description svelte-1sawtgv");
    			add_location(h619, file, 153, 9, 7830);
    			attr_dev(div31, "class", "articles svelte-1sawtgv");
    			add_location(div31, file, 151, 8, 7720);
    			attr_dev(h412, "class", "news-under-title svelte-1sawtgv");
    			add_location(h412, file, 156, 9, 8006);
    			attr_dev(h620, "class", "news-under-description svelte-1sawtgv");
    			set_style(h620, "margin-bottom", "1vh");
    			add_location(h620, file, 157, 9, 8073);
    			attr_dev(div32, "class", "articles svelte-1sawtgv");
    			add_location(div32, file, 155, 8, 7974);
    			attr_dev(div33, "class", "news svelte-1sawtgv");
    			add_location(div33, file, 141, 7, 7106);
    			attr_dev(div34, "class", "main-middle-right main-box svelte-1sawtgv");
    			add_location(div34, file, 140, 6, 7058);
    			attr_dev(div35, "class", "main-bottom-bar svelte-1sawtgv");
    			add_location(div35, file, 162, 6, 8366);
    			attr_dev(div36, "class", "main-bottom main-box svelte-1sawtgv");
    			add_location(div36, file, 161, 6, 8325);
    			attr_dev(div37, "class", "main-content svelte-1sawtgv");
    			add_location(div37, file, 112, 5, 4235);
    			attr_dev(div38, "class", "main-field-container svelte-1sawtgv");
    			add_location(div38, file, 111, 4, 4195);
    			attr_dev(div39, "class", "sidebar-right-bottom noselect svelte-1sawtgv");
    			add_location(div39, file, 167, 3, 8445);
    			attr_dev(i4, "class", "fa fa-gear");
    			add_location(i4, file, 169, 71, 8608);
    			attr_dev(button4, "class", "sidebar-buttons fadein-6s svelte-1sawtgv");
    			attr_dev(button4, "onclick", "showSettings()");
    			add_location(button4, file, 169, 4, 8541);
    			attr_dev(div40, "class", "bottombar-left noselect svelte-1sawtgv");
    			add_location(div40, file, 168, 3, 8499);
    			attr_dev(img14, "class", "profilepicture fadein-6s svelte-1sawtgv");
    			if (!src_url_equal(img14.src, img14_src_value = "https://cdn.discordapp.com/attachments/640641733151162388/966631103211401276/ferret_summer.jpeg")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "alt", "User: ");
    			add_location(img14, file, 173, 5, 8748);
    			attr_dev(div41, "class", "profilepicture-container svelte-1sawtgv");
    			add_location(div41, file, 172, 4, 8704);
    			attr_dev(h413, "class", "username-profile-field svelte-1sawtgv");
    			add_location(h413, file, 176, 5, 8959);
    			attr_dev(h5, "class", "username-id-field svelte-1sawtgv");
    			add_location(h5, file, 177, 5, 9011);
    			attr_dev(div42, "class", "profile-info fadein-6s svelte-1sawtgv");
    			add_location(div42, file, 175, 4, 8917);
    			attr_dev(div43, "class", "bottombar-secondary noselect svelte-1sawtgv");
    			add_location(div43, file, 171, 3, 8657);
    			attr_dev(div44, "class", "bottombar-main noselect svelte-1sawtgv");
    			add_location(div44, file, 180, 3, 9076);
    			attr_dev(div45, "class", "bottombar-right noselect svelte-1sawtgv");
    			add_location(div45, file, 181, 3, 9125);
    			attr_dev(div46, "class", "main-field noselect svelte-1sawtgv");
    			add_location(div46, file, 110, 3, 4157);
    			attr_dev(body, "onload", "loadingAnimation()");
    			attr_dev(body, "class", "layout fadein-2s svelte-1sawtgv");
    			add_location(body, file, 10, 1, 151);
    			attr_dev(main, "class", "svelte-1sawtgv");
    			add_location(main, file, 9, 0, 143);
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
    			append_dev(body, div46);
    			append_dev(div46, div38);
    			append_dev(div38, div37);
    			append_dev(div37, div24);
    			append_dev(div24, div23);
    			append_dev(div23, h48);
    			append_dev(div23, t62);
    			append_dev(div23, h1);
    			append_dev(div37, t64);
    			append_dev(div37, div26);
    			append_dev(div26, div25);
    			append_dev(div25, a0);
    			append_dev(a0, img1);
    			append_dev(div25, t65);
    			append_dev(div25, a1);
    			append_dev(a1, img2);
    			append_dev(div25, t66);
    			append_dev(div25, a2);
    			append_dev(a2, img3);
    			append_dev(div25, t67);
    			append_dev(div25, a3);
    			append_dev(a3, img4);
    			append_dev(div25, t68);
    			append_dev(div25, a4);
    			append_dev(a4, img5);
    			append_dev(div37, t69);
    			append_dev(div37, div28);
    			append_dev(div28, div27);
    			append_dev(div27, img6);
    			append_dev(div27, t70);
    			append_dev(div27, img7);
    			append_dev(div27, t71);
    			append_dev(div27, img8);
    			append_dev(div27, t72);
    			append_dev(div27, img9);
    			append_dev(div27, t73);
    			append_dev(div27, img10);
    			append_dev(div27, t74);
    			append_dev(div27, img11);
    			append_dev(div27, t75);
    			append_dev(div27, img12);
    			append_dev(div27, t76);
    			append_dev(div27, img13);
    			append_dev(div37, t77);
    			append_dev(div37, div34);
    			append_dev(div34, div33);
    			append_dev(div33, h2);
    			append_dev(div33, t79);
    			append_dev(div33, div29);
    			append_dev(div29, h49);
    			append_dev(h49, t80);
    			append_dev(h49, span6);
    			append_dev(h49, t82);
    			append_dev(div29, t83);
    			append_dev(div29, h617);
    			append_dev(h617, t84);
    			append_dev(h617, span7);
    			append_dev(h617, t86);
    			append_dev(div33, t87);
    			append_dev(div33, div30);
    			append_dev(div30, h410);
    			append_dev(div30, t89);
    			append_dev(div30, h618);
    			append_dev(div33, t91);
    			append_dev(div33, div31);
    			append_dev(div31, h411);
    			append_dev(div31, t93);
    			append_dev(div31, h619);
    			append_dev(div33, t95);
    			append_dev(div33, div32);
    			append_dev(div32, h412);
    			append_dev(div32, t97);
    			append_dev(div32, h620);
    			append_dev(div37, t99);
    			append_dev(div37, div36);
    			append_dev(div36, div35);
    			append_dev(div46, t100);
    			append_dev(div46, div39);
    			append_dev(div46, t102);
    			append_dev(div46, div40);
    			append_dev(div40, button4);
    			append_dev(button4, i4);
    			append_dev(div46, t103);
    			append_dev(div46, div43);
    			append_dev(div43, div41);
    			append_dev(div41, img14);
    			append_dev(div43, t104);
    			append_dev(div43, div42);
    			append_dev(div42, h413);
    			append_dev(h413, t105);
    			append_dev(div42, t106);
    			append_dev(div42, h5);
    			append_dev(h5, t107);
    			append_dev(h5, t108);
    			append_dev(div46, t109);
    			append_dev(div46, div44);
    			append_dev(div46, t111);
    			append_dev(div46, div45);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && span1_data_text_value !== (span1_data_text_value = "Hi " + /*name*/ ctx[0] + "!")) {
    				attr_dev(span1, "data-text", span1_data_text_value);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t105, /*name*/ ctx[0]);
    			if (dirty & /*id*/ 2) set_data_dev(t108, /*id*/ ctx[1]);
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

    function doesThisWork() {
    	console.log("Hey, mainfile actually works!");
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name } = $$props;
    	let { id } = $$props;
    	const writable_props = ['name', 'id'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ name, id, doesThisWork });

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
    			console_1.warn("<App> was created without expected prop 'name'");
    		}

    		if (/*id*/ ctx[1] === undefined && !('id' in props)) {
    			console_1.warn("<App> was created without expected prop 'id'");
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
