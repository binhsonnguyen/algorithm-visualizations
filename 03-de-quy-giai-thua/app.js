(function () {
  const byId = function (id) { return document.getElementById(id); };

  const nInput = byId('n');
  const generateButton = byId('generate');
  const dataOutput = byId('data');
  const stage = byId('stage');
  const status = byId('status');
  const runButton = byId('run');
  const nextButton = byId('next');
  const prevButton = byId('prev');
  const resetButton = byId('reset');

  const STEP_DELAY = 600;
  const INDENT = 2;

  let n = 5;
  let frames = [];
  let position = 0;
  let timer = null;

  function box(content, isActive, hasArrow, isDone) {
    const state = isActive ? ' active' : (isDone ? ' done' : '');

    return '<span class="col">' +
             '<span class="box wide' + state + '">' + content + '</span>' +
             '<span class="arrow">' + (hasArrow ? '▲' : '') + '</span>' +
           '</span>';
  }

  function row(content, depth, isActive, hasArrow, isDone) {
    return '<div style="margin-left:' + (depth * INDENT) + 'em">' +
             box(content, isActive, hasArrow, isDone) +
           '</div>';
  }

  function resultOf(frame) {
    const entry = frame.stack[frame.stack.length - 1];

    if (entry && typeof entry.value === 'number') return entry.value;
    if (typeof frame.child === 'number') return frame.n * frame.child;

    return null;
  }

  function carried(frame) {
    if (frame.event === 'waiting') return 'FACTORIAL(' + (frame.n - 1) + ')';
    if (frame.event === 'receive') return '= ' + frame.child;

    return null;
  }

  function explain(frame) {
    switch (frame.event) {
      case 'start':
        return 'start → compute ' + frame.n + '!';

      case 'call':
        if (frame.n === 0) {
          return 'call FACTORIAL(0) → 0 = 0 → reached the base case';
        }
        return 'call FACTORIAL(' + frame.n + ') → ' + frame.n +
               ' ≠ 0 → not the base case → go deeper';

      case 'check':
        if (frame.n === 0) {
          return 'FACTORIAL(0) → is 0 = 0? → yes → reached the base case';
        }
        return 'FACTORIAL(' + frame.n + ') → is ' + frame.n +
               ' = 0? → no → take the recursive branch';

      case 'base-case':
        return 'FACTORIAL(0) → 0 = 0 → base case → return 1';

      case 'waiting':
        return 'FACTORIAL(' + frame.n + ') → need ' + frame.n +
               ' × FACTORIAL(' + (frame.n - 1) + ') → call FACTORIAL(' + (frame.n - 1) + ')';

      case 'receive':
        return 'FACTORIAL(' + frame.n + ') → got ' + frame.child +
               ' from FACTORIAL(' + (frame.n - 1) + ') → ' + frame.n + ' × ' +
               frame.child + ' = ' + resultOf(frame);

      case 'return':
        return 'FACTORIAL(' + frame.n + ') → return ' + resultOf(frame) + ' to the caller';
    }

    return '';
  }

  function showData() {
    dataOutput.textContent = n;
  }

  function render() {
    const frame = frames[position];
    if (!frame) return;

    let html = '<div class="stack">';

    for (let depth = 0; depth < frame.stack.length; depth++) {
      const entry = frame.stack[depth];
      const isDone = entry.state === 'done';
      const isActive = depth === frame.stack.length - 1 && !isDone;

      let label = 'FACTORIAL(' + entry.n + ')';
      if (isDone) label += ' = ' + entry.value;

      html += row(label, depth, isActive, false, isDone);
    }

    const carriedContent = carried(frame);
    if (carriedContent !== null) {
      html += row(carriedContent, frame.stack.length, false, true, false);
    }

    html += '</div>';

    stage.innerHTML = html;
    status.textContent = explain(frame);
    updateButtons();
  }

  function updateButtons() {
    const atEnd = position >= frames.length - 1;

    prevButton.disabled = position === 0;
    nextButton.disabled = atEnd;

    if (timer !== null) {
      runButton.textContent = 'Pause';
    } else if (atEnd && frames.length > 1) {
      runButton.textContent = 'Run again';
    } else {
      runButton.textContent = 'Run';
    }
  }

  function stepForward() {
    if (position < frames.length - 1) {
      position++;
      render();
    }

    if (position >= frames.length - 1) pause();
  }

  function stepBackward() {
    pause();

    if (position > 0) {
      position--;
      render();
    }
  }

  function run() {
    if (timer !== null) {
      pause();
      return;
    }

    if (position >= frames.length - 1) {
      position = 0;
      render();
    }

    timer = setInterval(stepForward, STEP_DELAY);
    updateButtons();
  }

  function pause() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }

    updateButtons();
  }

  function goToStart() {
    pause();
    position = 0;
    render();
  }

  function rebuildFrames() {
    pause();
    frames = recordFactorial(n);
    position = 0;
    render();
  }

  function readN() {
    const value = Math.round(Number(nInput.value));

    return Number.isFinite(value) ? Math.min(12, Math.max(0, value)) : 0;
  }

  function applyN(value) {
    n = Math.min(12, Math.max(0, value));

    if (String(n) !== nInput.value) nInput.value = n;

    showData();
    rebuildFrames();
  }

  function generate() {
    applyN(2 + Math.floor(Math.random() * 7));
  }

  generateButton.addEventListener('click', generate);

  nInput.addEventListener('input', function () {
    if (nInput.value === '') return;

    applyN(readN());
  });

  runButton.addEventListener('click', run);
  nextButton.addEventListener('click', function () { pause(); stepForward(); });
  prevButton.addEventListener('click', stepBackward);
  resetButton.addEventListener('click', goToStart);

  document.addEventListener('keydown', function (event) {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;

    if (event.code === 'Space') {
      event.preventDefault();
      run();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      pause();
      stepForward();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepBackward();
    }
  });

  applyN(readN());
})();
