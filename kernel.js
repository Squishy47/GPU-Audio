const gpu = new GPU();

const audioKernel = gpu
	.createKernel(function(x, gain, mix) {
		let index = this.thread.x;
		let data = x[index] * mix + 0 * (1 - mix);
		return data * gain;
	})
	.setOutput([bufferSize]);

const test = gpu.createKernelMap(
	{
		addResult: function add(a, b) {
			return a + b;
		},
		multiplyResult: function multiply(a, b) {
			return a * b;
		}
	},
	function(a, b, c) {
		return multiply(add(a[this.thread.x], b[this.thread.x]), c[this.thread.x]);
	}
);

test(1, 1, 1);
