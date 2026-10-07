function factorial(n, onStep) {
  const report = onStep || function () {};

  if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
    throw new RangeError('factorial: n must be an integer >= 0 (received: ' + n + ')');
  }

  report({ line: 1, event: 'call', n: n });

  report({ line: 2, event: 'check', n: n });

  if (n === 0) {
    report({ line: 3, event: 'base-case', n: n, value: 1 });
    return 1;
  }

  report({ line: 4, event: 'waiting', n: n });

  const child = factorial(n - 1, report);

  report({ line: 4, event: 'receive', n: n, child: child, value: n * child });

  report({ line: 4, event: 'return', n: n, value: n * child });

  return n * child;
}

function recordFactorial(n) {
  const frames = [
    { line: 1, event: 'start', n: n, child: null, stack: [] }
  ];
  const stack = [];

  function top() {
    return stack[stack.length - 1];
  }

  function snapshot(step) {
    frames.push({
      line: step.line,
      event: step.event,
      n: step.n,
      child: typeof step.child === 'number' ? step.child : null,
      stack: stack.map(function (entry) { return { ...entry }; })
    });
  }

  function openCall(step) {
    stack.push({ n: step.n, state: 'running', value: null });
    snapshot(step);
  }

  function suspendCall(step) {
    top().state = 'waiting';
    snapshot(step);
  }

  function closeCall(step) {
    top().value = step.value;
    top().state = 'done';
    snapshot(step);
    stack.pop();
  }

  factorial(n, function (step) {
    switch (step.event) {
      case 'call':
        openCall(step);
        break;

      case 'waiting':
        suspendCall(step);
        break;

      case 'base-case':
      case 'return':
        closeCall(step);
        break;

      default:
        snapshot(step);
    }
  });

  return frames;
}
