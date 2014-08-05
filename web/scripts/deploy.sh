script_name="${0}"
args=("$@")
arg_count=$#
current_dir="$( cd "$( dirname "${script_name}" )" && pwd )"
project_dir="$( dirname "${current_dir}" )"
config_dir="${project_dir}/config"

git pull
npm install
bower install
echo "Migrating db..."
npm run-script migrate
echo "Copying config..."
cp ~/config/*.json "${config_dir}/"
echo "Restarting reddit-scrubber..."
sudo monit restart reddit-scrubber
echo "Restarting reddit-scrubber-bot..."
sudo monit restart reddit-scrubber-bot
echo "Done."
