(function () {
  const byId = function (id) { return document.getElementById(id); };

  const sizeInput = byId('size');
  const targetInput = byId('target');
  const generateButton = byId('generate');
  const dataOutput = byId('data');
  const stage = byId('stage');
  const status = byId('status');
  const runButton = byId('run');
  const nextButton = byId('next');
  const prevButton = byId('prev');
  const resetButton = byId('reset');

  const STEP_DELAY = 600;

  let values = [];
  let target = 0;
  let frames = [];
  let position = 0;
  let timer = null;

  function randomValues(count) {
    const pool = [];
    for (let value = 1; value <= 99; value++) pool.push(value);

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = pool[i];
      pool[i] = pool[j];
      pool[j] = swap;
    }

    return pool.slice(0, count);
  }

  function box(content, isActive, hasArrow, isDone) {
    const state = isActive ? ' active' : (isDone ? ' done' : '');

    return '<span class="col">' +
             '<span class="box' + state + '">' + content + '</span>' +
             '<span class="arrow">' + (hasArrow ? '▲' : '') + '</span>' +
           '</span>';
  }

  function explain(frame) {
    const array = frame.values;
    const wanted = frame.target;

    switch (frame.line) {
      case 1:
        return 'start → searching for x = ' + wanted + ' in an array of ' + array.length + ' elements';

      case 3: {
        const value = array[frame.index];
        return 'compare a[' + frame.index + '] = ' + value + ' with x = ' + wanted +
               ' → ' + value + (frame.matches ? ' = ' : ' ≠ ') + wanted +
               ' → ' + (frame.matches ? 'found' : 'move to the next box');
      }

      case 4:
        return 'a[' + frame.index + '] = x → stop the loop → return ' + frame.index;

      case 5:
        return 'checked all ' + array.length + ' boxes → none equals x = ' + wanted + ' → return -1';
    }

    return '';
  }

  function showData() {
    dataOutput.innerHTML = values.map(function (value) {
      return '<code>' + value + '</code>';
    }).join(' ');
  }

  function render() {
    const frame = frames[position];
    if (!frame) return;

    const examined = frame.line === 5 ? frame.values.length : Math.max(0, frame.index);

    let html = '<p>x = ' + box(frame.target, false, true, false) + '</p>';
    html += '<p>';

    for (let index = 0; index < frame.values.length; index++) {
      html += box(frame.values[index], index === frame.index, false, index < examined);
    }

    html += '</p>';

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
    frames = recordLinearSearch(values, target);
    position = 0;
    render();
  }

  function generate() {
    const count = Math.max(1, Math.min(15, Number(sizeInput.value) || 1));
    sizeInput.value = count;

    values = randomValues(count);
    target = values[Math.floor(Math.random() * values.length)];
    targetInput.value = target;

    showData();
    rebuildFrames();
  }

  generateButton.addEventListener('click', generate);

  targetInput.addEventListener('input', function () {
    if (targetInput.value === '') return;

    target = Number(targetInput.value);
    if (Number.isFinite(target)) rebuildFrames();
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

  generate();
})();
