# reddit-scrubber-cli

[![NPM version](https://badge.fury.io/js/reddit-scrubber-cli.svg)](http://badge.fury.io/js/reddit-scrubber-cli)

Removes comments and posts from your Reddit user page.

## Requirements

- [Node.js][]
- [reddit-oauth][]
- [Reddit app][]

[Node.js]: http://nodejs.org/
[reddit-oauth]: https://github.com/aiham/reddit-oauth
[Reddit app]: https://ssl.reddit.com/prefs/apps

## Installation

```sh
npm install reddit-scrubber-cli
```

## Usage

- Create a Reddit.com app: https://ssl.reddit.com/prefs/apps
  - Make sure you select `script`
  - `redirect uri` is not important but must be filled in with something
- Edit the config.json file with your username, password, app ID and app secret
  - `type` - Can be: `all`, `posts` or `comments`
- Run with `node main.js`
