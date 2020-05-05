const isFunction = (func: any) => typeof func === 'function';

const isObject = (supposedObject: any) => typeof supposedObject === 'object' && supposedObject !== null && !Array.isArray(supposedObject);

const isThenable = (obj: any) => isObject(obj) && isFunction(obj.then);
export { isObject, isThenable, isFunction };
