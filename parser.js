
function parse(str) {

	const binops = new Map();
	binops.set('+', { op: Ast.Add, prec: 0 });
	binops.set('*', { op: Ast.Mul, prec: 1 });
	binops.set('/', { op: Ast.Div, prec: 1 });

	const variable_starters = new Set('abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ');
	const variable_chars = new Set('abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
	const digits = new Set('0123456789');
	const spaces = new Set(' \t\n');

	let cursor = 0;

	return parse_expr();

	function parse_expr(prec = -1) {
		let lhs = parse_simple_expr();
		while (true) {
			skip_whitespace();
			if (eof()) break;

			if (eat('.')) {
				const name = parse_variable_string();
				skip_whitespace();
				if (!eat('(')) syntax_error();
				const arg = parse_expr();
				skip_whitespace();
				if (!eat(')')) syntax_error();
				lhs = Ast.MethodCall(lhs, name, [arg]);
				continue;
			}

			if (eat('[')) {
				const idx = parse_expr();
				skip_whitespace();
				if (!eat(']')) syntax_error();
				lhs = Ast.Indexing(lhs, idx);
				continue;
			}

			if (!binops.has(str[cursor])) break;
			const {op, prec: op_prec} = binops.get(str[cursor]);

			if (op_prec <= prec) break;

			cursor++;
			const rhs = parse_expr(op_prec);
			lhs = op(lhs, rhs);
		}
		return lhs;
	}

	function parse_simple_expr() {
		skip_whitespace();
		guard_eof();
		if (eat('(')) {
			const expr = parse_expr();
			skip_whitespace();
			if (!eat(')')) syntax_error();
			return expr;
		}
		if (eat('-')) {
			const expr = parse_simple_expr();
			return Ast.Minus(expr);
		}
		if (is_digit(str[cursor])) return parse_int();
		if (is_variable_starter(str[cursor])) return parse_variable();
		syntax_error();
	}

	function parse_int() {
		skip_whitespace();
		guard_eof();
		let x = 0;
		while (!eof() && is_digit(str[cursor])) {
			const d = str.charCodeAt(cursor) - '0'.charCodeAt(0);
			x = x * 10 + d;
			cursor++;
		}
		return Ast.Int(x);
	}

	function parse_variable() {
		const name = parse_variable_string();
		return Ast.Var(name);
	}

	function parse_variable_string() {
		skip_whitespace();
		guard_eof();
		if (!is_variable_starter(str[cursor])) syntax_error();
		const start = cursor;
		while (!eof() && is_variable_char(str[cursor]))
			cursor++;
		return str.slice(start, cursor);
	}

	function eat(c) {
		if (!eof() && str[cursor] == c) {
			cursor++;
			return true;
		}
		return false;
	}

	function skip_whitespace() {
		while (!eof() && is_space(str[cursor])) cursor++;
	}

	function guard_eof() { if (eof()) syntax_error(); }

	function eof() { return cursor == str.length; }

	function is_digit(c) { return digits.has(c); }

	function is_variable_char(c) { return variable_chars.has(c); }

	function is_variable_starter(c) { return variable_starters.has(c); }

	function is_space(c) { return spaces.has(c); }

	function syntax_error() { throw RangeError("syntax error!"); }

}
