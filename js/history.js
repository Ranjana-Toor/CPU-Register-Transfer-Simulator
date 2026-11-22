/* Session-only operation history. New entries are displayed first. */
const OperationHistory = (() => {
  let entries = [];
  let nextId = 1;
  const add = item => {
    entries.unshift({ id: nextId++, ...item, time: new Date() });
    return entries[0];
  };
  const all = () => [...entries];
  const clear = () => { entries = []; nextId = 1; };
  return { add, all, clear };
})();