var sample;
var fft;
var reverb, delay, lpFilter;
var playButton, killButton;
var startSlider, lengthSlider, rateSlider, ampSlider, reverbDryWetSlider, lpCutoffSlider;
var grainStart, grainLength, grainRate, sampleAmp, reverbDryWet, lpCutoff;
var grainStartPrev, grainLengthPrev, reverbDryWetPrev, lpCutoffPrev;
var fileDrop;

var delTime, delTimePrev, delTimeSlider;
var delDryWet, delDryWetPrev, delDryWetSlider;
var delFeedback, delFeedbackPrev, delFeedbackSlider;

function setup() {
	var canvas = createCanvas(windowWidth, windowHeight);
	// var canvas = createCanvas(600, 300);
	canvas.parent('dropZone');
	// canvas.filter("BLUR");

	// File Upload
	fileDrop = select('#dropZone');
	fileDrop.dragOver(() => {
		fileDrop.style("background-color", "#ccc");
		console.log("fileDrag");
	});
	fileDrop.drop((file) => {
		background(color(255, 0, 0));
		console.log("File Loaded...");

		sample.stop();
		sample = loadSound(file, sampleLoaded);
		routeSound();
	});

	
	// Buttons
	playButton = createButton("play");
	playButton.mousePressed(buttonHandler);
	playButton.position(190, 10);
	killButton = createButton("Stop");
	killButton.mousePressed(killSound);
	killButton.position(190, 38);
	
	// Sliders
	lengthSlider = createSlider(0, 5, 1, 0);
	lengthSlider.position(50,5);
	rateSlider = createSlider(0.25, 2, 1, 0);
	rateSlider.position(50, 25);
	ampSlider = createSlider(0, 2, 0.5, 0);
	ampSlider.position(235, 5);
	
	reverbDryWetSlider = createSlider(0, 1, 0, 0);
	reverbDryWetSlider.position(235, 25);
	
	lpCutoffSlider = createSlider(30, 10000, 10000, 0);
	lpCutoffSlider.position(235, 45);
	
	delDryWetSlider = createSlider(0, 1, 0, 0);
	delDryWetSlider.position(375, 5);
	delTimeSlider = createSlider(0.1, 10, 1, 0);
	delTimeSlider.position(375, 25);
	delFeedbackSlider = createSlider(0, 0.9, 0.5, 0);
	delFeedbackSlider.position(375, 45);

	// Effects, Filters, FFT
	fft = new p5.FFT();
	
	reverb = new p5.Reverb();

	delay = new p5.Delay();
	delay.setType("pingPong");

	lpFilter = new p5.LowPass();
	lpFilter.freq(20000);
	lpFilter.res(0);
	
	// sample loading
	sample = loadSound("/Granulp5/samples/carriedAway.wav",
		sampleLoaded,
		() => { background(color(255, 255, 255)); },
		() => { background(color(0, 0, 0));});
	// sample = loadSound("/p5_projects/Granulp5/samples/carriedAway.wav",
	// 	sampleLoaded,
	// 	() => { background(color(255, 255, 255)); },
	// 	() => { background(color(0, 0, 0)); });


	// Sound Routing
	routeSound();
}

function routeSound() {
	sample.disconnect();
	sample.connect(lpFilter);
	lpFilter.connect(delay);
	delay.connect(reverb);
}

function sampleLoaded() {
	if (startSlider != null) {
		startSlider.remove();
	}
	startSlider = createSlider(0, sample.duration(), 0, 0);
	startSlider.position(50, 45);
}


function buttonHandler() {
	background(color(random(255), random(255), random(255)));

	sample.jump(grainStart);
}

function killSound() {
	sample.stop();
}

function sampleLoop() {
	// startGrain();
}

function draw() {
	drawVisuals();
	pullData();
	updateSample();
	updateEffects();
	sampleLooping();
}


function drawVisuals() {
	// fft
	var waveForm = fft.waveform();
	randColor = color(random(255), random(255), random(255));
	stroke(randColor);
	fill(randColor);
	beginShape();
	vertex(0, height / 2);
	for (var i = 0; i < waveForm.length; i++) {
		var x = map(i, 0, waveForm.length, 0, width);
		var y = map(waveForm[i], -1, 1, 0, height);
		vertex(x, y);
	}
	vertex(width, height / 2);
	endShape();
}

function pullData() {
	if (sample.isLoaded()) {
		grainStart = startSlider.value();
		grainLength = lengthSlider.value();
		grainRate = rateSlider.value();
		sampleAmp = ampSlider.value();
		reverbDryWet = reverbDryWetSlider.value();
		lpCutoff = lpCutoffSlider.value();
		delTime = delTimeSlider.value();
		delDryWet = delDryWetSlider.value();
		delFeedback = delFeedbackSlider.value();
	}
}

function updateSample() {
	sample.amp(sampleAmp);
	sample.rate(grainRate);
}

function updateEffects() {
	if (reverbDryWet != reverbDryWetPrev) {
		reverb.drywet(reverbDryWet);
	}
	reverbDryWetPrev = reverbDryWet;

	if(delDryWet != delDryWetPrev){
		delay.drywet(delDryWet);
	}
	delDryWetPrev = delDryWet;

	if (delTime != delTimePrev) {
		delay.delayTime(delTime);
	}
	delTimePrev = delTime;

	if (delFeedback != delFeedbackPrev) {
		delay.feedback(delFeedback);
	}
	delFeedbackPrev = delFeedback;

	if (lpCutoff != lpCutoffPrev) {
		lpFilter.freq(lpCutoff);
	}
	lpCutoffPrev = lpCutoff;
}

function sampleLooping() {
	if (grainStart != grainStartPrev) {
		startGrain();
	}
	grainStartPrev = grainStart;

	if (grainStart != grainStartPrev || grainLength != grainLengthPrev) {
		sample.clearCues();
		sample.addCue(grainStart + grainLength, sampleLoop);
	}

	if (sample.currentTime() > grainStart + grainLength) {
		startGrain();
	}
}

function startGrain() {
	x = random(width);
	y = random(height);
	shapeSize = random(100, 200);
	angle = random(360);

	stroke(0,0,0);
	fill(random(255), random(255), random(255));

	translate(x, y);
	rotate(angle);
	shapeType = int(random(3));
	switch (shapeType) {
		case 0:
			ellipse(0, 0, shapeSize);
			break;
		case 1:
			rect(0, 0, shapeSize, shapeSize);
			break;
		case 2:
			triangle(0, 0,
				     0 + random(-shapeSize, shapeSize), 0 + random(-shapeSize, shapeSize),
				     0 + random(-shapeSize, shapeSize), 0 + random(-shapeSize, shapeSize));
			break;
		default:
			break;
	}
	rotate(-angle);
	translate(-x, -y);	
	
	background(random(255), random(255), random(255), 100);

	sample.jump(grainStart);
}