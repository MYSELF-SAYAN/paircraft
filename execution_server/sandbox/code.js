function fibonacci(n) {
    const fibSequence = [0, 1];
    while (fibSequence.length < n) {
        fibSequence.push(fibSequence[fibSequence.length - 1] + fibSequence[fibSequence.length - 2]);
    }
    return fibSequence;
}

// Print the first 10 Fibonacci numbers
fibonacci(10).forEach(num => console.log(num));