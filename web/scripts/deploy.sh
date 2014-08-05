script_name="${0}"
args=("$@")
arg_count=$#
current_dir="$( cd "$( dirname "${script_name}" )" && pwd )"
project_dir="$( dirname "${current_dir}" )"
config_dir="${project_dir}/config"

git pull
npm install
bower install
npm run-script migrate
cp ~/config/*.json "${config_dir}/"
sudo monit restart reddit-scrubber
sudo monit restart reddit-scrubber-bot
