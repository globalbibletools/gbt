# Automated Ubuntu Local Env Setup

You can optionally setup a virtual Ubuntu environment using Vagrant. It is a tool used for building and managing virtual machine environments in a single workflow.

Although Vagrant supports [VirtualBox](https://www.virtualbox.org/), [Hyper-V](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v), [Docker](https://www.docker.com/), or [VMware Fusion](https://customerconnect.vmware.com/downloads/get-download?downloadGroup=FUS-PUBTP-2021H1), `VirtualBox` is the only environment that has been developed and tested thus far. If you have need to use Hyper-V, Docker, or VMware, please create an issue and request a new feature.

## Notes

This was tested using:

- Vagrant v2.4.0
- VirutalBox v7.0.12

## Prerequisites

1. You will require 4 GB of memory.
1. You will require 8 GB of disk space.
1. Ports 4200, 4300, and 5432 must be available on host environment. If you have powershell installed you can use this command to list active ports:

   ```powershell
   Get-NetTCPConnection | Where-Object { $_.State -eq 'Listen' }
   ```

1. `npm install` creates symbolic links. As a result, the VM user: `vagrant` requires `create symbolic link` authority. In some environements, only the administrator has this authority. To resolve this issue in Windows, the following steps can be performed:
   1. Launch the `Local Security Policy` app from the `start menu` (or `Win+R`, then type `secpol.msc`)
   1. Navigate to `Local Policies` -> `User Rights Assignment`.
   1. Open the `Create symbolic links` property. By default it has only `Administrators` listed.
   1. Click `Add User or Group...` button and type `Authenticated Users` in the `Enter the object names to select` field and then press the `OK` button. This will grant `symbolic link` priviledge to all users who log on with credetials.
   1. Close any open windows by clicking `OKs` and and then `log off` and `log on` to activate.
   1. Symbolic links should now work in VirtualBox shared folders without administrator priviledges.

## Setup Steps

1. [Download](https://developer.hashicorp.com/vagrant/downloads?ajs_aid=ba208f95-d5a1-457d-abeb-49d458b95eec&product_intent=vagrant) Vagrant software.
1. Reference these [installation](https://developer.hashicorp.com/vagrant/docs/installation) instructions.
1. Verify installation by running `vagrant -v` in a terminal session.
1. Install [VirtualBox](https://www.virtualbox.org/).
1. If you have not already done so, fork repo to your local machine.
1. Vagrant uses a special configuration file called `Vagrantfile` that contains all the information required for the creation of a Virtual Machine (guest) on your workstation (host) . It is located n your repo root directory.
1. To start the creation of your virtual environment, run this command in the repo root directory. (This takes a while so be patient.)

   ```bash
   vagrant up
   ```

1. Once the `vagrant up` command completes, you can logon into your virutal machine using this command. (password: `vagrant`)

   ```bash
   vagrant ssh
   ```

1. Here is a list of useful Vagrant commands. Be sure that you are in the same directory as the Vagran­tfile when running these commands!

   | Command                                       | Description                                                                                                                          |
   | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
   | `vagrant up`                                  | starts vagrant enviro­nment (also provisions only on the FIRST vagrant up) Equivalent to pressing the power buttons on your servers. |
   | `vagrant status`                              | outputs status of the vagrant machine                                                                                                |
   | `vagrant halt`                                | stops the vagrant machine. Similar to shutdown.                                                                                      |
   | `vagrant reload`                              | restarts vagrant machine, loads new Vagran­tfile configuration                                                                       |
   | `vagrant provision`                           | forces reprovisioning of the vagrant machine                                                                                         |
   | `vagrant ssh`                                 | connects to machine via SSH                                                                                                          |
   | `vagrant destroy`                             | stops and deletes all traces of the vagrant machine                                                                                  |
   | `vagrant suspend`                             | Suspends a virtual machine (remembers state). Starts faster.                                                                         |
   | `vagrant resume`                              | Resume a suspended machine (vagrant up works just fine for this as well)                                                             |
   | `vagrant reload` --provision                  | Restart the virtual machine and force provis­ioning                                                                                  |
   | `vagrant provision` --debug                   | Use the debug flag to increase the verbosity of the output                                                                           |
   | `vagrant box list`                            | List the installed boxes                                                                                                             |
   | `vagrant box remove` [virtualbox name]        | delete a box                                                                                                                         |
   | `vagrant global­-status`                      | outputs status of all vagrant machines                                                                                               |
   | `vagrant global­-status` --prune              | same as above, but prunes invalid entries                                                                                            |
   | `vagrant up` --provision \| tee provision.log | Runs vagrant up, forces provisioning and logs all output to a file                                                                   |
   | `VAGRANT_LOG=info`                            | Use the environement variable VAGRANT_LOG to set verbosity. Enter this in terminal session before you run the `vagrant up` command   |

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

   | Setting               | Value       |
   | --------------------- | ----------- |
   | Host name:            | `127.0.0.1` |
   | Port:                 | `5432`      |
   | Maintenance database: | `postgres`  |
   | Username:             | `vagrant`   |
   | Password:             | `vagrant`   |
   | Save password?:       | `Turn on`   |

### Accessing API app

Open a web brower to URL: <http://localhost:4300>

### Accessing Web app

Open a web brower to URL: <http://localhost:4200>

### Access VM via SSH application (such as PuTTY)

| Setting     | Value       |
| ----------- | ----------- |
| host Name:  | `localhost` |
| Port:       | `2222`      |
| login name: | `vagrant`   |
| password:   | `vagrant`   |

## Caveat

1. Before shutting down your host environment, be sure that your VM machine is not running. Failing to do so may corrupt your VM machine image.

1. If after install, you get this error while performing a git commit:

   ```bash
   git -c user.useConfigOnly=true commit --quiet --allow-empty-message --file - 'lint-staged' is not recognized as an internal or external command, operable program or batch file. husky - pre-commit hook exited with code 1 (error)
   ```

   Run this command. However, you will need to [install](https://nodejs.org/en/download/) `Node.js 18` (this includes `npm`) in your host environment.

   ```text
   npm install --save-dev husky
   ```
