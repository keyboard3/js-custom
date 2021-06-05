import { Annotation } from "./utils.mjs";

const buffer = new ArrayBuffer(8);
Annotation`拷贝内存slice`
{
  const dataView = new DataView(buffer);
  dataView.setInt8(0, 1);
  const buf2 = buffer.slice(0, 3);
  const dataView2 = new DataView(buf2);
  console.log(dataView2.getInt8(0));
}
Annotation`建立视图区，末尾不够会报错`
try {
  const i16 = new Int16Array(buffer, 1);
} catch (err) {
  console.error(err.message);
}
Annotation`int16视图`
try {
  const i16 = new Int16Array(buffer);
  i16[3] = 1;
  i16[4] = 2;
  console.log(i16, i16.length)
  console.log(ArrayBuffer.isView(i16), ArrayBuffer.isView(buffer))
} catch (err) {
  console.error(err.message);
}
Annotation`直接构建Float64Array`
const f64a = new Float64Array(8);
f64a[0] = 10;
f64a[1] = 20;
f64a[2] = f64a[0] + f64a[1];
console.log(f64a)

Annotation`基于别的typedArray会拷贝值而不会共享同一块内存`
const x = new Int8Array([1, 1]);
const y = new Int8Array(x);
x[0] = 2;
console.log(x, y)
const c = new Int8Array(x.buffer);
c[0] = 2;
console.log(x, c);

Annotation`typedArray和普通Array相互转换`
{
  const typedArray = new Uint8Array([1, 2, 3, 4]);
  const normalArray = [...typedArray];
  // or
  const normalArray2 = Array.from(typedArray);
  // or
  const normalArray3 = Array.prototype.slice.call(typedArray);
  console.log(normalArray, normalArray2, normalArray3)
}

Annotation`实现TypedArray的contact`
{
  function concatenate(resultConstructor, ...arrays) {
    let totalLength = 0;
    for (let arr of arrays) {
      totalLength += arr.length;
    }
    let result = new resultConstructor(totalLength);
    let offset = 0;
    for (let arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
  const result = concatenate(Uint8Array, Uint8Array.of(1, 2), Uint8Array.of(3, 4));
  console.log(result);
}

Annotation`typedArray被for of遍历`
{
  let ui8 = Uint8Array.of(0, 1, 2);
  for (let byte of ui8) {
    console.log(byte);
  }
  console.log(ArrayBuffer.isView(ui8))
}

Annotation`打印内存块小端序的内容存储顺序`
{
  // 假定某段buffer包含如下字节 [0x02, 0x01, 0x03, 0x07]
  const buffer = new ArrayBuffer(4);
  const v1 = new Uint8Array(buffer);
  v1[0] = 2;
  v1[1] = 1;
  v1[2] = 3;
  v1[3] = 7;

  const uInt16View = new Uint16Array(buffer);

  // 计算机采用小端字节序
  // 所以头两个字节等于258
  if (uInt16View[0] === 258) {
    console.log('OK'); // "OK"
  }

  // 赋值运算
  uInt16View[0] = 255;    // 字节变为[0xFF, 0x00, 0x03, 0x07]
  uInt16View[0] = 0xff05; // 字节变为[0x05, 0xFF, 0x03, 0x07]
  uInt16View[1] = 0x0210; // 字节变为[0x05, 0xFF, 0x10, 0x02]
  console.log(uInt16View.buffer);
}

Annotation`判断当前是大小端序`
{
  const BIG_ENDIAN = Symbol('BIG_ENDIAN');
  const LITTLE_ENDIAN = Symbol('LITTLE_ENDIAN');

  function getPlatformEndianness() {
    let arr32 = Uint32Array.of(0x12345678);
    let arr8 = new Uint8Array(arr32.buffer);
    switch ((arr8[0] * 0x1000000) + (arr8[1] * 0x10000) + (arr8[2] * 0x100) + (arr8[3])) {
      case 0x12345678:
        return BIG_ENDIAN;
      case 0x78563412:
        return LITTLE_ENDIAN;
      default:
        throw new Error('Unknown endianness');
    }
  }
  console.log(getPlatformEndianness())
}

Annotation`将String和ArrayBuffer转换`
function ab2str(
  input,//: ArrayBuffer | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array,
  outputEncoding = 'utf8',
) {
  const decoder = new TextDecoder(outputEncoding)
  return decoder.decode(input)
}

function str2ab(input) {
  const view = str2Uint8Array(input)
  return view.buffer
}

function str2Uint8Array(input) {
  const encoder = new TextEncoder()
  const view = encoder.encode(input)
  return view
}
console.log(ab2str(str2ab("1234")))

Annotation`溢出无符号8位int`
{
  const uint8 = new Uint8Array(1);

  uint8[0] = 256;
  uint8[0] // 0
  console.log(uint8)
  uint8[0] = -1;
  uint8[0] // 255
  console.log(uint8)
}

Annotation`溢出有符号8位int`
{
  const int8 = new Int8Array(1);

  int8[0] = 128;
  int8[0] // -128
  console.log(int8)
  int8[0] = -129;
  int8[0] // 127
  console.log(int8)
}

Annotation`溢出Uint8ClampedArray`
{
  const uint8c = new Uint8ClampedArray(1);

  uint8c[0] = 256;
  uint8c[0] // 255
  console.log(uint8c)
  uint8c[0] = -1;
  uint8c[0] // 0
  console.log(uint8c)
}

Annotation`DataView明确大端小端序`
{
  const buffer = new ArrayBuffer(24);
  const dv = new DataView(buffer);
  // 在第1个字节，以大端字节序写入值为25的32位整数
  dv.setInt32(0, 25, false);

  // 在第5个字节，以大端字节序写入值为25的32位整数
  dv.setInt32(4, 25);

  // 在第9个字节，以小端字节序写入值为2.5的32位浮点数
  dv.setFloat32(8, 2.5, true);

  console.log(dv.getInt32(0, false));
  console.log(dv.getInt32(4, false));
  console.log(dv.getFloat32(8, true));
}