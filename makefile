SRC = $(wildcard src/*.js)
LIB = $(SRC:src/%.js=lib/%.js)

lib: $(LIB)
lib/%.js: src/%.js
	mkdir -p $(@D)
	node_modules/6to5/bin/6to5/index.js $< -o $@

test:
	node test/run.js

.PHONY: test
