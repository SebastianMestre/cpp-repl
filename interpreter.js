
const Value = {
	Int(val) { return { type: 'int', val }; },
	Double(val) { return { type: 'double', val }; },
	Void() { return { type: 'void' }; },
	Vector() { return { type: 'vector', data: [] }; },
};

function eval_expr(env, ast) {

	const functions = new Map;
	functions.set('sqrt', function(args) {
		if (args.length != 1) throw TypeError('sqrt takes exactly one argument');
		const val = convert_to_double(args[0]).val;
		const res = Math.sqrt(val);
		return Value.Double(res);
	});

	const methods = new Map;

	{
		const vector_methods = new Map;
		vector_methods.set('push_back', function(obj, args) {
			if (args.length != 1) throw TypeError('vector::push_back takes exactly one argument');
			obj.data.push(args[0]);
			return Value.Void();
		});
		vector_methods.set('back', function(obj, args) {
			if (args.length != 0) throw TypeError('vector::back takes zero arguments');
			if (obj.data.length == 0) throw TypeError('Called vector::back on an empty vector');
			return obj.data[obj.data.length - 1];
		});
		vector_methods.set('operator[]', function(obj, args) {
			if (args.length != 1) throw TypeError('vector::operator[] takes exactly one argument');
			if (args[0].type != 'int') throw TypeError('vector::operator[] takes an int argument');
			return obj.data[args[0].val];
		});
		vector_methods.set('operator[]=', function(obj, args) {
			if (args.length != 2) throw TypeError('vector::operator[]= takes exactly one argument');
			if (args[0].type != 'int') throw TypeError('vector::operator[]= takes an int argument');
			return obj.data[args[0].val] = args[1];
		});
		methods.set('vector', vector_methods);
	}

	return eval(ast);

	function eval(ast) {
		switch (ast.tag) {

		case 'int': {
			return Value.Int(ast.val);
		} break;
		case 'double': {
			return Value.Double(ast.val);
		} break;

		case 'var': {
			if (!env.has(ast.name)) throw RangeError(`Accesed undefined variable '${ast.name}'`);
			return env.get(ast.name);
		} break;

		case 'minus': {
			const inner = eval(ast.expr);
			return minus(inner);
		};

		case 'add': {
			const lhs = eval(ast.lhs);
			const rhs = eval(ast.rhs);
			return add(lhs, rhs);
		} break;
		case 'sub': {
			const lhs = eval(ast.lhs);
			const rhs = eval(ast.rhs);
			return sub(lhs, rhs);
		} break;
		case 'mul': {
			const lhs = eval(ast.lhs);
			const rhs = eval(ast.rhs);
			return mul(lhs, rhs);
		} break;
		case 'div': {
			const lhs = eval(ast.lhs);
			const rhs = eval(ast.rhs);
			return div(lhs, rhs);
		} break;

		case 'function-call': {
			const fun = functions.get(ast.name);
			const args = ast.args.map(x => eval(x));
			return fun(args);
		} break;
		case 'method-call': {
			const obj = eval(ast.target);
			const args = ast.args.map(x => eval(x));
			return method_call(obj, ast.name, args);
		} break;
		case 'indexing': {
			const obj = eval(ast.target);
			const idx = eval(ast.idx);
			return method_call(obj, "operator[]", [idx]);
		} break;

		case 'assignment': {
			switch (ast.target.tag) {
			case 'var': {
				if (!env.has(ast.target.name)) throw RangeError(`Accesed undefined variable '${ast.name}'`);
				const value = eval(ast.value);
				env.set(ast.target.name, value);
				return value;
			} break;
			case 'indexing': {
				const obj = eval(ast.target.target);
				const idx = eval(ast.target.idx);
				const value = eval(ast.value);
				method_call(obj, "operator[]=", [idx, value]);
				return value;
			} break;
			default: throw TypeError(`Target of assignment is not an lvalue`);
			}
		} break;

		default:
			throw TypeError(`invalid AST type '${ast.tag}'`);
		}
	}

	function method_call(obj, name, args) {
			const obj_methods = methods.get(obj.type);
			if (!obj_methods) throw TypeError(`Type '${obj.type}' does not have any methods`);
			const method = obj_methods.get(name);
			if (!method) throw TypeError(`Type '${obj.type}' does not have a method named '${name}'`);
			return method(obj, args);
	}

	function minus(val) {
		if (val.type == 'int') return Value.Int(-val.val);
		if (val.type == 'double') return Value.Double(-val.val);
		throw TypeError(`Cannot find negative of '${val.type}'`);
	}

	function add(lhs, rhs) {
		if (lhs.type == 'int' && rhs.type == 'int') return Value.Int(lhs.val + rhs.val);
		if (lhs.type == 'double' && rhs.type == 'double') return Value.Double(lhs.val + rhs.val);
		throw TypeError(`Cannot add '${lhs.type}' and '${rhs.type}'`);
	}

	function sub(lhs, rhs) {
		if (lhs.type == 'int' && rhs.type == 'int') return Value.Int(lhs.val - rhs.val);
		if (lhs.type == 'double' && rhs.type == 'double') return Value.Double(lhs.val - rhs.val);
		throw TypeError(`Cannot substract '${lhs.type}' and '${rhs.type}'`);
	}

	function mul(lhs, rhs) {
		if (lhs.type == 'int' && rhs.type == 'int') return Value.Int(lhs.val * rhs.val);
		if (lhs.type == 'double' && rhs.type == 'double') return Value.Double(lhs.val * rhs.val);
		throw TypeError(`Cannot multiply '${lhs.type}' and '${rhs.type}'`);
	}

	function div(lhs, rhs) {
		if (lhs.type == 'int' && rhs.type == 'int') return Value.Int(Math.floor(lhs.val / rhs.val));
		if (lhs.type == 'double' && rhs.type == 'double') return Value.Double(lhs.val / rhs.val);
		throw TypeError(`Cannot divide '${lhs.type}' and '${rhs.type}'`);
	}

	function convert_to_double(arg) {
		if (arg.type == 'double') return arg;
		if (arg.type == 'int') return Value.Double(arg.val);
		throw TypeError(`Type '${arg.type}' is not convertible to double`);
	}

}

function show(val) {
	switch (val.type) {
	case 'int': return val.val.toString();
	case 'double': return val.val.toFixed(2);
	case 'vector': return 'std::vector{ ' + val.data.map(show).join(', ') + ' }';
	case 'void': return '-void-';
	}
}
