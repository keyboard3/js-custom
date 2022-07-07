var node = {};
module.exports = node;

node.Call = function Call(name, args) {
    this.name = name;
    this.args = args;
};

//
// RGB Colors - #ff0014, #eee
//
node.Color = function Color(val) {
    if (val.length == 6) {
        this.value = val.match(/.{2}/g).map(function (c) {
            return parseInt(c, 16);
        });
    } else {
        this.value = val.split('').map(function (c) {
            return parseInt(c + c, 16);
        });
    }
};
node.Color.prototype = {
    eval: function () { return this },
    toCSS: function () {
        return '#' + this.value.map(function (i) {
            return i.toString(16);
        }).join('');
    },
    '+': function (other) {
        return new (node.Color)
            (this.value + other.value, this.unit);
    },
    '-': function (other) {
        return new (node.Color)
            (this.value - other.value, this.unit);
    },
    '*': function (other) {
        return new (node.Color)
            (this.value * other.value, this.unit);
    },
    '/': function (other) {
        return new (node.Color)
            (this.value / other.value, this.unit);
    }
};


node.Dimension = function Dimension(value, unit) {
    this.value = parseFloat(value);
    this.unit = unit || null;
};

node.Dimension.prototype = {
    eval: function () { return this },
    toCSS: function () {
        var css = this.value + this.unit;
        return css;
    },
    '+': function (other) {
        return new (node.Dimension)
            (this.value + other.value, this.unit);
    },
    '-': function (other) {
        return new (node.Dimension)
            (this.value - other.value, this.unit);
    },
    '*': function (other) {
        return new (node.Dimension)
            (this.value * other.value, this.unit);
    },
    '/': function (other) {
        return new (node.Dimension)
            (this.value / other.value, this.unit);
    }
};


node.Directive = function Directive(name, value) {
    this.name = name;
    if (Array.isArray(value)) {
        this.rules = value;
    } else {
        this.value = value;
    }
};
node.Directive.prototype.toCSS = function () {
    if (this.rules) {

    } else {
        return this.name + ' ' + this.value.toCSS() + ';\n';
    }
};


node.Element = function Element(combinator, value) {
    this.combinator = combinator;
    this.value = value.trim();
};
node.Element.prototype.toCSS = function () {
    var css = this.combinator.toCSS() + this.value;
    return css;
};

node.Combinator = function Combinator(value) {
    this.value = value.trim();
};
node.Combinator.prototype.toCSS = function () {
    switch (this.value) {
        case '&': return "";
        case ':': return ' :';
        case '>': return ' > ';
        default: return ' ' + this.value;
    }
};

node.Expression = function Expression(value) { this.value = value };
node.Expression.prototype.eval = function (env) {
    if (this.value.length > 1) {
        throw new (Error)("can't eval compound expression");
    } else {
        return this.value[0].eval(env);
    }
};
node.Expression.prototype.toCSS = function (env) {
    var evaled;
    evaled = this.value.map(function (e) {
        if (e.eval) {
            e = e.eval(env);
        }
        return e.toCSS ? e.toCSS(env) : e;
    });
    return evaled.join(' ');
};

node.Keyword = function Keyword(value) { this.value = value };
node.Keyword.prototype.toCSS = function () {
    return this.value;
};
node.Operation = function Operation(op, operands) {
    this.op = op.trim();
    this.operands = operands;
};
node.Operation.prototype.eval = function (env) {
    return this.operands[0].eval(env)[this.op](this.operands[1].eval(env));
};

node.Quoted = function Quoted(value) { this.value = value };
node.Quoted.prototype.toCSS = function () {
    var css = this.value;
    return css;
};

node.Rule = function Rule(name, value) {
    this.name = name;
    this.value = value;

    if (name.charAt(0) === '@') {
        require('sys').puts('NEW VAR, value:' + require('sys').inspect(value))
        this.variable = true;
    } else { this.variable = false }
};
node.Rule.prototype.toCSS = function (env) {
    return this.name + ": " + (this.value.toCSS ? this.value.toCSS(env) : this.value) + ";";
};

node.Value = function Value(value) {
    this.value = value;
    this.is = 'value';
};
node.Value.prototype.eval = function (env) {
    if (this.value.length === 1) {
        return this.value[0].eval(env);
    } else {
        throw new (Error)("trying to evaluate compound value");
    }
};
node.Value.prototype.toCSS = function (env) {
    return this.value.map(function (e) {
        return e.toCSS ? e.toCSS(env) : e;
    }).join(', ');
};


node.Ruleset = function Ruleset(selectors, rules) {
    this.selectors = selectors;
    this.rules = rules;
};
node.Ruleset.prototype = {
    variables: function () {
        return this.rules.filter(function (r) {
            if (r instanceof node.Rule && r.variable === true) { return r }
        });
    },
    toCSS: function (path, env) {
        var css = [], rules = [], rulesets = [];

        if (!this.root) path.push(this.selectors.map(function (s) { return s.toCSS(env) }));
        else {
            path = [], env = { frames: [] }
        }

        env.frames.unshift(this);

        for (var i = 0; i < this.rules.length; i++) {
            if (this.rules[i] instanceof node.Ruleset) { continue }

            if (this.rules[i].toCSS) {
                rules.push(this.rules[i].toCSS(env));
            } else {
                if (this.rules[i].value) {
                    rules.push(this.rules[i].value.toString());
                }
            }
        }

        for (var i = 0; i < this.rules.length; i++) {
            if (!(this.rules[i] instanceof node.Ruleset)) { continue }
            rulesets.push(this.rules[i].toCSS(path, env));
        }
        if (this.rules.length > 0) {
            if (path.length > 0) {
                css.push(path.join('').trim(),
                    " {\n  " + rules.join('\n  ') + "\n}\n",
                    rulesets.join(''));
            } else {
                css.push(rules.join('\n'), rulesets.join(''));
            }
        }
        path.pop();
        env.frames.shift();

        return css.join('');
    }
};


node.Selector = function Selector(elements) { this.elements = elements };
node.Selector.prototype.toCSS = function () {
    return this.elements.map(function (e) {
        if (typeof (e) === 'string') {
            return ' ' + e.trim();
        } else {
            return e.toCSS();
        }
    }).join('');
};

node.Variable = function Variable(name) { this.name = name };
node.Variable.prototype.eval = function (env) {
    var variables, variable;
    for (var i = 0; i < env.frames.length; i++) {
        variables = env.frames[i].variables();

        for (var j = 0; j < variables.length; j++) {
            variable = variables[j];

            if (variable.name === this.name) {
                if (variable.value.eval) {
                    return variable.value.eval(env);
                } else { return variable.value }
            }
        }
    }
};

