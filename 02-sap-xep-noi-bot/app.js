(function () {
  const byId = function (id) { return document.getElementById(id); };

  const sizeInput = byId('size');
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
  let frames = [];
  let position = 0;
  let timer = null;

  function randomValues(count) {
    const pool = [];
    for (let value = 5; value <= 99; value++) pool.push(value);

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = pool[i];
      pool[i] = pool[j];
      pool[j] = swap;
    }

    return pool.slice(0, count);
  }

  function box(content, isActive, hasArrow, extraClass, isDone) {
    const state = isActive ? ' active' : (isDone ? ' done' : '');

    return '<span class="col' + (extraClass || '') + '">' +
             '<span class="box' + state + '">' + content + '</span>' +
             '<span class="arrow">' + (hasArrow ? '▲' : '') + '</span>' +
           '</span>';
  }

  function explain(frame) {
    const array = frame.values;

    switch (frame.line) {
      case 1:
        return 'start → array of ' + array.length + ' elements → no box has a fixed position yet';

      case 2:
        return 'pass ' + (frame.i + 1) +
               (frame.i > 0 ? ' → a[' + frame.sortedFrom + '] just got its final position'
                            : ' → no box fixed yet') +
               ' → scan a[0..' + (array.length - 1 - frame.i) + ']';

      case 3:
        return 'pass ' + (frame.i + 1) + ' → set swapped = false';

      case 4:
        return 'pass ' + (frame.i + 1) + ' → inner loop: j runs from 0 to ' + (array.length - 2 - frame.i);

      case 5: {
        const left = array[frame.j];
        const right = array[frame.j + 1];
        const sign = left > right ? ' > ' : (left < right ? ' < ' : ' = ');
        return 'compare a[' + frame.j + '] = ' + left + ' with a[' + (frame.j + 1) + '] = ' + right +
               ' → ' + left + sign + right +
               ' → ' + (left > right ? 'swap' : 'keep');
      }

      case 6:
        return 'swap a[' + frame.j + '] and a[' + (frame.j + 1) + '] → ' +
               array[frame.j] + ', ' + array[frame.j + 1];

      case 7:
        return 'pass ' + (frame.i + 1) + ' → no swap happened → the array is sorted → stop early';

      case 8:
        return 'done → return the sorted array';
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

    const pair = frame.line === 5 ? frame.comparing
               : frame.line === 6 ? frame.swapping
               : [];
    const activeIndex = pair.length ? pair[0] : -1;
    const arrowIndex = pair.length ? pair[1] : -1;
    const sliding = frame.line === 6 && pair.length === 2;

    let html = '<p>';

    for (let index = 0; index < frame.values.length; index++) {
      let extra = '';
      if (sliding && index === activeIndex) extra = ' slide-from-right';
      if (sliding && index === arrowIndex) extra = ' slide-from-left';

      html += box(frame.values[index], index === activeIndex, index === arrowIndex, extra,
                  index >= frame.sortedFrom);
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
    frames = recordBubbleSort(values.slice());
    position = 0;
    render();
  }

  function generate() {
    const count = Math.max(4, Math.min(12, Number(sizeInput.value) || 8));
    sizeInput.value = count;

    values = randomValues(count);
    showData();
    rebuildFrames();
  }

  generateButton.addEventListener('click', generate);

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
