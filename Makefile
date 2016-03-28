SRC = src
BUILD = build
TEST = test-results

BUILD_CMD = ./node_modules/.bin/babel --plugins transform-es2015-modules-commonjs
TEST_CMD := node `node --v8-options | grep harm | awk '{print $$1}' | xargs`

SRC_FILES := $(shell echo $(SRC)/{,**/}*.js)
TEST_FILES := $(shell echo $(SRC)/{,**/}*.spec.js)
BUILD_FILES := $(patsubst $(SRC)/%, $(BUILD)/%, $(SRC_FILES))
TEST_BUILD_FILES := $(patsubst $(SRC)/%, $(BUILD)/%, $(TEST_FILES))
TEST_RESULT_FILES := $(patsubst $(SRC)/%.spec.js, $(TEST)/%.tap, $(TEST_FILES))

all: build unit-test

.PHONY: clean
test: clean-test unit-test

build: $(BUILD_FILES)
$(BUILD)/%.js: $(SRC)/%.js
	mkdir -p $(@D)
	$(BUILD_CMD) $< > $@

unit-test: $(TEST_RESULT_FILES)
$(TEST)/%.tap: $(BUILD)/%.spec.js $(BUILD)/%.js
	mkdir -p $(@D)
	$(TEST_CMD) $< > $@ && ([ $$? -eq 0 ]) || (cat $@ && rm $@)

clean: clean-build clean-test
clean-build:
	rm -r $(BUILD)
clean-test:
	rm -r $(TEST)
