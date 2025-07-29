#!/bin/bash
export release_date="$(date -u +%Y-%m-%d-%H-%M)"
export release_branch="release-$release_date"

# Get the current working directory
current_folder=$(pwd)
export local_project_path="$current_folder"
export local_build_path="$current_folder/public/build"

export project_path="/home/cbmedia/repositories/hr-management-system"

export cpanel_php_path="/opt/cpanel/ea-php82/root/usr/bin/php"
export cpanel_public_path="/home/cbmedia/public_html/hr.cbmedia-asia.com"

export cpanel_project_build_path="$project_path/public/build"
export cpanel_project_image_path="$project_path/public/image"
export cpanel_project_images_path="$project_path/public/images"

export cpanel_build_public_path="$cpanel_public_path/build"
export cpanel_image_public_path="$cpanel_public_path/image"
export cpanel_images_public_path="$cpanel_public_path/images"

function prepare_build() {
    execute_on_remote_server "
        mkdir -p $cpanel_project_build_path &&
        mkdir -p $cpanel_project_image_path &&
        mkdir -p $cpanel_project_images_path &&
        mkdir -p $cpanel_build_public_path &&
        mkdir -p $cpanel_image_public_path &&
        mkdir -p $cpanel_images_public_path
    "

    execute_on_remote_server "mkdir -p $cpanel_build_public_path"
}

function prepare_release_branch() {
    cd $local_project_path && git checkout master && git pull origin master --rebase &&
    git stash && composer install && npm install && git checkout -b "$release_branch" &&
        rm -fR public/build && npm run build && git commit -m "release: $release_date" &&
        # Delete old release branches on the server
        old_release_branch_pattern="release-$(date -d '1 week ago' +%Y-%m-%d)-*" &&
        execute_on_remote_server "cd $project_path && git branch -D \$(git branch -r | grep 'origin/$old_release_branch_pattern')"
}

function deploy_to_cpanel() {

    echo "=== Entering deploy_to_cpanel ==="

    cd $local_project_path && git push -u prod &&
        echo "Pushing changes to 'prod' remote" &&
        # Assuming this step IS necessary:
        execute_on_remote_server "rm -rf $cpanel_build_public_path" &&
        echo "Deleted old build directory on the cPanel server"

    # Direct upload for efficiency:
    scp -rp -P 6262 $local_build_path cbmedia@v11879.securev.net:$cpanel_build_public_path &&
        echo "Uploaded local build to the cPanel server"

    # Direct upload for efficiency:
    scp -rp -P 6262 $local_build_path/manifest.json cbmedia@v11879.securev.net:$cpanel_project_build_path &&
        echo "Uploaded local build to the project path"

    # Additional actions only if truly required:
    execute_on_remote_server "cd $project_path && git stash" &&
        echo "Stashed changes on the cPanel server"

    execute_on_remote_server "cd $project_path && git checkout $release_branch" &&
        echo "Checked out the release branch on the cPanel server"

    echo "=== Exiting deploy_to_cpanel ==="
}

function run_server_commands() {
    execute_on_remote_server "
        cd $project_path &&
        $cpanel_php_path artisan migrate &&
        $cpanel_php_path artisan cache:clear &&
        $cpanel_php_path artisan auth:clear-resets &&
        $cpanel_php_path artisan optimize:clear &&
        $cpanel_php_path /opt/cpanel/composer/bin/composer install --ignore-platform-req=ext-sodium
    "
}

function symlink_folders() {
    execute_on_remote_server "
        cd $project_path &&
        ln -s $cpanel_project_image_path $cpanel_image_public_path &&
        ln -s $cpanel_project_images_path $cpanel_image_public_path
    "
}

function execute_on_remote_server() {
    local ssh_command="$1"
    ssh -p 6262 cbmedia@v11879.securev.net "$ssh_command"
}

function main() {
    prepare_build
    prepare_release_branch
    deploy_to_cpanel
    symlink_folders
    run_server_commands
}

# Entry point to your script
main
