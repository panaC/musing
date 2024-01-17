const std = @import("std");
fn print(comptime fmt: []const u8, args: anytype) void {
    if (std.mem.eql(u8, std.os.getenvZ("DEBUG").?, "1")) {
        std.debug.print(fmt, args);
    } else {
        const stdout = std.io.getStdOut().writer();
        stdout.print(fmt, args) catch return;
    }
}

// doesn't work with zig run outside package path
// const input = @embedFile("../input/day1_1");

pub fn main() !void {
    const inputFilename = "in";
    const file = try std.fs.cwd().openFile(inputFilename, .{});
    defer file.close();

    var buf: [1024]u8 = undefined;
    var result: u32 = 0;
    while (try file.reader().readUntilDelimiterOrEof(&buf, '\n')) |l| {
        print("{s} {c} {c}", .{ l, l[0], l[l.len - 1] });
        const left: u8 = for (l) |c| {
            if (c >= '0' and c <= '9') break c;
        } else 0;
        var i = l.len;
        const right: u8 = while (i > 0) {
            i -= 1;
            const c = l[i];
            if (c >= '0' and c <= '9') break c;
        } else 0;
        print(" . {c} {c}\n", .{ left, right });
        const leftInt = left - '0';
        const rightInt = right - '0';
        const res = leftInt * 10 + rightInt;
        result += res;
    }
    print("{}\n", .{result});

    result = 0;
    try file.seekTo(0);
    while (try file.reader().readUntilDelimiterOrEof(&buf, '\n')) |line| {
        var left: ?isize = null;
        var right: ?isize = null;

        for (line) |c| {
            const maybeDigit = c - '0';
            if (maybeDigit >= 0 and maybeDigit <= 9) {
                if (left == null) {
                    left = maybeDigit;
                } else {
                    right = maybeDigit;
                }
            }
        }
        // result += @intCast(((left orelse 0) * 10) + (right orelse left));
        result += @intCast((left.? * 10) + (right orelse left.?));
    }
    print("{}\n", .{result});

    result = 0;
    const num = [_][]const u8{ "zero", "one", "two", "three", "for", "five", "six", "seven", "eight", "nine" };

    for (num, 0..) |v, i| {
        _ = v;
        _ = i;

        //
    }

    print("{}\n", .{result});
}
