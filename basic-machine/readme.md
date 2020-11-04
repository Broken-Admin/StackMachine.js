## Information

- A basic interface which interacts with the modules which comprise the CPU. Similar to a tape loader - if you're familiar with what that is - it loads the program provided into the memory of the machine and executes it, providing some information with each step.
- Beware that this interface does not provide checking of instructions, such as attempting to pop an item off the stack when the stack is empty, which would cause the machine to error. 