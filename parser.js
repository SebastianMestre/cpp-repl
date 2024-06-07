
function parse(str) {
	let cursor = 0;

	return parse_expr();

	function parse_expr() {
		let lhs = parse_simple_expr();
		while (true) {
			skip_whitespace();
			if (eof()) break;
			if (str[cursor] == '.') {
				cursor++;
				const name = parse_variable_string();
				skip_whitespace();
				if (str[cursor] != '(') syntax_error();
				cursor++;
				const arg = parse_expr();
				skip_whitespace();
				if (str[cursor] != ')') syntax_error();
				cursor++;
				lhs = Ast.MethodCall(lhs, name, [arg]);
				continue;
			}
			const op = get_binop(str[cursor]);
			if (!op) break;
			cursor++;
			const rhs = parse_simple_expr();
			lhs = op(lhs, rhs);
		}
		return lhs;
	}

	function get_binop(c) {
		const binops = new Map();
		binops.set('+', Ast.Add);
		binops.set('*', Ast.Mul);
		binops.set('/', Ast.Div);
		return binops.get(c);
	}

	function parse_simple_expr() {
		skip_whitespace();
		guard_eof();
		if (str[cursor] == '-') {
			cursor++;
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

	function parse_variable_string() {
		skip_whitespace();
		guard_eof();
		if (!is_variable_starter(str[cursor])) syntax_error();
		const start = cursor;
		while (!eof() && is_variable_char(str[cursor]))
			cursor++;
		return str.slice(start, cursor);
	}

	function parse_variable() {
		const name = parse_variable_string();
		return Ast.Var(name);
	}

	function guard_eof() {
		if (eof()) syntax_error();
	}

	function eof() {
		return cursor == str.length;
	}

	function skip_whitespace() {
		while (!eof() && is_space(str[cursor])) cursor++;
	}

	function is_digit(c) {
		return '0123456789'.split('').includes(c);
	}

	function is_variable_char(c) {
		return 'abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').includes(c);
	}

	function is_variable_starter(c) {
		return 'abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').includes(c);
	}

	function is_space(c) {
		return ' \t\n'.split('').includes(c);
	}

	function syntax_error() {
		throw RangeError("syntax error!");
	}

}
