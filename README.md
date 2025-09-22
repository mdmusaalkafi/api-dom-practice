When working on this project, some important ES6 concepts.

### var, let, and const
In JavaScript, there are three ways to declare variables: `var`, `let`, and `const`.  
- `var` is the old way. It is function-scoped, can be redeclared, and is hoisted, which sometimes causes unexpected results.  
- `let` is block-scoped, which means it only works inside the block where it is defined. It can be updated but not redeclared in the same scope.  
- `const` is also block-scoped, but it cannot be reassigned after declaration. It’s mostly used for constants or references that should not change.

### map(), forEach(), and filter()
These are array methods that help us work with data more easily.  
- `map()` creates a **new array** by transforming each element.  
- `forEach()` just loops through the array and executes a function for each element, but it does not return anything.  
- `filter()` also creates a new array, but only includes the elements that pass a certain condition.  

For example, if I have a list of plants and I want only the expensive ones, I can use `filter()` to get them. If I want to calculate new prices with discounts, I can use `map()`

### Arrow Functions
ES6 introduced arrow functions as a shorter way to write functions.  
They look cleaner, for example: 
const add = (a, b) => a + b;
Unlike normal functions, arrow functions do not have their own this binding, which makes them useful in many situations like callbacks.

Destructuring Assignment
Destructuring allows us to unpack values from arrays or objects into separate variables.
For example:
const plant = { name: "Rose", price: 100 };
const { name, price } = plant;
This is easier than writing plant.name and plant.price every time.

Template Literals
Before ES6, we used + to join strings. Now we can use template literals with backticks `.
They allow variables and expressions to be embedded directly inside strings:

const name = "Rose";
console.log(`The plant name is ${name}`);
This is much cleaner and more readable compared to string concatenation.

 Conclusion
These modern JavaScript features (let/const, arrow functions, destructuring, template literals, and array methods) make code shorter, cleaner, and easier to understand. I used them in this project to handle API data, build UI components, and manage the cart system effectively.
