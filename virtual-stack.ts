enum OP_TYPE {
  NUMBER,
  NAME,
  ADD,
  ASSIGN,
  RETURN,
  FUNCTION_DEFINE,
  CALL,
}
function to_command_str(type) {
  if (type == OP_TYPE.NUMBER) return "push number";
  if (type == OP_TYPE.NAME) return "push name";
  if (type == OP_TYPE.ADD) return "add";
  if (type == OP_TYPE.ASSIGN) return "store";
  if (type == OP_TYPE.FUNCTION_DEFINE) return "function defined";
  if (type == OP_TYPE.CALL) return "function call";
  if (type == OP_TYPE.RETURN) return "return";
}
let instructions = [
  // [OP_TYPE.NUMBER, "4"],
  // [OP_TYPE.ASSIGN, "outA"],
  [OP_TYPE.FUNCTION_DEFINE, "calcu", [
    [OP_TYPE.NUMBER, "1"],
    [OP_TYPE.NUMBER, "2"],
    [OP_TYPE.ADD],
    [OP_TYPE.ASSIGN, "innerA"],
    [OP_TYPE.NAME, "innerA"],
    [OP_TYPE.NUMBER, "3"],
    [OP_TYPE.ADD],
    [OP_TYPE.ASSIGN, "innerC"],
    [OP_TYPE.RETURN, "innerC"]
  ]],
  [OP_TYPE.CALL, "calcu"]
];
class _Stack {
  base: Datum[] = [];
  frame: Frame;//当前函数执行栈帧
  _ptr: number;
  get ptr() {
    return this.base[this._ptr];
  }
  push(data: Datum) {
    this.base.push(data);
    this._ptr++;
  }
  pop() {
    this._ptr--;
    return this.base.pop();
  }
}
//全局上下文
class _Context {
  constructor() {
    this.statickLink = new _Scope();
    this.stack = new _Stack();
  }
  statickLink: _Scope;//全局作用域
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
    return this._stack.base.slice(this._argv, this.argc);
  };
  get vars() {
    return this._stack.base.slice(this._vars, this.nvars);
  }
  down: Frame;//上一个执行栈帧
}
//表示字面量
enum ATOM_TYPE {
  NUMBER,
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
enum DATUM_TYPE {
  FUNCTION,//如果是方法则从获得函数信息
  SYMBOL,//已解析的符号，在stack中有引用
  PRIMARY,//基础元数据(字面量)类型，从atom中获取
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
  constructor(name, script) {
    this.name = name;
    this.script = script;
  }
  name: _Atom;
  script: _Script;
}
enum SYMOBL_TYPE {
  ARGUMENT,//栈中
  VARIABLE,//栈中
  PROPERTY,//symbol的值
}
class _Symbol {
  constructor(type) {
    this.type = type;
  }
  // scope;
  entryValue: _Function | _Atom;
  slot: number;//符号在栈中的索引
  type: SYMOBL_TYPE;//符号的类型 参数/变量
}
//存储入栈数据源 method,virable
class Datum {
  constructor(flag: DATUM_TYPE) {
    this.flag = flag;
  }
  atom: _Atom;
  fun: _Function;
  symbol: _Symbol;
  flag: DATUM_TYPE;
}
class _Scope {
  list: _Symbol[] = [];//所有符号
}
function main() {
  const cconext = new _Context();
  const script = new _Script();
  const result = new Datum(DATUM_TYPE.PRIMARY);
  codeGenerge(cconext, script, instructions);
  codeInterpret(cconext, script, result);
}
main();

//简易栈机虚拟机实现
function codeGenerge(context: _Context, script: _Script, instructions: any[]) {
  let offest = 0;
  const atoms = script.atoms;
  const dataView = new DataView(script.code);
  for (let [operator, operand, ins] of instructions) {
    appendBuffer(operator);
    switch (operator) {
      case OP_TYPE.FUNCTION_DEFINE:
        const nameAtom = atoms[getAtomIndex(ATOM_TYPE.NAME, operand)];
        const funScript = new _Script();
        const fun = new _Function(nameAtom, funScript);
        const funSymbol = new _Symbol(SYMOBL_TYPE.PROPERTY);
        funSymbol.entryValue = fun;
        fun.name = nameAtom;
        context.statickLink.list.push(funSymbol);
        codeGenerge(context, funScript, ins);
        break;
      case OP_TYPE.CALL:
        appendBuffer(getAtomIndex(ATOM_TYPE.NAME, operand));
        break;
      case OP_TYPE.NUMBER:
        appendBuffer(getAtomIndex(ATOM_TYPE.NUMBER, parseInt(operand)));
        break;
      case OP_TYPE.ASSIGN:
      case OP_TYPE.NAME:
      case OP_TYPE.RETURN:
        appendBuffer(getAtomIndex(ATOM_TYPE.NAME, operand));
        break;
    }
  }
  script.code = script.code.slice(0, offest);
  function appendBuffer(value) {
    dataView.setUint8(offest, value);
    offest += 8;
  }
  function getAtomIndex(type, val) {
    let index = atoms.findIndex(item => item.flag == type && item.val == val);
    if (index >= 0) return index;
    atoms.push(new _Atom(type, val));
    return atoms.length - 1;
  }
  function getAtom(type, val) {
    return atoms.find(item => item.flag == type && item.val == val);
  }
}
function codeInterpret(context: _Context, script: _Script, result: Datum) {
  const stack = context.stack;
  const atoms = script.atoms;
  const codeView = new DataView(script.code);
  let pc = 0;
  while (pc < codeView.byteLength) {
    //取指令
    let opt = popBuffer();
    console.log("pc", to_command_str(opt));
    //分析处理指令
    switch (opt) {
      case OP_TYPE.CALL:
        {
          //通过nameAtom从当前作用域中找到symobl
          let nameAtom = getAtom();
          const funSymbol: _Symbol = context.statickLink.list
            .find(itemSymbol => {
              if (itemSymbol.type == SYMOBL_TYPE.PROPERTY
                && (itemSymbol.entryValue as _Function)?.name == nameAtom) {
                return true;
              }
              return false;
            });
          if (!funSymbol) throw `${nameAtom.val} not defined`;
          //直接从symobl中获取到function
          const fun: _Function = (funSymbol.entryValue as _Function);
          //创建栈帧
          const frame = new Frame(stack);
          frame.fun = fun;
          frame.down = context.stack.frame;
          //压入栈
          stack.frame = frame;
          const result = new Datum(DATUM_TYPE.PRIMARY);
          codeInterpret(context, fun.script, result);
          console.log("call result", result);
          stack.push(result);
          //调用完毕恢复栈帧,弹出栈帧动态变量
          stack.frame.vars.forEach(() => stack.pop());
          stack.frame.argv.forEach(() => stack.pop());
          stack.frame = frame.down;
        }
        break;
      case OP_TYPE.NUMBER:
        stack.push(atomToDatum(getAtom()));
        break;
      case OP_TYPE.ASSIGN:
        {
          //将当前栈的数归到栈帧的变量区内
          stack.frame.nvars++;
          //创建symbol将nameAtom放到，并slot设置变量区索引
          const varSymbol = new _Symbol(SYMOBL_TYPE.VARIABLE);
          varSymbol.slot = stack.frame.nvars - 1;
          varSymbol.entryValue = getAtom();
          //将symbol插入到当前作用域中
          context.statickLink.list.push(varSymbol);
        }
        break;
      case OP_TYPE.RETURN:
      case OP_TYPE.NAME:
        {
          //先通过nameAtom找到symbol
          const nameAtom = getAtom();
          const varSymbol = context.statickLink.list.find(item => item.type == SYMOBL_TYPE.VARIABLE && item.entryValue == nameAtom);
          if (!varSymbol) throw `${nameAtom.val} not defined`;
          //然后通过symbol中的slot定位到vars的datum
          const varDatum = stack.frame.vars[varSymbol.slot];
          if (opt == OP_TYPE.NAME) stack.push(varDatum);
          else Object.assign(result, varDatum);
        }
        break;
      case OP_TYPE.ADD:
        let lval = stack.pop();
        let rval = stack.pop();
        const value = (lval.atom.val as number) + (rval.atom.val as number);
        stack.push(atomToDatum(new _Atom(ATOM_TYPE.NUMBER, value)));
        break;
    }
  }
  function atomToDatum(atom: _Atom) {
    const dataum = new Datum(DATUM_TYPE.PRIMARY);
    dataum.atom = atom;
    return dataum;
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