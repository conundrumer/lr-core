# Make does not offer a recursive wildcard function, so here's one:
rwildcard=$(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2))

SRC = src
BUILD = build
TEST = test-results

BUILD_CMD = ./node_modules/.bin/babel --plugins transform-es2015-modules-commonjs
TEST_CMD := node `node --v8-options | grep harm | awk '{print $$1}' | xargs`

SRC_FILES := $(call rwildcard,$(SRC)/,*.js) $(call rwildcard,$(SRC)/,*.json)
BUILD_FILES := $(patsubst $(SRC)/%, $(BUILD)/%, $(SRC_FILES))
TEST_RESULT_FILES := $(patsubst $(SRC)/%.spec.js, $(TEST)/%.tap, $(SRC_FILES))

all: build unit-test

.PHONY: clean
test: clean-test unit-test

build: $(BUILD_FILES)
$(BUILD)/%.js: $(SRC)/%.js
	@echo Build: $< \> $@
	@mkdir -p $(@D)
	@$(BUILD_CMD) $< > $@
$(BUILD)/%.json: $(SRC)/%.json
	@mkdir -p $(@D)
	cp $< $@

unit-test: $(TEST_RESULT_FILES)
$(TEST)/%.tap: $(BUILD)/%.spec.js $(BUILD)/%.js
	@printf "Test: $< > $@"
	@mkdir -p $(@D)
	@$(TEST_CMD) $< > $@ 2>> $@ && ([ $$? -eq 0 ] && printf " PASSED\n") || (printf " FAILED\n" && cat $@)
$(TEST)/%.tap: $(BUILD)/%.spec.js $(BUILD)/%/*.js $(BUILD)/%/**/*.js
	@printf "Test: $< > $@"
	@mkdir -p $(@D)
	@$(TEST_CMD) $< > $@ 2>> $@ && ([ $$? -eq 0 ] && printf " PASSED\n") || (printf " FAILED\n" && cat $@)

clean: clean-build clean-test
clean-build:
	rm -r $(BUILD)
clean-test:
	rm -r $(TEST)

watch:
	@echo Watching for changes...
	@fswatch $(SRC) | xargs -n1 -I{} make

