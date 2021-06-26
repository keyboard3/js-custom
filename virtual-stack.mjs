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
    [PUSH_NUMBER, 1],
    [PUSH_NUMBER, 2],
    [ADD],
    [STORE, "a"],
    [PUSH_NAME, "a"],
    [PUSH_NUMBER, 3],
    [ADD],
    [STORE, "c"]
];
//构造二进制指令
let offest = 0;
for (let [operator, operand] of instructions) {
    console.log("offset", to_command_str(operator));
    dataView.setInt8(offest, operator);
    offest += 8;
    switch (operator) {
        case PUSH_NUMBER:
            dataView.setInt32(offest, operand);
            offest += 32;
            break;
        case STORE:
        case PUSH_NAME:
            {
                const strUint8Array = str2Uint8Array(operand);
                dataView.setInt32(offest, strUint8Array.byteLength);
                offest += 32;
                const baseUnit8Array = new Uint8Array(opBuffer, offest, strUint8Array.byteLength);
                baseUnit8Array.set(strUint8Array);
                offest += strUint8Array.byteLength;
            }
            break;
    }
}
function str2Uint8Array(input) {
    const encoder = new TextEncoder()
    const view = encoder.encode(input)
    return view
}
function ab2str(
    input,//: ArrayBuffer | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array,
    outputEncoding = 'utf8',
) {
    const decoder = new TextDecoder(outputEncoding)
    return decoder.decode(input)
}

//简易栈机虚拟机实现
let stack = [];
let scope = new Map();//执行作用域
let endPtr = offest;
let pc = 0;
const readOpView = new DataView(opBuffer);
while (pc < endPtr) {
    //取指令
    let opt = readOpView.getInt8(pc);
    pc += 8;
    console.log("pc", to_command_str(opt));
    //分析处理指令
    switch (opt) {
        case PUSH_NUMBER:
            stack.push(readOpView.getInt32(pc));
            pc += 32;
            break;
        case STORE:
        case PUSH_NAME:
            let strByteLen = readOpView.getInt32(pc);
            pc += 32;
            let strUint8Array = new Uint8Array(opBuffer, pc, strByteLen);
            let name = ab2str(strUint8Array);
            pc += strByteLen;
            if (opt == PUSH_NAME) stack.push(scope.get(name));
            else if (opt == STORE) scope.set(name, stack.pop());
            break;
        case ADD:
            let lval = stack.pop();
            let rval = stack.pop();
            stack.push(lval + rval);
    }
}
console.log(scope, stack);