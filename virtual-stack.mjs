const PUSH_NUMBER = 0, PUSH_NAME = 1, ADD = 2, STORE = 3, FUNCTION_DEFINE = 4, FUNCTION_CALL = 5;
function to_command_str(type) {
    if (type == PUSH_NUMBER) return "push number";
    if (type == PUSH_NAME) return "push name";
    if (type == ADD) return "add";
    if (type == STORE) return "store";
    if (type == FUNCTION_DEFINE) return "function defined";
    if (type == FUNCTION_CALL) return "function call";
}
let instructions = [
    [PUSH_NUMBER, "4"],
    [STORE, "outA"],
    [FUNCTION_DEFINE, "calcu", [
        [PUSH_NUMBER, "1"],
        [PUSH_NUMBER, "2"],
        [ADD],
        [STORE, "innerA"],
        [PUSH_NAME, "innerA"],
        [PUSH_NUMBER, "3"],
        [ADD],
        [STORE, "innerC"]
    ]],
    [FUNCTION_CALL, "calcu"]
];
class Context {
    atoms = [];
    gloablScope = new Map();
    staticLink;
}
//构造二进制指令
const ATOM_NUMBER = 0, ATOM_STRING = 1, ATOM_METHOD = 2;
const context = new Context();
const script = codeGenerge(context, instructions);
let result = codeInterpret(context, script);
console.log("result", result, globalScope);

class Atom {
    constructor(flag, val) {
        this.val = val;
        this.flag = flag;
    }
    val;
    flag;
    script;
}
//简易栈机虚拟机实现
let globalScope = new Map();//执行作用域
function codeGenerge(context, instructions) {
    let offest = 0;
    const atoms = context.atoms;
    const script = new ArrayBuffer(1000);//暂不支持动态扩容
    const dataView = new DataView(script);
    for (let [operator, operand, ins] of instructions) {
        appendBuffer(operator);
        switch (operator) {
            case FUNCTION_DEFINE:
                appendBuffer(getAtomIndex(ATOM_METHOD, operand));
                getAtom(ATOM_METHOD, operand).script = codeGenerge(ins);
                break;
            case FUNCTION_CALL:
                appendBuffer(getAtomIndex(ATOM_METHOD, operand));
                break;
            case PUSH_NUMBER:
                appendBuffer(getAtomIndex(ATOM_NUMBER, parseInt(operand)));
                break;
            case STORE:
            case PUSH_NAME:
                appendBuffer(getAtomIndex(ATOM_STRING, operand));
                break;
        }
    }
    return script.slice(0, offest);
    function appendBuffer(value) {
        dataView.setUint8(offest, value);
        offest += 8;
    }
    function getAtomIndex(type, val) {
        let index = atoms.findIndex(item => item.flag == type && item.val == val);
        if (index >= 0) return index;
        atoms.push(new Atom(type, val));
        return atoms.length - 1;
    }
    function getAtom(type, val) {
        return atoms.find(item => item.flag == type && item.val == val);
    }
}
function codeInterpret(context, script, result) {
    const stack = [];
    const atoms = context.atoms;
    const readOpView = new DataView(script);
    let pc = 0;
    while (pc < script.byteLength) {
        //取指令
        let opt = popBuffer();
        console.log("pc", to_command_str(opt));
        //分析处理指令
        switch (opt) {
            case FUNCTION_DEFINE:
                {
                    let funcAtom = getAtom(pc);
                    //TODO 绑定执行上下文
                }
                break;
            case FUNCTION_CALL:
                {
                    let funcAtom = getAtom(pc);
                    //TODO 拿到参数传递
                    result = codeInterpret(funcAtom.script);
                }
                break;
            case PUSH_NUMBER:
                stack.push(getAtom(pc));
                topResult();
                break;
            case STORE:
            case PUSH_NAME:
                let name = getAtom(pc).val;
                if (opt == PUSH_NAME) {
                    stack.push(globalScope.get(name));
                    topResult();
                } else if (opt == STORE) globalScope.set(name, stack.pop());
                break;
            case ADD:
                let lval = stack.pop();
                let rval = stack.pop();
                stack.push(new Atom(ATOM_NUMBER, lval.val + rval.val));
                topResult();
                break;
        }
    }
    return result;
    function getAtom() {
        return atoms[popBuffer()];
    }
    function popBuffer() {
        const index = readOpView.getUint8(pc);
        pc += 8;
        return index;
    }
    function topResult() {
        Object.assign(result, stack[stack.length - 1].val);
    }
}