# -*- mode: ruby -*-
# vi: set ft=ruby :

# NOTES:
# This version was tested using Windows 11 Home Edition
# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # For a complete reference of configuration options, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "generic/ubuntu2210"

  # Configure for application API
  config.vm.network "forwarded_port", guest: 4300, host: 4300, host_ip: "127.0.0.1"

  # Configure for application Web
  config.vm.network "forwarded_port", guest: 4200, host: 4200, host_ip: "127.0.0.1"

  # Configure for database
  config.vm.network "forwarded_port", guest: 5432, host: 5432, host_ip: "127.0.0.1"

  # Mount repo project root folder. 
  config.vm.synced_folder ".", "/home/vagrant/vmrepo", type: "virtualbox"

  # Disable the default share of the current code directory. Doing this
  # provides improved isolation between the vagrant box and your host
  # by making sure your Vagrantfile isn't accessable to the vagrant box.
  # If you use this you may want to enable additional shared subfolders as
  # shown above.
  config.vm.synced_folder ".", "/vagrant", disabled: true

  # Use VBoxManage to customize the VM.
  # Enable creation of symbolic links on dir /home/vagrant/vmrepo
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 4096  # Set RAM in MB (4GB in this example)
    vb.cpus = 2      # Set the number of CPU cores
    vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate//home/vagrant/vmrepo", "1"]
  end

  # Echo current start time stamp
  config.vm.provision "shell", name: "starttimestamp", inline: <<-SHELL
    echo " "  
    echo "Provisioning started at: $(date +%Y-%m-%d_%H:%M:%S)"
    echo " "
  SHELL

  # Install Node.js 18
  config.vm.provision "shell", name: "nodejs", inline: <<-SHELL
    echo " " 
    echo "Installing Node.js 18..."
    echo "Provisioning with root access"

    # Update resynchronizes the package index files from their sources. 
    sudo apt update

    # 1. Download and import the Nodesource GPG key
    sudo apt install -y ca-certificates curl gnupg
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

    # 2. Create deb repository
    NODE_MAJOR=18
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

    # 3. Run Update and Install
    sudo apt update
    sudo apt install nodejs -y
    echo "End of: Installing Node.js 18"
  SHELL

  # Install Postgres 14
  config.vm.provision "shell", name: "postgres", inline: <<-SHELL
    echo " " 
    echo "Starting Postgres 14..."
    echo "Provisioning with root access"

    echo "Installing Postgres 14..."

    # 1. Create the file repository configuration:
    sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

    # 2. Import the repository signing key:
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

    # 3. Update the package lists
    sudo apt update

    # 4. Install the latest version of PostgreSQL.
    # If you want a specific version, use 'postgresql-14' or similar instead of 'postgresql':
    sudo apt -y install postgresql-14

    # 5. Create a PostgreSQL user with CREATEDB and CREATEROLE privileges
    echo "sudo -u postgres psql -c \"CREATE USER vagrant WITH PASSWORD 'vagrant' CREATEDB CREATEROLE;\""
    sudo -u postgres psql -c "CREATE USER vagrant WITH PASSWORD 'vagrant' CREATEDB CREATEROLE;"

    # 6. Create a new database owned by the 'vagrant' user
    echo "sudo -u postgres psql -c \"CREATE DATABASE gloss_translation OWNER vagrant;\""
    sudo -u postgres psql -c "CREATE DATABASE gloss_translation OWNER vagrant;"

    # 7. Restart PostgreSQL to apply changes (may be necessary depending on your setup)    
    sudo service postgresql restart

    echo "End of: Installing Postgres 14"
  SHELL

  # Update .profile to cd into /home/vagrant/vmrepo
  config.vm.provision "shell", name: "profile", privileged: false, inline: <<-SHELL
    echo " " 
    echo "Setting up profile for /home/vagrant/vmrepo"
    echo "Provisioning with user access"
    if !(grep -q "cd /home/vagrant/vmrepo" /home/vagrant/.profile) then
      echo "Appending cd /home/vagrant/vmrepo to .profile"
      echo "cd /home/vagrant/vmrepo" >> /home/vagrant/.profile
    fi
    echo "End of profile"
  SHELL

  # Create .env.local files
  config.vm.provision "shell", name: "env", privileged: false, inline: <<-SHELL
    echo " " 
    echo "Setting up .env.local files"
    echo "Provisioning with user access"
    echo "Performing database project setup..."
    echo "Creating .env.local files with DATABASE_URL"

    echo "DATABASE_URL=postgres://vagrant:vagrant@localhost:5432/gloss_translation" >  /home/vagrant/vmrepo/packages/api/.env.local
    echo "DATABASE_URL=postgres://vagrant:vagrant@localhost:5432/gloss_translation" >  /home/vagrant/vmrepo/packages/db/.env.local

    echo "End of .env.local files"
  SHELL

  # Resolve File Watcher Limit Issue
  config.vm.provision "shell", name: "issue", inline: <<-SHELL
    echo " " 
    echo "Resolving File Watcher Limit Issue..."
    echo "Provisioning with root access"
    # Define the line to check for
    line_to_check="fs.inotify.max_user_watches=524288"
     
     # Check if the line exists in /etc/sysctl.conf
     if grep -qF "$line_to_check" /etc/sysctl.conf; then
       echo "Line already exists. Nothing to do."
     else
       # Append the line to the end of the file
       echo "$line_to_check" | sudo tee -a /etc/sysctl.conf
       echo "Line added to /etc/sysctl.conf."
     fi
     echo "End of File Watcher Limit Issue"
  SHELL
   
  # Install npm packages
  config.vm.provision "shell", name: "npm", privileged: false, inline: <<-SHELL
    echo " " 
    echo "Setting up npm"
    echo "Provisioning with user access"
    echo "cd /home/vagrant/vmrepo"
    cd /home/vagrant/vmrepo

    echo "Setting nx as global..."
    sudo npm i -g nx

    echo "Performing npm install..."
    npm install

    echo "npm provisioning completed."
  SHELL

  # Run db migrations with Nx Prisma and restore database from seed dump
  config.vm.provision "shell", name: "dbsetup", privileged: false, inline: <<-SHELL
    echo " " 
    echo "Setting up database"
    echo "Provisioning with user access"
    echo "cd /home/vagrant/vmrepo"
    cd /home/vagrant/vmrepo
    echo "Running db migrations with Nx Prisma"
    echo "nx prisma db migrate reset --force"
    nx prisma db migrate reset --force

    echo "Restoring database from seed dump"
    echo "pg_restore -Fc --format=custom --dbname=postgres://vagrant:vagrant@localhost:5432/gloss_translation /home/vagrant/vmrepo/data/seed.dump"
    pg_restore -Fc --format=custom --dbname=postgres://vagrant:vagrant@localhost:5432/gloss_translation /home/vagrant/vmrepo/data/seed.dump

    echo "End of dbsetup"
  SHELL

  # Configure database for host access
  config.vm.provision "shell", name: "dbconfig", inline: <<-SHELL
    echo " " 
    echo "Configuring database for host access"
    echo "Provisioning with root access"

    echo "Setting Progresql to listen on all interfaces"
    # Define the search and replace strings
    commented_str="#listen_addresses = 'localhost'"
    replace_str="listen_addresses = '*'"

    # Check if the search string exists in postgresql.conf
    if grep -q "^ *$replace_str" /etc/postgresql/14/main/postgresql.conf; then
      echo "String: $replace_str already exists in postgresql.conf"
    else
      # Check if the commented string exists in postgresql.conf
      if grep -q "^ *$commented_str" /etc/postgresql/14/main/postgresql.conf; then
        # Replace the commented string with the replace string
        sudo sed -i "s/^ *$commented_str/$replace_str/" /etc/postgresql/14/main/postgresql.conf
        echo "String: $replace_str has been setup in postgresql.conf"
      else
        # Append the replace string to postgresql.conf
        echo "$replace_str" | sudo tee -a /etc/postgresql/14/main/postgresql.conf
        echo "String: $replace_str has been appended to postgresql.conf"
      fi
    fi
    echo "Adding host lines to pg_hba.conf"
    # Get the default gateway IP address
    gateway_IP=$(ip route | awk '/default/ { print $3 }')
    echo "Default gateway IP address: $gateway_IP"

    # Define the lines to append for database host access
    line1="host    postgres    all    $gateway_IP/32    md5"
    line2="host    gloss_translation    all    $gateway_IP/32    md5"

    # Check if the lines already exist in pg_hba.conf
    if grep -Fxq "$line1" /etc/postgresql/14/main/pg_hba.conf && grep -Fxq "$line2" /etc/postgresql/14/main/pg_hba.conf; then
      echo "host lines already exist in pg_hba.conf"
    else
      # Append the lines to pg_hba.conf
      echo "$line1" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
      echo "$line2" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
      echo "host lines have been added to pg_hba.conf"
    fi

    # Restart PostgreSQL to apply changes
    sudo service postgresql restart

    echo "End of database configuration"
  SHELL

    # Echo current end time stamp
    config.vm.provision "shell", name: "endtimestamp", inline: <<-SHELL 
      echo " "
      echo "Provisioning ended at: $(date +%Y-%m-%d_%H:%M:%S)"
      echo " "
    SHELL
    
  end
