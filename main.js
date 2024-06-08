
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

	let ok = true;
	for (const {input, label} of inputs) {
		if (ok) {
			try {
				const ast = parse(input.value);
				console.log(ast);
				const value = eval_expr(env, ast);
				console.log(value);
				console.log(env);
				label.innerHTML = show(value);
				label.style.color = "black";
			} catch (ex) {
				label.innerHTML = ex.toString();
				label.style.color = "red";
				ok = false;
			}
		} else {
			label.innerHTML = '-';
			label.style.color = "black";
		}
	}

}

add_input();
add_input();
add_input();
