
const env = new Map;
env.set('x', Value.Vector());

document.getElementById('codess').addEventListener('input', evt => {
	const ast = parse(evt.target.value);
	console.log(ast);
	const value = eval_expr(env, ast);
	console.log(value);
	console.log(env);
	document.getElementById('codessresult').innerHTML = show(value);
});
