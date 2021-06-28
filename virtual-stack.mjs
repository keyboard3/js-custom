const PUSH_NUMBER = 0, PUSH_NAME = 1, ADD = 2, STORE = 3;
function to_command_str(type) {
    if (type == PUSH_NUMBER) return "push number";
    if (type == PUSH_NAME) return "push name";
    if (type == ADD) return "add";
    if (type == STORE) return "store";
}
//假设一个指令缓存区为1000字节大小
const opBuffer = new ArrayBuffer(1000);
const dataView = new DataView(opBuffer);
let instructions = [
    [PUSH_NUMBER, "1"],
    [PUSH_NUMBER, "2"],
    [ADD],
    [STORE, "a"],
    [PUSH_NAME, "a"],
    [PUSH_NUMBER, "3"],
    [ADD],
    [STORE, "c"]
];
//构造二进制指令
const ATOM_NUMBER = 0, ATOM_STRING = 1;
class Atom {
    constructor(flag, val) {
        this.val = val;
        this.flag = flag;
    }
    val;
    flag;
}
let atoms = [];
let offest = 0;
for (let [operator, operand] of instructions) {
    // console.log("offset", to_command_str(operator));
    dataView.setUint8(offest, operator);
    offest += 8;
    switch (operator) {
        case PUSH_NUMBER:
            atoms.push(new Atom(ATOM_NUMBER, parseInt(operand)));
            dataView.setUint8(offest, atoms.length - 1);
            offest += 8;
            break;
        case STORE:
        case PUSH_NAME:
            {
                atoms.push(new Atom(ATOM_STRING, operand));
                dataView.setUint8(offest, atoms.length - 1);
                offest += 8;
            }
            break;
    }
}
//简易栈机虚拟机实现
let stack = [];
let scope = new Map();//执行作用域
let endPtr = offest;
let pc = 0;
const readOpView = new DataView(opBuffer);
while (pc < endPtr) {
    //取指令
    let opt = readOpView.getUint8(pc);
    pc += 8;
    console.log("pc", to_command_str(opt));
    //分析处理指令
    switch (opt) {
        case PUSH_NUMBER:
            stack.push(atoms[readOpView.getUint8(pc)]);
            pc += 8;
            break;
        case STORE:
        case PUSH_NAME:
            let name = atoms[readOpView.getUint8(pc)].val;
            pc += 8;
            if (opt == PUSH_NAME) stack.push(scope.get(name));
            else if (opt == STORE) scope.set(name, stack.pop());
            break;
        case ADD:
            let lval = stack.pop();
            let rval = stack.pop();
            stack.push(new Atom(ATOM_NUMBER, lval.val + rval.val));
    }
}
console.log(scope, stack);