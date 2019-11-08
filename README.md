# Postman CLI

A client to facilitate local development of scripts for Postman

## About

Allows for editing of Postman Scripts inside your chosen editor, without having to deal with JSON structures and importing/exporting collections from Postman.

Using `require` works within these scripts as Browserify will run whenever you run the `postman sync` command. This means you can reuse local files as well as pull in external modules from NPM as they will all be bundled automaticaly when you sync.

## Installation

`npm i -g postman-cli`

## Configuration

Copy `.postman.json.example` to `.postman.json` and complete appropriately.

You *must complete* the `POSTMAN_API_KEY` field. Run `postman setup` to configure the other fields through the CLI.

See the Postman Learning Center for [details on creating an API key](https://learning.getpostman.com/docs/postman/postman-api/intro-api/).

## Usage

### `postman bootstrap`

Will retrieve your collection via the Postman API and convert all your scripts to editable files.

### `postman sync`

Will update your collection via the Postman API, converting all the files back to the Postman Collection format.

## Other

Use `pm` instead of `postman` for extra speed.

Use `pm --help` to see all commands.
