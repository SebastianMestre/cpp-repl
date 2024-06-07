
const Value = {
	Int(val) { return { type: 'int', val }; },
	Double(val) { return { type: 'double', val }; },
	Void() { return { type: 'void' }; },
	Vector() { return { type: 'vector', data: [] }; },
};

function eval_expr(env, ast) {

	const functions = new Map;
	functions.set('sqrt', function(args) {
		const val = convert_to_double(args[0]).val;
		const res = Math.sqrt(val);
		return Value.Double(res);
	});

	return eval(ast);

	function eval(ast) {
		switch (ast.tag) {
		case 'int': {
			return Value.Int(ast.val);
		} break;
		case 'double': {
			return Value.Double(ast.val);
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
		case 'var': {
			if (!env.has(ast.name)) throw RangeError(`Accesed undefined variable '${ast.name}'`);
			return env.get(ast.name);
		} break;
		case 'function-call': {
			const fun = functions.get(ast.name);
			const args = ast.args.map(x => eval(x));
			return fun(args);
		} break;
		case 'method-call': {
			const obj = eval(ast.target);
			const args = ast.args.map(x => eval(x));
			if (obj.type === 'vector' && ast.name === 'push_back') {
				if (args.length != 1) throw TypeError('vector<T>::push_back takes exactly one argument');
				obj.data.push(args[0]);
				return Value.Void();
			} else {
				throw TypeError(`Tried to call method '${ast.name}' on oject of type '${obj.type}'`);
			}
		} break;
		default:
			throw TypeError(`invalid AST type '${ast.tag}'`);
		}
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
