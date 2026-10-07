function bubbleSort(values, onStep) {
  const report = onStep || function () {};
  const size = values.length;

  for (let i = 0; i <= size - 2; i++) {
    report({ line: 2, i: i });

    let swapped = false;
    report({ line: 3, i: i });

    for (let j = 0; j <= size - 2 - i; j++) {
      if (j === 0) report({ line: 4, i: i, j: j });

      const left = values[j];
      const right = values[j + 1];

      report({ line: 5, i: i, j: j });

      if (left > right) {
        values[j] = right;
        values[j + 1] = left;
        swapped = true;

        report({ line: 6, i: i, j: j });
      }
    }

    if (swapped === false) {
      report({ line: 7, i: i });
      return values;
    }
  }

  report({ line: 8 });
  return values;
}

function recordBubbleSort(values) {
  const size = values.length;
  let sortedFrom = size;

  const frames = [{
    line: 1,
    i: -1,
    j: -1,
    values: values.slice(),
    sortedFrom: size,
    comparing: [],
    swapping: []
  }];

  bubbleSort(values, function (step) {
    if (step.line === 2) sortedFrom = size - step.i;
    if (step.line === 7 || step.line === 8) sortedFrom = 0;

    const pair = [step.j, step.j + 1];

    frames.push({
      line: step.line,
      i: typeof step.i === 'number' ? step.i : -1,
      j: typeof step.j === 'number' ? step.j : -1,
      values: values.slice(),
      sortedFrom: sortedFrom,
      comparing: step.line === 5 ? pair : [],
      swapping: step.line === 6 ? pair : []
    });
  });

  return frames;
}
