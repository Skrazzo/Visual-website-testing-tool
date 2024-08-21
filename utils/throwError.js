/**
 * Prints an error to the console, and stops the script
 * @param {string} err Error message
 * @param {boolean} exit if you want to whole script to stop executing (default -> true)
 */
export function error(err = "An error has occurred", exit = true) {
    console.error(err);
    if (exit) process.exit();
}
