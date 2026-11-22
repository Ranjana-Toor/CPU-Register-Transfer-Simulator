/* Pure CPU operation functions. Values are always reduced to 8 bits. */
const CPUOperations = (() => {
  const runArithmetic = (type, a, b = 0) => {
    switch (type) {
      case "add": return a + b;
      case "subtract": return a - b;
      case "increment": return a + 1;
      case "decrement": return a - 1;
      default: throw new Error("Select a valid arithmetic operation.");
    }
  };
  const runLogical = (type, a, b = 0) => {
    switch (type) {
      case "and": return a & b;
      case "or": return a | b;
      case "xor": return a ^ b;
      case "not": return (~a) & 255;
      default: throw new Error("Select a valid logical operation.");
    }
  };
  const describe = (type, aName, bName) => {
    const labels = { add: "+", subtract: "−", increment: "+ 1", decrement: "− 1", and: "AND", or: "OR", xor: "XOR", not: "NOT" };
    if (type === "increment" || type === "decrement") return `${aName} ${labels[type]}`;
    if (type === "not") return `NOT ${aName}`;
    return `${aName} ${labels[type]} ${bName}`;
  };
  return { runArithmetic, runLogical, describe };
})();