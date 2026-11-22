/* Register storage and number-formatting helpers. */
const RegisterBank = (() => {
  const values = { R0: 0, R1: 0, R2: 0, R3: 0 };
  const names = Object.keys(values);
  const normalize = value => ((value % 256) + 256) % 256;
  const set = (name, value) => {
    if (!Object.prototype.hasOwnProperty.call(values, name)) throw new Error("Unknown register.");
    if (!Number.isInteger(value)) throw new Error("Register values must be whole numbers.");
    values[name] = normalize(value);
    return values[name];
  };
  const get = name => values[name];
  const clear = name => set(name, 0);
  const clearAll = () => names.forEach(name => { values[name] = 0; });
  const binary = value => (value & 255).toString(2).padStart(8, "0");
  const hex = value => (value & 255).toString(16).toUpperCase().padStart(2, "0");
  const snapshot = () => ({ ...values });
  return { names, set, get, clear, clearAll, binary, hex, snapshot, normalize };
})();