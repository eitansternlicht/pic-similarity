export const lens = (obj, path) =>
    path.split(".").reduce((o, key) => (o && o[key] ? o[key] : null), obj);
