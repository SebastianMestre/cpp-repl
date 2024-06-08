
const inputs = [];

function add_input() {
	const div = document.createElement('div');
	const input = document.createElement('input');
	const label = document.createElement('span');
	label.innerHTML = '-';
	div.appendChild(input);
	div.appendChild(label);
	inputs.push({input, label});
	input.addEventListener('input', evt => { compute() });
	document.body.appendChild(div);
}

function compute() {

	const env = new Map;

	env.set('x', Value.Vector());

	console.log(env);

	for (const {input, label} of inputs) {
		const ast = parse(input.value);
		console.log(ast);
		const value = eval_expr(env, ast);
		console.log(value);
		console.log(env);
		label.innerHTML = show(value);
	}

}

add_input();
add_input();
add_input();
