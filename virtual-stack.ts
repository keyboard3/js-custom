enum OP_TYPE {
  NUMBER,
  NAME,
  ADD,
  ASSIGN,
  RETURN,
  FUNCTION_DEFINE,
  FUNCTION_NATIVE,
  CALL,
}
function to_command_str(type) {
  if (type == OP_TYPE.NUMBER) return "number";
  if (type == OP_TYPE.NAME) return "name";
  if (type == OP_TYPE.ADD) return "add";
  if (type == OP_TYPE.ASSIGN) return "assign";
  if (type == OP_TYPE.FUNCTION_DEFINE) return "function defined";
  if (type == OP_TYPE.FUNCTION_NATIVE) return "function native";
  if (type == OP_TYPE.CALL) return "call";
  if (type == OP_TYPE.RETURN) return "return";
}
let instructions = [
  [OP_TYPE.FUNCTION_DEFINE, "calcu",
  [
    [OP_TYPE.NAME, "a"],
    [OP_TYPE.NAME, "b"],
    [OP_TYPE.NAME, "d"],
  ],
  [
    [OP_TYPE.NAME, "a"],
    [OP_TYPE.NAME, "b"],
    [OP_TYPE.ADD],
    [OP_TYPE.ASSIGN, "c"],
    [OP_TYPE.RETURN, "c"],
  ]],
  [OP_TYPE.CALL, "calcu", [
    [OP_TYPE.NUMBER, "1"],
    [OP_TYPE.NUMBER, "10"],
    [OP_TYPE.NUMBER, "13"],
  ]],
  [OP_TYPE.ASSIGN, "outA"],
  [OP_TYPE.FUNCTION_NATIVE, "log", console.log],
  [OP_TYPE.CALL, "log", [
    [OP_TYPE.NAME, "outA"]
  ]]
];
class _Stack {
  base: _Datum[] = [];
  frame: Frame;//当前函数执行栈帧
  _ptr: number = 0;
  get ptr() {
    return this.base[this._ptr];
  }
  push(data: _Datum) {
    this.base.push(data);
    this._ptr++;
  }
  pop() {
    this._ptr--;
    return this.base.pop();
  }
}
function main() {
  const context = new _Context();
  const script = new _Script();
  const result = new _Datum(DATUM_TYPE.UNDEF);
  codeGenerate(context, script, instructions, 0, "\t");
  codeInterpret(context, script, context.globalObject, result);
}
setTimeout(() => main());

//简易栈机虚拟机实现
function codeGenerate(context: _Context, script: _Script, instructions: any[], offset: number = 0, indent: string) {
  indent += "\t";
  const isCacheOffset = !!offset;
  const atoms = script.atoms;
  console.log(indent, "<codeGenerat>", instructions.length);
  const dataView = new DataView(script.code);
  for (let [operator, operand, ...reset] of instructions) {
    console.log(indent, "operator", to_command_str(operator));
    switch (operator) {
      case OP_TYPE.FUNCTION_NATIVE:
      case OP_TYPE.FUNCTION_DEFINE:
        {
          const [params, funBody] = reset;
          //根据函数指令创建函数对象
          const nameAtom = atoms[getAtomIndex(ATOM_TYPE.NAME, operand)];
          let fun: _Function | null = null;

          if (operator == OP_TYPE.FUNCTION_DEFINE) {
            const funScript = new _Script();
            fun = new _Function(nameAtom, funScript, context.staticLink);
            fun.scope = new _Scope(context.staticLink);
            //创建函数体
            codeGenerate(context, funScript, funBody, 0, indent);
            //提前创建参数符号
            funScript.args = params.map(param => {
              const parmaSymbol = new _Symbol(fun.scope, SYMOBL_TYPE.ARGUMENT, { key: funScript.atoms.find(item => item.val == param[1]) });
              parmaSymbol.slot = -1;//占位
              return parmaSymbol;
            });
            fun.scope.list.push(...fun.script.args);
          } else {
            fun = new _Function(nameAtom, null, context.staticLink);
            fun.call = reset[0];
          }
          //创建方法符号
          const funPropery = new _Property(new _Datum(DATUM_TYPE.FUNCTION, fun));
          const funSymbol = new _Symbol(context.staticLink, SYMOBL_TYPE.PROPERTY, { key: nameAtom, value: funPropery });
          fun.name = nameAtom;
          //给作用域添加符号
          context.staticLink.list.push(funSymbol);
        }
        break;
      case OP_TYPE.CALL:
        {
          const [params] = reset;
          appendBuffer(OP_TYPE.NAME, getAtomIndex(ATOM_TYPE.NAME, operand));
          offset = codeGenerate(context, script, params, offset, indent);
          appendBuffer(OP_TYPE.CALL, params.length);
        }
        break;
      case OP_TYPE.NUMBER:
        appendBuffer(OP_TYPE.NUMBER, getAtomIndex(ATOM_TYPE.NUMBER, parseInt(operand)));
        break;
      case OP_TYPE.NAME:
        appendBuffer(OP_TYPE.NAME, getAtomIndex(ATOM_TYPE.NAME, operand));
        break;
      case OP_TYPE.ASSIGN:
        appendBuffer(OP_TYPE.NAME, getAtomIndex(ATOM_TYPE.NAME, operand));
        appendBuffer(operator);
        break;
      case OP_TYPE.RETURN:
        appendBuffer(OP_TYPE.NAME, getAtomIndex(ATOM_TYPE.NAME, operand));
        appendBuffer(operator);
        break;
      case OP_TYPE.ADD:
        appendBuffer(operator);
        break;
    }
  }
  if (!isCacheOffset)
    script.code = script.code.slice(0, offset);
  return offset;
  function appendBuffer(...params: number[]) {
    console.log(indent, "appendBuffer", to_command_str(params[0]));
    params.forEach(value => {
      dataView.setUint8(offset, value);
      offset += 8;
    });
  }
  function getAtomIndex(type, val) {
    let index = atoms.findIndex(item => item.flag == type && item.val == val);
    if (index >= 0) return index;
    atoms.push(new _Atom(type, val));
    return atoms.length - 1;
  }
}
function codeInterpret(context: _Context, script: _Script, slink: _Scope, result: _Datum) {
  console.log("<codeInterpret>");
  const stack = context.stack;
  const atoms = script.atoms;
  const codeView = new DataView(script.code);
  let pc = 0;
  //保存旧上下文
  const oldslink = context.staticLink;
  context.staticLink = slink;
  while (pc < codeView.byteLength) {
    //取指令
    let opt = popBuffer();
    console.log("pc", to_command_str(opt));
    //分析处理指令
    switch (opt) {
      case OP_TYPE.CALL:
        {
          //通过nameAtom从当前作用域中找到symobl
          let argc = popBuffer();
          //直接从symobl中获取到function
          const funDatum = stack.base[stack._ptr - argc - 1];
          resolveValue(funDatum);
          //创建栈帧
          const frame = new Frame(stack);
          frame.argc = argc;
          frame._argv = stack._ptr - argc;
          frame._vars = stack._ptr;
          frame.fun = funDatum.fun;
          frame.down = context.stack.frame;
          //将已压入栈的参数，参数符号的栈实参位置设置
          if (frame.fun.script) {
            for (let i = 0; i < argc; i++) {
              resolveValue(frame.argv[i]);
              frame.fun.script.args[i].slot = i;
            }
          }
          //压入栈
          stack.frame = frame;
          const result = new _Datum(DATUM_TYPE.UNDEF);
          if (frame.fun.call) {
            let params = frame.argv.map(item => {
              resolveValue(item);
              return item;
            }).map(item => item.nval || item.sval);
            frame.fun.call(...params);
          } else {
            codeInterpret(context, frame.fun.script, frame.fun.scope, result);
          }
          //调用完毕恢复栈帧
          stack.frame.vars.forEach(() => stack.pop());//动态变量弹出
          stack.frame.argv.forEach(() => stack.pop());//参数弹出
          stack.pop();//方法名弹出
          stack.frame = frame.down;
          //结果压入栈中
          stack.push(result);
        }
        break;
      case OP_TYPE.NUMBER:
        stack.push(atomTempDatum(getAtom()));
        break;
      case OP_TYPE.NAME:
        stack.push(atomTempDatum(getAtom()));
        break;
      case OP_TYPE.ASSIGN:
        {
          let isOk: boolean, lval: _Datum, rval: _Datum;
          lval = stack.pop();
          resolveSymbol(lval);

          rval = stack.pop();
          isOk = resolveValue(rval);
          if (!isOk) return;

          if (lval.flag != DATUM_TYPE.SYMBOL) {
            //定义symbol
            let symbol = new _Symbol(context.staticLink, SYMOBL_TYPE.VARIABLE, { key: lval.atom });
            if (stack.frame) {
              stack.push(rval);
              stack.frame.nvars++;
              symbol.slot = stack.frame.nvars - 1;
            } else {
              symbol.entry.value = rval;
            }
            context.staticLink.list.push(symbol);
          } else {
            const sym = lval.symbol;
            //已经是符号，根据符号类型，修改值
            switch (sym.type) {
              case SYMOBL_TYPE.ARGUMENT:
              case SYMOBL_TYPE.VARIABLE:
                if (sym.entry.value || !stack.frame)
                  sym.entry.value = rval;
                else if (sym.type == SYMOBL_TYPE.ARGUMENT) stack.frame.argv[sym.slot] = rval;
                else stack.frame.nvars[sym.slot] = rval;
                break;
              case SYMOBL_TYPE.PROPERTY:
                (sym.entry.value as _Property).datum = rval;
                break;
            }
          }
        }
        break;
      case OP_TYPE.RETURN:
        {
          let val = stack.pop();
          resolveValue(val);
          Object.assign(result, val);
        }
        break;
      case OP_TYPE.ADD:
        {
          let rval: _Datum, lval: _Datum;
          rval = stack.pop();
          lval = stack.pop();
          resolveValue(rval);
          resolveValue(lval);
          const value = lval.nval + rval.nval;
          stack.push(new _Datum(DATUM_TYPE.NUMBER, value));
        }
        break;
    }
  }
  //还原旧上下文
  context.staticLink = oldslink;
  function resolveValue(datum: _Datum): boolean {
    resolveSymbol(datum);
    //如果datum还是符号，则需要进一步解析符号
    if (datum.flag == DATUM_TYPE.SYMBOL) {
      if (SYMOBL_TYPE.PROPERTY == datum.symbol.type) {
        Object.assign(datum, (datum.symbol.entry.value as _Property).datum);
        resolvePrimary(datum);
        return true;
      }
      //参数和变量先从符号上尝试读取
      if (datum.symbol.entry.value) {
        Object.assign(datum, datum.symbol.entry.value);
        resolvePrimary(datum);
        return true;
      }
      //否则就从栈里找到该符号的栈帧中存储的变量
      let targetFp: Frame;
      for (let fp = stack.frame; fp; fp = fp.down) {
        if (fp.fun.scope == datum.symbol.scope) {
          targetFp = fp;
          break;
        }
      }
      if (!targetFp) return false;
      if (datum.symbol.type == SYMOBL_TYPE.ARGUMENT) Object.assign(datum, targetFp.argv[datum.symbol.slot]);
      else Object.assign(datum, targetFp.vars[datum.symbol.slot]);
      resolvePrimary(datum);
    } else if (datum.flag == DATUM_TYPE.ATOM) {
      if (datum.atom.flag == ATOM_TYPE.NUMBER) {
        datum.flag = DATUM_TYPE.NUMBER;
        datum.nval = datum.atom.val as number;
      } else if (datum.atom.flag == ATOM_TYPE.STRING) {
        datum.flag = DATUM_TYPE.STRING;
        datum.sval = datum.atom.val as string;
      } else return false;
    }
    return true;
  }
  function resolvePrimary(datum: _Datum) {
    if (datum.flag != DATUM_TYPE.ATOM) return;
    resolveValue(datum);
  }
  /**
   * 将如果是字面量找到symbol
   */
  function resolveSymbol(datum: _Datum): boolean {
    if (datum.flag == DATUM_TYPE.SYMBOL) return true;
    if (datum.flag == DATUM_TYPE.ATOM) {
      const symbol = findSymbolByAtom(context.staticLink, datum.atom);
      if (!symbol) return false;
      datum.symbol = symbol;
      datum.flag = DATUM_TYPE.SYMBOL;
      return true;
    }
    return false;
    function findSymbolByAtom(scope: _Scope, atom: _Atom) {
      let symbol = scope.list.find(symbol => symbol.entry?.key == atom);
      if (!symbol && scope.parent) {
        symbol = findSymbolByAtom(scope.parent, atom);
      }
      return symbol;
    }
  }
  function atomTempDatum(atom: _Atom) {
    return new _Datum(DATUM_TYPE.ATOM, atom);
  }
  function getAtom(): _Atom {
    return atoms[popBuffer()];
  }
  function popBuffer() {
    const index = codeView.getUint8(pc);
    pc += 8;
    return index;
  }
}
//全局上下文
class _Context {
  constructor() {
    this.stack = new _Stack();
    this.globalObject = new _Scope();
    this.staticLink = this.globalObject;
  }
  staticLink: _Scope;//静态作用域
  globalObject: _Scope;//顶级作用域
  stack: _Stack;//执行的全局操作数存储区
}
//函数执行的上下文
class Frame {
  _stack: _Stack;
  fun: _Function;
  constructor(stack: _Stack) {
    this._stack = stack;
    this.argc = 0;
    this.nvars = 0;
    this._argv = this._stack._ptr;
    this._vars = this._stack._ptr;
  }
  argc: number;//函数参数数量
  nvars: number;//本地变量数量
  _argv: number;//stack的参数索引
  _vars: number;//stack的参数索引
  get argv() {
    return this._stack.base.slice(this._argv, this._argv + this.argc);
  };
  get vars() {
    return this._stack.base.slice(this._vars, this._vars + this.nvars);
  }
  down: Frame;//上一个执行栈帧
}
//表示字面量
enum ATOM_TYPE {
  NUMBER,
  STRING,
  NAME
}
class _Atom {
  constructor(flag: ATOM_TYPE, val: number | string) {
    this.val = val;
    this.flag = flag;
  }
  val: number | string;
  flag: ATOM_TYPE;
}
class _Script {
  constructor() {
    this.code = new ArrayBuffer(1000);
    this.atoms = [];
    this.args = [];
  }
  args: _Symbol[];//参数
  code: ArrayBuffer;//二进制指令
  atoms: _Atom[];//字面量数组
}
class _Function {
  constructor(name: _Atom, script: _Script, parent: _Scope) {
    this.name = name;
    this.script = script;
    this.scope = parent;
  }
  scope: _Scope;
  name: _Atom;
  script: _Script;
  call?: (...args) => void;//原生方法
}
class _Property {
  datum: _Datum;
  constructor(datum: _Datum) {
    this.datum = datum;
  }
}
enum SYMOBL_TYPE {
  ARGUMENT,//栈中
  VARIABLE,//栈中
  PROPERTY,//symbol的值
}
type _SymbolEntry = {
  key: _Atom;
  value?: _Datum | _Property;
}
class _Symbol {
  constructor(scope: _Scope, type: SYMOBL_TYPE, entry: _SymbolEntry) {
    this.scope = scope;
    this.type = type;
    this.entry = entry;
  }
  scope: _Scope;//通过scope确定栈帧，在通过当前栈帧和sym的栈帧和slot确定stack中的datum
  entry: _SymbolEntry;
  slot: number;//符号在栈中的索引
  type: SYMOBL_TYPE;//符号的类型 参数/变量
}
//存储入栈数据源 method,virable
enum DATUM_TYPE {
  FUNCTION,//如果是方法则从获得函数信息
  SYMBOL,//已解析的符号，在stack中有引用
  ATOM,//基础元数据(字面量)类型，从atom中获取
  STRING,
  NUMBER,
  OBJECT,
  BOOL,
  UNDEF,
}
type DATUM_VALUE = _Atom | _Function | _Symbol | number | boolean | string | _Scope;
class _Datum {
  constructor(flag: DATUM_TYPE, value?: DATUM_VALUE) {
    this.flag = flag;
    if (flag == DATUM_TYPE.FUNCTION) this.fun = value as _Function;
    if (flag == DATUM_TYPE.ATOM) this.atom = value as _Atom;
    if (flag == DATUM_TYPE.SYMBOL) this.symbol = value as _Symbol;
    if (flag == DATUM_TYPE.STRING) this.sval = value as string;
    if (flag == DATUM_TYPE.NUMBER) this.nval = value as number;
    if (flag == DATUM_TYPE.BOOL) this.bval = value as boolean;
    if (flag == DATUM_TYPE.OBJECT) this.object = value as _Scope;
  }
  atom: _Atom;
  object: _Scope;
  fun: _Function;
  symbol: _Symbol;
  nval: number;
  bval: boolean;
  sval: string;
  flag: DATUM_TYPE;
}
class _Scope {
  constructor(parent?: _Scope) {
    this.parent = parent;
  }
  list: _Symbol[] = [];//所有符号
  parent: _Scope | null;
}