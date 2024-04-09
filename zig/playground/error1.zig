const std = @import("std");

// Define a custom error type
const MyError = error{
    InvalidInput,
    OutOfBounds,
};

// A function that performs a simple calculation, but can return an error
fn calculate(a: i32, b: i32) !i32 {
    if (a < 0 or b < 0) {
        return MyError.InvalidInput;
    }
    if (a > 100 or b > 100) {
        return MyError.OutOfBounds;
    }
    return a + b;
}

pub fn main() !void {
    // Call the calculate function and handle the error
    const result = calculate(10, 20) catch |err| {
        switch (err) {
            MyError.InvalidInput => {
                std.log.err("Invalid input provided", .{});
                return;
            },
            MyError.OutOfBounds => {
                std.log.err("Input values out of bounds", .{});
                return;
            },
        }
    };

    // If no error occurred, print the result
    std.debug.print("The result is: {}\n", .{result});
}
