CXX := clang
CXXFLAGS := -std=c++23 -Wall -Wextra -pedantic -lstdc++
SRC_DIR := src
INC_DIR := include
TEST_DIR := tests
BUILD_DIR := build
TARGET := aoc
TEST_TARGET := MyTests
GTEST_DIR := /opt/homebrew/Cellar/googletest/1.14.0

# Find all source files in the source directory
SOURCES := $(wildcard $(SRC_DIR)/*.cpp)
# Create a list of object files in the build directory
OBJECTS := $(patsubst $(SRC_DIR)/%.cpp, $(BUILD_DIR)/%.o, $(SOURCES))

# Find all test source files in the tests directory
TEST_SOURCES := $(wildcard $(TEST_DIR)/*.cpp)
# Create a list of test object files in the build directory
TEST_OBJECTS := $(patsubst $(TEST_DIR)/%.cpp, $(BUILD_DIR)/%.o, $(TEST_SOURCES))

# Include directories for the compiler
INC := -I$(INC_DIR) -I$(GTEST_DIR)/include

# Linker flags for GoogleTest
GTEST_LIBS := $(GTEST_DIR)/lib/libgtest_main.a $(GTEST_DIR)/lib/libgtest.a -lpthread

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) $(INC) $^ -o $(TARGET)

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp
	@mkdir -p $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) $(INC) -c $< -o $@

test: $(TEST_TARGET)
	./$(TEST_TARGET)

$(TEST_TARGET): $(TEST_OBJECTS) $(OBJECTS)
	$(CXX) $(CXXFLAGS) $(INC) $^ -o $(TEST_TARGET) $(GTEST_LIBS)

$(BUILD_DIR)/%.o: $(TEST_DIR)/%.cpp
	@mkdir -p $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) $(INC) -c $< -o $@

.PHONY: clean test

clean:
	rm -rf $(BUILD_DIR) $(TARGET) $(TEST_TARGET)

