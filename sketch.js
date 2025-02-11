let sample;
let fft;
let reverb, delay, lpFilter;
let playButton, killButton;
let startSlider, lengthSlider, rateSlider, ampSlider, reverbDryWetSlider, lpCutoffSlider;
let grainStart, grainLength, grainRate, sampleAmp, reverbDryWet, lpCutoff;
let grainStartPrev, grainLengthPrev, reverbDryWetPrev, lpCutoffPrev;
let fileDrop;

let delTime, delTimePrev, delTimeSlider;
let delDryWet, delDryWetPrev, delDryWetSlider;
let delFeedback, delFeedbackPrev, delFeedbackSlider;

function windowResized() {
  setup();
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("dropZone");

  // File Upload
  fileDrop = select("#dropZone");
  fileDrop.dragOver(() => {
    fileDrop.style("background-color", "#ccc");
  });
  fileDrop.drop((file) => {
    background(color(255, 0, 0));
    sample.stop();
    sample = loadSound(file, sampleLoaded);
    console.log("File Loaded...");
    routeSound();
  });

  // Buttons
  playButton = createButton("Play");
  playButton.position(160, 20);
  playButton.mousePressed(() => {
    background(color(random(255), random(255), random(255)));
    sample.jump(grainStart);
  });

  killButton = createButton("Stop");
  killButton.position(160, 48);
  killButton.mousePressed(() => sample.stop());

  // Sliders
  lengthSlider = createSlider(0, 5, 1, 0);
  lengthSlider.position(20, 15);
  rateSlider = createSlider(0.25, 2, 1, 0);
  rateSlider.position(20, 35);
  // ? startSlider is set after sample is loaded in sampleLoaded()

  ampSlider = createSlider(0, 2, 0.5, 0);
  ampSlider.position(205, 15);
  reverbDryWetSlider = createSlider(0, 1, 0, 0);
  reverbDryWetSlider.position(205, 35);
  lpCutoffSlider = createSlider(30, 10000, 10000, 0);
  lpCutoffSlider.position(205, 55);

  delDryWetSlider = createSlider(0, 1, 0, 0);
  delDryWetSlider.position(345, 15);
  delTimeSlider = createSlider(0, 1, 1, 0);
  delTimeSlider.position(345, 35);
  delFeedbackSlider = createSlider(0, 0.9, 0.5, 0);
  delFeedbackSlider.position(345, 55);

  // Effects, Filters, FFT
  fft = new p5.FFT();
  reverb = new p5.Reverb();
  delay = new p5.Delay();
  delay.setType("pingPong");

  lpFilter = new p5.LowPass();
  lpFilter.freq(20000);
  lpFilter.res(0);

  soundFormats("wav");
  sample = loadSound(
    "samples/carriedAway.wav",
    sampleLoaded,
    () => background(color(255, 255, 255)),
    () => background(color(0, 0, 0))
  );

  routeSound();
}

function draw() {
  drawVisuals();
  pullData();
  updateSample();
  updateEffects();
  sampleLooping();
}

function routeSound() {
  sample.disconnect();
  sample.connect(lpFilter);
  lpFilter.connect(delay);
  delay.connect(reverb);
}

function draw() {
  drawVisuals();
  pullData();
  updateSample();
  updateEffects();
  sampleLooping();
}

function sampleLoaded() {
  if (startSlider != null) {
    startSlider.remove();
  }
  startSlider = createSlider(0, sample.duration(), 0, 0);
  startSlider.position(20, 55);
}

function drawVisuals() {
  // fft
  const waveForm = fft.waveform();
  randColor = color(random(255), random(255), random(255));
  stroke(randColor);
  fill(randColor);
  beginShape();
  vertex(0, height / 2);
  for (let i = 0; i < waveForm.length; i++) {
    const x = map(i, 0, waveForm.length, 0, width);
    const y = map(waveForm[i], -1, 1, 0, height);
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

  if (delDryWet != delDryWetPrev) {
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

  if (sample.currentTime() > grainStart + grainLength) {
    startGrain();
  }
}

function startGrain() {
  const x = random(width);
  const y = random(height);
  const shapeSize = random(100, 200);
  const angle = random(360);
  const shapeType = int(random(3));

  stroke(0, 0, 0);
  fill(random(255), random(255), random(255));

  translate(x, y);
  rotate(angle);

  switch (shapeType) {
    case 0:
      ellipse(0, 0, shapeSize);
      break;
    case 1:
      rect(0, 0, shapeSize, shapeSize);
      break;
    case 2:
      triangle(
        0,
        0,
        0 + random(-shapeSize, shapeSize),
        0 + random(-shapeSize, shapeSize),
        0 + random(-shapeSize, shapeSize),
        0 + random(-shapeSize, shapeSize)
      );
      break;
    default:
      break;
  }
  rotate(-angle);
  translate(-x, -y);

  background(random(255), random(255), random(255), 100);

  sample.jump(grainStart);
}
