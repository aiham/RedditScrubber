#!/bin/bash

# --------------------------------------------------------------

script_name="${0}"
args=("$@")
arg_count=$#
current_dir="$( cd "$( dirname "${script_name}" )" && pwd )"
project_dir="$( dirname "${current_dir}" )"
config_dir="${project_dir}/config"
db_config_file="${project_dir}/config/db.json"
sequelize="${project_dir}/node_modules/.bin/sequelize"

cd "${project_dir}" && ${sequelize} --config "${db_config_file}" -m
