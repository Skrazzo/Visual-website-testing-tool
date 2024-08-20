export function error(err = "An error has occurred", exit = true) {
    console.error(err);
    if (exit) process.exit();
}
