const std = @import("std");
const input = @embedFile("./input.txt");
//const input = @embedFile("./test.txt");
const ArrayList = std.ArrayList;

pub fn main() !void {

    var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
    defer arena.deinit();
    const alloc = arena.allocator();

    var listLeft = ArrayList(i32).init(alloc);
    defer listLeft.deinit();
    var listRight = ArrayList(i32).init(alloc);
    defer listRight.deinit();

    var it = std.mem.tokenizeScalar(u8, input, '\n');
    while (it.next()) |token| {
        // const tokenTrimmed = std.mem.trim(u8, token, " ");
        var itNum = std.mem.splitSequence(u8, token, "   ");

        const l = try std.fmt.parseInt(i32, itNum.next().?, 10);
        try listLeft.append(l);
        const r = try std.fmt.parseInt(i32, itNum.next().?, 10);
        try listRight.append(r);
    }

    std.debug.print("ListLeft: {any}\n", .{listLeft.items});
    std.debug.print("ListRight: {any}\n", .{listRight.items});

    std.mem.sort(i32, listLeft.items, {}, comptime std.sort.asc(i32));
    std.mem.sort(i32, listRight.items, {}, comptime std.sort.asc(i32));

    std.debug.print("ListLeftSorted: {any}\n", .{listLeft.items});
    std.debug.print("ListRightSorted: {any}\n", .{listRight.items});

    var listRes = ArrayList(u32).init(alloc);
    defer listRes.deinit();


    for (listLeft.items, 0..) |a, i| {
        const b = listRight.items[i];
        const abs = @abs(a - b);
        try listRes.append(abs);
    }

    std.debug.print("ListResult: {any}\n", .{listRes.items});

    var sum: u32 = 0;
    for (listRes.items) |value| {
        sum += value;
    }

    std.debug.print("Result: {}\n", .{sum});

}
