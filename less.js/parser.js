var less = exports || {};
var node= require("./node")
var input,       // LeSS input string
    i = 0,       // current index in `input`
    j = 0,       // current chunk
    chunks = [], // chunkified input
    current = 0, // index of current chunk, in `input`
    inputLength;

function peek(regex) {
    var match;
    regex.lastIndex = i;

    if ((match = regex.exec(input)) &&
        (regex.lastIndex - match[0].length === i)) {
        return match;
    }
}

//
// Parse from a token or regexp, and move forward if match
//
function $(tok, root) {
    var match, args, length, c, index;
        
    // Non-terminal
    if (tok instanceof Function) {
        return tok.call(less.parser.parsers, root);
    // Terminal
    } else if (typeof(tok) === 'string') {
        match = input[i] === tok ? tok : null;
        length = 1;
    } else {
        if (i > current + chunks[j].length) {
            current += chunks[j++].length;
        }
        tok.lastIndex = index =  i - current;
        match = tok.exec(chunks[j]); 
        
        if (match) {
            length = match[0].length;
            if (tok.lastIndex - length !== index) { return }
        }
    }

    if (match) {
        i += length;

        while (i < inputLength) {
            c = input.charCodeAt(i);
            if (! (c === 32 || c === 10)) { break }
            i++;
        }
        return match.length === 1 ? match[0] : match;
    }
}

less.parser = {
    parse: function (str) {
        var tree;
        input = str;
        
        inputLength = input.length;
        chunks = input.split(/\n\n/g);

        for (var k = 0; k < chunks.length; k++) {
            if (k < chunks.length - 1) { chunks[k] += '\n' }
            if (k) { chunks[k] = '\n' + chunks[k] }
        }

        // Start with the primary rule
        tree = new(node.Ruleset)([], $(this.parsers.primary, []));
        tree.root = true;

        if (i < input.length - 1) {
            throw new(Error)("Parse Error: " + input.slice(0, i));
        }
        return tree;
    },
    parsers: {
        entities: {
            string: function string() {
                var str;
                if (input[i] !== '"' && input[i] !== "'") return;

                if (str = $(/"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/g)) {
                    return new(node.Quoted)(str);
                }
            },
            keyword: function keyword() {
                var k;
                if (k = $(/[a-z-]+/g)) { return new(node.Keyword)(k) }
            },
            call: function call() {
                var name, args;

                if (! (name = $(/([a-zA-Z0-9_-]+)\(/g))) return;

                args = $(this.entities.arguments);

                if (! $(')')) return;

                if (name) { return new(node.Call)(name[1], args) }
            },
            arguments: function arguments() {
                var args = [], arg;

                while (arg = $(this.expression)) {
                    args.push(arg);
                    if (! $(',')) { break }
                }
                return args;
            },
            accessor: function accessor() {
            },
            literal: function literal() {
                return $(this.entities.dimension) ||
                       $(this.entities.color) ||
                       $(this.entities.string);
            },
            url: function url() {
            },
            font: function font() {
            },
            variable: function variable(def) {
                var name;

                if (input[i] !== '@') return;

                if (def && (name = $(/(@[a-zA-Z0-9_-]+)\s*:/g))) { return name[1] }
                else if (!def && (name = $(/@[a-zA-Z0-9_-]+/g))) { return new(node.Variable)(name) }
            },
            color: function color() {
                var rgb;

                if (input[i] !== '#') return;
                if (rgb = $(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g)) {
                    return new(node.Color)(rgb[1]);
                }
            },
            dimension: function dimension() {
                var number, unit;
                
                number = $(/-?[0-9]*\.?[0-9]+/g);
                unit = $(/(?:px|%|em|pc|ex|in|deg|s|pt|cm|mm)/g);
            
                if (number) { return new(node.Dimension)(number, unit) }
            }
        },
        mixin: {
            call: function mixinCall() {
                var prefix, mixin;

                if (input[i] !== '.') return;
                i++;
                mixin = $(this.entities.call);

                if (mixin && $(';')) {
                    return ['MIXIN-CALL', mixin];
                }
            },
            definition: function mixinDefinition(root) {
                var name, params = [], match, ruleset, param, value;

                if (input[i] !== '.' || peek(/[^{]*(;|})/g)) return;

                if (match = $(/([#.][a-zA-Z0-9_-]+)\s*\(/g)) {
                    name = match[1];
                    while (param = $(this.entities.variable)) {
                        value = null;
                        if ($(':')) {
                            if (value = $(this.expression)) {
                                params.push([param, value]);        
                            } else {
                                throw new(Error)("Expected value");
                            }
                        } else {
                            params.push([param, null]);
                        }
                        if (! $(',')) { break }
                    }
                    if (! $(')')) throw new(Error)("Expected )");

                    ruleset = $(this.block, root);

                    if (ruleset) {
                        return ['MIXIN-DEF', name, params, ruleset];
                    }
                }
            }
        },
        entity: function entity() {
            var entities = [
                "url", "variable", "call", "accessor", 
                "keyword",  "literal", "font"
            ], e;

            for (var i = 0; i < entities.length; i++) {
                if (e = $(this.entities[entities[i]])) {
                    return e;
                }
            }
        },
        combinator: function combinator() {
            var match;
            if (match = $(/[+>~]/g) || $('&') || $(/::/g)) {
                return new(node.Combinator)(match);
            }
        },
        selector: function selector() {
            var sel, e, elements = [], match;

            while (e = $(this.element)) { elements.push(e) }

            if (elements.length > 0) { return new(node.Selector)(elements) }
        },
        element: function element() {
            var e, t;

            c = $(this.combinator);
            e = $(/[.#:]?[a-zA-Z0-9_-]+/g) || $('*') || /*$(this.attribute) ||*/ $(/\([a-z0-9+-]+\)/g);

            if (e) { return new(node.Element)(c, e) }
        },
        tag: function tag() {
            return $(/[a-zA-Z][a-zA-Z-]*[0-9]?/g) || $('*');
        },
        attribute: function attribute() {
            var attr = '', key, val, op;

            if (! $('[')) return;
            if ((key = $(this.tag)) &&
                (op = $(/[|~*$^]?=/g)) &&
                (val = $(this.entities.string) || $(/[a-zA-Z0-9_-]+/g))) {
                attr = [key, op, val];
            } else if (val = $(this.tag) || $(this.string)) {
                attr = val;
            }
            if (! $(']')) return;
            
            if (attr) { return ['ATTR', '[' + attr + ']'] }
        },
        block: function block(node) {
            var content;

            if ($('{') && (content = $(this.primary, node)) && $('}')) {
                return content;
            }
        },
        ruleset: function ruleset(root) {
            var selectors = [], s, rules, match;

            if (peek(/[^{]+[;}]/g)) return;

            if (match = peek(/([a-z.#: _-]+)[\s\n]*\{/g)) {
                i += match[0].length - 1;
                selectors = [new(node.Selector)([match[1]])];
            } else {
                while (s = $(this.selector)) {
                    selectors.push(s);
                    if (! $(',')) { break }
                }
            }

            rules = $(this.block, root);

            if (selectors.length > 0 && rules) {
                return new(node.Ruleset)(selectors, rules);
            }
        },
        rule: function rule() {
            var name, value, match;

            if (name = $(this.property) || $(this.entities.variable, true)) {
                if ((name[0] != '@') && (match =
                        peek(/((?:[\s\w."']|-[a-z])+|[^@+\/*(-;}]+)[;}][\s\n]*/g))) {
                    i += match[0].length;
                    return new(node.Rule)(name, match[1]);
                }

                if ((value = $(this.value)) && $(';')) {
                    return new(node.Rule)(name, value);
                }
            }
        },
        directive: function directive(root) {
            var name, value, rules;

            if (input[i] !== '@') return;

            if (name = $(/@[a-z]+/g)) {
                if (name === '@media' || name === '@font-face') {
                    if (rules = $(this.block, root)) {
                        return new(node.Directive)(name, rules);
                    }
                } else if ((value = $(this.entity)) && $(';')) {
                    return new(node.Directive)(name, value);
                }
            }
        },
        value: function value() {
            var e, expressions = [];

            while (e = $(this.expression)) {
                expressions.push(e);
                if (! $(',')) { break }
            }
            if (expressions.length > 0) {
                return new(node.Value)(expressions);
            }
        },
        sub: function sub() {
            var e;

            if ($('(') && (e = $(this.expression)) && $(')')) {
                return ["()", e];
            }
        },
        multiplication: function () {
            var m, a, op;
            if (m = $(this.operand)) {
                if ((op = $(/[\/*]/g)) && (a = $(this.multiplication))) {
                    return new(node.Operation)(op, [m, a]);
                } else {
                    return m;
                }
            }
        },
        addition: function () {
            var m, a, op;
            if (m = $(this.multiplication)) {
                if ((op = $(/[-+]\s+/g)) && (a = $(this.addition))) {
                    return new(node.Operation)(op, [m, a]);
                } else {
                    return m;
                }
            }
        },
        operand: function () {
            var o;
            if (o = $(this.sub) || $(this.entities.dimension) ||
                    $(this.entities.color) || $(this.entities.variable) ||
                    ($('-') && $(this.operand))) {
                return o;        
            }
        },
        expression: function expression() {
            var e, delim, entities = [], d;

            while (e = $(this.addition) || $(this.entity)) {
                entities.push(e);
            }
            if (entities.length > 0) {
                return new(node.Expression)(entities);
            }
        },
        property: function property() {
            var name;

            if (name = $(/(-?[-a-z]+)\s*:/g)) {
                return name[1];
            }
        },
        primary: function primary(root) {
            var node;

            while (node = $(this.ruleset, []) || $(this.rule) || $(this.mixin.definition, []) ||
                          $(this.mixin.call)  || $(/\/\*([^*]|\*+[^\/*])*\*+\//g) || $(/[\n\s]+/g) || $(this.directive)) {
                root.push(node);
            }
            return root;
        }
    }
};
