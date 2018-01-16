'use strict';
class Nyp {
  // A static abstract method.
  static blankmethod() {
    if (this === Nyp) {
      // Error Type 2. Nyp methods can not be called directly.
      throw new TypeError("Can not call static abstract method blankmethod.");
    } else if (this.blankmethod === Nyp.blankmethod) {
      // Error Type 3. The child has not implemented this method.
      throw new TypeError("Please implement static abstract method blankmethod.");
    } else {
      // Error Type 5. The child has implemented this method but also called `super.blankmethod()`.
      throw new TypeError("Do not call static abstract method blankmethod from child.");
    }
  }
  constructor(tg, pn, pw) {
    if (this.constructor === Nyp) {
      // Error Type 1. Nyp class can not be constructed.
      throw new TypeError("Can not construct abstract class.");
    }
    //else (called from child)
    // Check if all instance methods are implemented.
    if (this.blankmethod === Nyp.prototype.blankmethod) {
      // Error Type 4. Child has not implemented this abstract method.
      throw new TypeError("Please implement abstract method blankmethod.");
    }
    
    this.id = tg
    this._phonenumber = pn
    this._password = pw
  }
  // An abstract method.
  blankmethod() {
    // Error Type 6. The child has implemented this method but also called `super.blankmethod()`.
    throw new TypeError("Do not call abstract method blankmethod from child.");
  }
}

module.exports = Nyp

// Error Type 1.
//let bar = new Nyp(); // Throws because abstract class can not be constructed.

// Error Type 2.
//Nyp.blankmethod(); // Throws because static abstract methods can not be called.

class ChildA extends Nyp {}

// Error Type 3.
//ChildA.blankmethod(); // Throws because ChildA does not implement static abstract method blankmethod.

// Error Type 4.
//let bar = new ChildA(); // Throws because ChildA does not implement abstract method blankmethod.

class ChildB extends Nyp {
  static blankmethod() {
    // Calls Nyp.blankmethod();
    super.blankmethod();
  }
  blankmethod() {
    // Calls Nyp.prototype.blankmethod();
    super.blankmethod();
  }
}

// Error Type 5.
//ChildB.blankmethod(); // Throws because in ChildB the implementation calls the static abstract method blankmethod.

// Error Type 6.
//(new ChildB()).blankmethod(); // Throws because in ChildB the implementation calls the abstract method blankmethod.

// Success.
// Student.blackmethod();
// let studentObject = new Student();
// studentObject.blankmethod();