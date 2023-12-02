#pragma once
#include <filesystem>
#include <iostream>

using namespace std;
namespace fs = std::filesystem;

inline fs::path getAbsolutePath(string relativePath) {
    // Get the current executable path
    fs::path executablePath = fs::current_path();

    // Append the relative path
    fs::path absolutePath = executablePath / relativePath;

    return absolutePath;
}

int day1(int, std::string);

