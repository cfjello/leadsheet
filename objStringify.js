  const PRIMITIVES = [
      'Number',
      'String',
      'Boolean',
      'Null',
      'Undefined',
      'Symbol'
    ];
  
    const SUPPORTED_OBJECTS = [
      'Object'
    ];
  
    const DEFAULT_OPTIONS = {
      indent: 2,
      depth: 1000,
      inline: false,
      singleQuotes: true
    };
  
  
    // utility
    const stringify = (obj, offset) => replaceLineSymbols( JSON.stringify(obj, '', offset) );
    const pluck = (obj, transformerFn) => (prop) => obj[prop] = transformerFn(obj[prop]);
    const populate = (obj, treatFn) => !Object.keys(obj).forEach(treatFn) && obj;
    const getType = (obj) => Object.prototype.toString.call(obj).slice(8, -1);
    const getCopy = (obj) => isPlainObject(obj) ? Object.assign({}, obj) :
                             Array.isArray(obj) ? [...obj] : obj;
  
    // testers
    const isPlainObject = (obj) => SUPPORTED_OBJECTS.includes( getType(obj) );
    const isObjectOrArray = (obj) => isPlainObject(obj) || Array.isArray(obj);
    const isEmpty = (obj) => !Object.getOwnPropertyNames(obj).length;
    const isPrimitive = (obj) => PRIMITIVES.includes( getType(obj) );
    const isFunction = (obj) => getType(obj) === 'Function';
    const isString = (obj) => getType(obj) === 'String';
    const isDate = (obj) => getType(obj) === 'Date';
  
    // replacers
    const replaceSingleQuotes = (str) => str.replace(/'/g, "\"");
    const replaceLineSymbols = (str) => {
      return str.replace(/\\n/g, "\n")
        .replace(/"/g, "")
        .replace(/\\\\/g, "\\")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    };
    const inline = (str) => str.replace(/\n/g, '');
  
  
    const traverse = (depth, acc, obj) => {
      const copy = getCopy(obj);
  
      return isObjectOrArray(copy) && acc <= depth ? populate(copy, pluck(copy, traverse.bind(null, depth, acc + 1))) :
             isString(copy) || isDate(copy) ? "'" + copy + "'" :
             copy && isFunction(copy.toString) ? copy.toString() :
             copy;
    };
  
  
    function objStringify(obj, options) {
  
      options = Object.assign({}, DEFAULT_OPTIONS, options);
  
      if (arguments.length === 0) {
        throw new Error('You forgot to pass argument to convert. Check it please.')
      }
  
      if ( isPrimitive(obj) || isFunction(obj) ) {
        console.warn(`Pay attention to the fact that you are trying to convert ${ getType(obj) }.`);
        return String(obj);
      }
  
      if ( isEmpty(obj) ) {
        console.warn('Passed arguments is an empty object or it has only prototypes properties. Trying fallback to JSON.stringify');
        return JSON.stringify(obj);
      }
  
      if ( !isObjectOrArray(obj) ) {
        console.warn(`Passed arguments is not a plain object. It is an instance of ${ getType(obj) }. Trying fallback to JSON.stringify`);
        return JSON.stringify(obj, '', options.indent);
      }
  
      let converted = stringify( traverse( options.depth, 1, getCopy(obj) ), options.indent );
  
      if (options.inline) {
        converted = inline(converted);
      }
  
      if (!options.singleQuotes) {
        converted = replaceSingleQuotes(converted);
      }
  
      return converted;
    }

export default objStringify