
const Ast = {
	Int(val) { return { tag: 'int', val }; },
	Double(val) { return { tag: 'double', val }; },

	Var(name) { return { tag: 'var', name }; },

	Minus(expr) { return { tag: 'minus', expr }; },

	Add(lhs, rhs) { return { tag: 'add', lhs, rhs }; },
	Mul(lhs, rhs) { return { tag: 'mul', lhs, rhs }; },
	Div(lhs, rhs) { return { tag: 'div', lhs, rhs }; },

	FunctionCall(name, args) { return { tag: 'function-call', name, args }; },
	MethodCall(target, name, args) { return { tag: 'method-call', target, name, args }; },
	Indexing(target, idx) { return { tag: 'indexing', target, idx }; },

	Assignment(target, value) { return { tag: 'assignment', target, value } },
};
