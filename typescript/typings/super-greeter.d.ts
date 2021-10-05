declare module "super-greeter" {
  export default Greeter;
}
/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */

/*~ Write your module's methods and properties in this class */
declare class Greeter {
  constructor(customGreeting?: string);
  greet: () => void;
  myMethod(opts: MyClass.MyClassMethodOptions): number;
}
/*~ If you want to expose types from your module as well, you can
 *~ place them in this block.
 *~
 *~ Note that if you decide to include this namespace, the module can be
 *~ incorrectly imported as a namespace object, unless
 *~ --esModuleInterop is turned on:
 *~   import * as x from '[~THE MODULE~]'; // WRONG! DO NOT DO THIS!
 */
declare namespace MyClass {
  export interface MyClassMethodOptions {
    width?: number;
    height?: number;
  }
}
