let bufferSize = 256;
let inputChannels = 2;
let outputChannels = 2;
let gainSlider, mixSlider;

let effectParams = {
	gain: 1,
	mix: 0.5
};

let audioCtx = new AudioContext();
let scriptNode = audioCtx.createScriptProcessor(bufferSize, inputChannels, outputChannels);
let source = audioCtx.createBufferSource();

let audioFile = "audioFile.mp3";

let audio1;
let audio2;

function setup() {
	getData();
	gainSlider = createSlider(0, 100, 100);
	gainSlider.position(10, 10);
	mixSlider = createSlider(0, 100, 100);
	mixSlider.position(10, 30);
}

function draw() {
	effectParams.gain = gainSlider.value() / 100;
	effectParams.mix = mixSlider.value() / 100;
}

function getData() {
	request = new XMLHttpRequest();
	request.open("GET", audioFile, true);
	request.responseType = "arraybuffer";
	request.onload = () => {
		decodeData(request.response);
	};
	request.send();
}

function decodeData(data) {
	audioCtx.decodeAudioData(
		data,
		buffer => {
			myBuffer = buffer;
			source.buffer = myBuffer;
			play();
		},
		e => {
			"Error with decoding audio data" + e.err;
		}
	);
}

function play() {
	source.connect(scriptNode);
	scriptNode.connect(audioCtx.destination);
	source.start();
}

scriptNode.onaudioprocess = APE => {
	let inputBuffer = APE.inputBuffer;
	let outputBuffer = APE.outputBuffer;

	for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
		let inputData = inputBuffer.getChannelData(channel);
		let outputData = outputBuffer.getChannelData(channel);

		inputData = audioKernel(inputData, effectParams.gain, effectParams.mix); // process with GPU

		for (let sample = 0; sample < inputBuffer.length; sample++) outputData[sample] = inputData[sample];
	}
};
