# Automated Ubuntu Local Env Setup

You can optionally setup a virtual Ubuntu environment using Vagrant. It is a tool used for building and managing virtual machine environments in a single workflow.

Although Vagrant supports [VirtualBox](https://www.virtualbox.org/), [Hyper-V](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v), [Docker](https://www.docker.com/), or [VMware Fusion](https://customerconnect.vmware.com/downloads/get-download?downloadGroup=FUS-PUBTP-2021H1), `VirtualBox` and `Docker` are the only environments that has been developed and tested thus far. If you have a need to use `Hyper-V`, or `VMware`, please create an issue and request a new feature.

## Notes

This was tested using:

- Vagrant v2.3.7
- VirtualBox v7.0.12
- Docker Desktop v4.25.0

## Prerequisites

1. You will require 4 GB of memory.
1. You will require 8 GB of disk space.
1. Ports 4200, 4300, and 5432 must be available on host environment. If you have powershell installed you can use this command to list active ports:

   ```powershell
   Get-NetTCPConnection | Where-Object { $_.State -eq 'Listen' }
   ```

1. `npm install` creates symbolic links. As a result, the Virtual Machine (VM) user: `vagrant` requires `create symbolic link` authority. In some environments, only the administrator has this authority. To resolve this issue in Windows, the following steps can be performed:
   1. Launch the `Local Security Policy` app from the `start menu` (or `Win+R`, then type `secpol.msc`)
   1. Navigate to `Local Policies` -> `User Rights Assignment`.
   1. Open the `Create symbolic links` property. By default it has only `Administrators` listed.
   1. Click `Add User or Group...` button and type `Authenticated Users` in the `Enter the object names to select` field and then press the `OK` button. This will grant `symbolic link` privilege to all users who log on with credentials.
   1. Close any open windows by clicking `OKs` and and then `log off` and `log on` to activate.
   1. Symbolic links should now work in VirtualBox shared folders without administrator privileges.

## Setup Steps

1. [Download](https://releases.hashicorp.com/vagrant/2.3.7/) Vagrant v2.3.7. _(Vagrant v2.4.0 introduced a bug that prevents the creation of a docker container. This is to be fixed in v2.4.1.)_
1. Reference these [installation](https://developer.hashicorp.com/vagrant/docs/installation) instructions.
1. Verify installation by running `vagrant -v` in a terminal session.
1. Install your provider of choice:

   - [VirtualBox](https://www.virtualbox.org/)
   - [Docker Desktop](https://docs.docker.com/desktop/)

1. If you have not already done so, fork repo to your local machine.
1. Vagrant uses a special configuration file called `Vagrantfile` that contains all the information required for the creation of a Virtual Machine (guest) on your workstation (host). It is located in your repo root directory.
1. To start the creation of your virtual environment, run one of these commands in the repo root directory. (This takes a while so be patient.)

   | Provider     | Command                      |
   | ------------ | ---------------------------- |
   | `VirtualBox` | vagrant up                   |
   | `Docker`     | vagrant up --provider docker |

1. Once the `vagrant up` command completes, you can logon into your virtual machine using this command. (password: `vagrant`)

   ```bash
   vagrant ssh
   ```

1. Here is a list of common Vagrant commands. Be sure that you are in the same directory as the Vagrantfile when running these commands!

   | Command                        | Description                                                                                                                                                   |
   | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `vagrant up`                   | For VirtualBox, creates and provisions on first run a virtual machine. After initial run, it is used to start an existing environment regardless of provider. |
   | `vagrant up --provider docker` | Starts and provisions on first run a docker container. After that, use `vagrant up` to start container.                                                       |
   | `vagrant ssh`                  | connects to the machine via SSH                                                                                                                               |
   | `vagrant suspend`              | suspends the machine (maintains state) - next start will be faster                                                                                            |
   | `vagrant halt`                 | stops the machine                                                                                                                                             |
   | `vagrant status`               | outputs status of the machine                                                                                                                                 |

1. For help on vagrant commands, at a terminal session enter:

   ```bash
   vagrant --help
   ```

## Post-Installation Notes

Accessing VM resources from Host.

### Accessing database via pgAdmin

1. Start pgAdmin
1. Open the `Register - Server` dialog
1. `General` tab:
   - Name: _Enter name of your choice_
1. `Connection` tab

   | Setting              | Value       |
   | -------------------- | ----------- |
   | Host name            | `127.0.0.1` |
   | Port                 | `5432`      |
   | Maintenance database | `postgres`  |
   | Username             | `vagrant`   |
   | Password             | `vagrant`   |
   | Save password?       | `Turn on`   |

### Accessing API app

Open a web browser to URL: <http://localhost:4300>

### Accessing Web app

Open a web browser to URL: <http://localhost:4200>

### Access VM via SSH application (such as PuTTY)

| Setting   | Value       |
| --------- | ----------- |
| host name | `localhost` |
| port      | `2222`      |
| username  | `vagrant`   |
| password  | `vagrant`   |

## Caveat

1. Before shutting down your host environment, be sure that your Vagrant machine is not running. Failing to do so may corrupt your Vagrant machine image.

1. If after install, you get this error while performing a git commit:

   ```text
   git -c user.useConfigOnly=true commit --quiet --allow-empty-message --file - 'lint-staged' is not recognized as an internal or external command, operable program or batch file. husky - pre-commit hook exited with code 1 (error)
   ```

   Run this command. However, you will need to [install](https://nodejs.org/en/download/) `Node.js 18` (this includes `npm`) in your host environment.

   ```text
   npm install --save-dev husky
   ```

1. If you have a postgres database running on your host machine at the default port `5432`, be sure to shut it down before starting up your Vagrant machine. On Windows, this can be done by stopping the postgres service. This is because postgres in your VM also listens to the same default port number. Failure to do so will result in the following error:

   ```text
   Vagrant cannot forward the specified ports on this VM, since they
   would collide with some other application that is already listening
   on these ports. The forwarded port to 5432 is already in use
   on the host machine.
   ```

1. **For VirtualBox only**, if you experience a long pause, after issuing a `vagrant up` command at the point in the process shown below, the VM is up and running, but vagrant is trying to establish a SSH session to it. Sometimes it hangs indefinitely and eventually times out. The cause is unknown.

   ```bash
   => default: Waiting for machine to boot. This may take a few minutes...
      default: SSH address: 127.0.0.1:2222
      default: SSH username: vagrant
      default: SSH auth method: private key
   ```

   To free up the process before it times out, perform the following steps:

   1. Open `Oracle VM VirtualBox Manager`.
   2. Click on the name of your VM machine in the left panel. The name starts with the name of the root folder of your repository. In our case it would be `gloss-translation_....`
   3. If the VM is running, you will see a green right arrow called `Show`. It opens a new panel where you can monitor the boot process of your VM. This should free up the vagrant session and then the boot process should continue to completion.
   4. Once the vagrant session is up, you can close down the panel, without shutting down the VM, by clicking menu `Machine/Detach GUI`.
