BIN = node_modules/.bin

.PHONY: bootstrap lint publish

bootstrap:
	npm install

lint:
	$(BIN)/standard

publish:
	npm publish --access public
