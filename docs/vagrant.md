# Automated Ubuntu Local Env Setup

You can optionally setup a virtual Ubuntu environment using Vagrant. It is a tool used for building and managing virtual machine environments in a single workflow.

Although Vagrant supports [VirtualBox](https://www.virtualbox.org/), [Hyper-V](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v), [Docker](https://www.docker.com/), or [VMware Fusion](https://customerconnect.vmware.com/downloads/get-download?downloadGroup=FUS-PUBTP-2021H1), `VirtualBox` is the only environment that has been developed and tested thus far. If you have need to use Hyper-V, Docker, or VMware, please create an issue and request a new feature.

## Prerequisites

1. You will require 4 GB of memory.
1. You will require 8 GB of disk space.
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
1. Next you will need to install a [box](https://developer.hashicorp.com/vagrant/tutorials/getting-started/getting-started-boxes). The `Vagrantfile` in this repository uses box: `generic/ubuntu2204`. So to install this box, run in a terminal window:

```bash
    vagrant box add generic/ubuntu2204
```

To see which boxes are installed run:

```bash
    vagrant box list
```

7. Create a new folder and name it something that identifies the VM you are about to create. Example: `UbuntuVM`. The name of this folder will be used by Vagrant to identify this specific VM. It is to this directory that you will copy the vagrant file we have created for you. In a later step, Vagrant will create subdirectory`.vagrant` which it will use to manage your VM. It is in this directory where you will run all Vagrant commands that are specific to your VM.
8. Copy file: `Vagrantfile` from host `gloss-translation` repository `.vagrant/` folder to the new folder you created above.
9. Read the `NOTES:` section contained in file `Vagrantfile`.
10. in the `Vagrantfile`, edit `HOST_FOLDER` by replacing `../gloss-translation` with the location of your repository root folder.

```ruby
    HOST_FOLDER = "../gloss-translation"
```

11. If required, perform any requested `plugin` installations mentioned in the `NOTES:` section. To see which plugins are installed run:

```bash
    vagrant plugin list
```

12. To start the creation of your virtual development environment, run this command in your newly created directory:

```bash
    vagrant up
```

13. For help on vagrant commands, at a terminal session enter:

```bash
    vagrant -help
```

## Post-Installation Notes

Accessing VM resources from Host.

### Accessing database via pgAdmin

1. Start pgAdmin
1. Open the `Register - Server` dialog
1. `General` tab:
   - Name: _Enter name of your choice_
1. `Connection` tab

   - Host name: `127.0.0.1`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `vagrant`

1. `SSH Tunnel` tab

   - Use SSH tunneling: `on`
   - Tunnel port: `2222`
   - Username: `vagrant`
   - Authentication: `Password`

### Accessing API app

Open a web brower to URL: <http://localhost:4300>

### Accessing Web app

Open a web brower to URL: <http://localhost:4200>

### Access VM via ssh

- host Name: `localhost`
- Port: `2222`
- login name: `vagrant`
- password: `vagrant`
