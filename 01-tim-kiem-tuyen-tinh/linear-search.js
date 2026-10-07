function linearSearch(values, target, onStep) {
  const report = onStep || function () {};
  const size = values.length;

  for (let index = 0; index < size; index++) {
    const matches = values[index] === target;

    report({ line: 3, index: index, matches: matches });

    if (matches) {
      report({ line: 4, index: index, matches: true, found: true });
      return index;
    }
  }

  report({ line: 5, index: -1 });
  return -1;
}

function recordLinearSearch(values, target) {
  const frames = [{
    line: 1,
    index: -1,
    matches: false,
    found: false,
    target: target,
    values: values.slice()
  }];

  linearSearch(values, target, function (step) {
    frames.push({
      line: step.line,
      index: typeof step.index === 'number' ? step.index : -1,
      matches: !!step.matches,
      found: !!step.found,
      target: target,
      values: values.slice()
    });
  });

  return frames;
}
