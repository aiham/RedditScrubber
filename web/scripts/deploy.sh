script_name="${0}"
args=("$@")
arg_count=$#
current_dir="$( cd "$( dirname "${script_name}" )" && pwd )"
project_dir="$( dirname "${current_dir}" )"
config_dir="${project_dir}/config"

echo "Updating repository..."
git pull
echo "Installing NPM packages..."
npm install
echo "Installing Bower packages..."
bower install
echo "Migrating db..."
npm run-script migrate
echo "Copying config..."
cp ~/config/*.json "${config_dir}/"
echo "grunt build..."
grunt build
echo "Restarting reddit-scrubber..."
sudo monit restart reddit-scrubber
echo "Restarting reddit-scrubber-bot..."
sudo monit restart reddit-scrubber-bot
echo "Done."
