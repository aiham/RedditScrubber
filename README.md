**Note:** Not maintained

# Reddit Scrubber

Removes comments and posts from your Reddit user page

## Web Interface

Coming soon

## Command Line Interface

### Requirements

- Node.js
- A Reddit.com user account

### Installation

1. Grab the source: `git clone https://github.com/aiham/RedditScrubber.git`
2. Install the NPM packages: `npm install`
3. Create your own Reddit app: https://ssl.reddit.com/prefs/apps/
  - Make sure you select `script`
  - Redirect URI is a required field but the contents are not important
4. Update the `cli/config.js` file with the following:
  - Your Reddit username
  - Your Reddit password
  - The client ID of the app you just created (It should be under the app name)
  - The secret of the app you just created
5. Run the script using: `node cli/main.js`

### config.json

- `type` - Must be `posts`, `comments` or `all`
- `debug` - Set to `true` if you wish to watch the script running each step
- `username` - Your Reddit.com username
- `password` - Your Reddit.com password
- `client_id` - Your Reddit.com app client ID
- `client_secret` - Your Reddit.com app secret
