/**
 * https://tc39.es/ecma262/#sec-object-initializer
 * 
 * Primary Expression
 *      Object Initialzer
 * 
 * Object Initialzer
 *      ObjectLiteral
 * 
 * ObjectLiteral
 *      { }
 *      ...
 *      { PropertyDefinitionList , }
 * 
 * PropertyDefinitionList
 *      ...
 *      PropertyDefinitionList , 
 * 
 * PropertyDefinition
 *      IdentifierReference
 *      CoverInitializedName
 *      PropertyName : AssignmentExpression
 *      MethodDefinition
 *      ... AssignmentExpression
 * 
 * babel 转义也是先创建一个只有原型的对象，然后展开属性设置过程，调用_defineProperty一个个属性设置
 */
var obj = {
    // Sets the prototype. "__proto__" or '__proto__' would also work.
    __proto__: theProtoObj,
    // Computed property name does not set prototype or trigger early error for
    // duplicate __proto__ properties.
    ['__proto__']: somethingElse,
    // Shorthand for ‘handler: handler’
    handler,
    // Methods
    toString() {
        // Super calls
        return "d " + super.toString();
    },
    // Computed (dynamic) property names
    ["prop_" + (() => 42)()]: 42
};