---
layout: post
title: "Howto Virtualize Unraid on a Proxmox host"
description: "Run Unraid as a VM on Proxmox host. Complete guide to virtualize Unraid NAS for use as storage alongside your existing Proxmox setup."
quote: 
tags: [Proxmox, Unraid]
upload_directory: /uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host
thumbnail: /uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/thumb_timeline.jpg
toc_enabled: true
---


Here's how to run Unraid as a virtual machine under Proxmox. This is useful when you're already using Proxmox and if you want to use Unraid as a NAS.

<!--more-->

## Step 1: Prepare the Unraid USB drive
Unlike other storage systems, Unraid can't be installed on a virtual disk. Heck, they don't even provide an ISO. Instead, Unraid runs of a USB drive.

To create such a drive, I used the Unraid USB Flash Creator ([exists for Windows and macOS](https://unraid.net/download)). It's a pretty straightforward tool: pick the version of Unraid you want to run, select your USB drive and click on "Write".

![Screenshot of Unraid USB Flash Creator](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/unraid-usb-flash-creator.png)

It'll download Unraid, unpack it, and copy it to your drive.

In my case, the tool did finish, but the drive was not bootable. If this happens to you, run the `make_bootable_mac` or `make_bootable_windows` scripts that have been placed on your drive.

![Unraid's make bootable script](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/unraid-make-bootable-script.png)
*Using the make_bootable_mac tool to make sure my drive was bootable.*

## Step 2: Create the virtual machine
Next, create a virtual machine in Proxmox with the following settings:

* OS: Linux (5.x - 2.6 kernel)
* No CD drive (we'll attach the USB drive later)
* SCSI Controller: VirtIO SCSI (others might not be recognized)
* BIOS: Default (SeaBIOS)
* Machine: Default (i440fx)
* Network card model: Intel E1000 (others might not be recognized)
* CPU & memory is up to you
* You can attach a virtual hard disk to this VM, but you'll probably want to use passthrough later.
* Don't start the VM when you're finished. We'll need to make a few tweaks.

Here are the screenshots of how each step looks in the Proxmox UI:

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/proxmox-1-name-vm.png)
*Naming the VM.*

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/proxmox-2-disable-cd.png)
*Unraid boots from a USB drive. Not from CD or ISO. Don't forget to set the Linux type.*

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/proxmox-3-bios-scsi.png)
*Keep the default BIOS and machine settings. Change the SCSI controller for compatibility.*

At this point, you'll be able to attach virtual hard drives to the VM. This is a bit useless, as you'll want to pass through your physical hard drives. You could, however, use the virtual drive as a cache drive in Unraid. Size it as you see fit. I choose to create a dummy drive that I deleted later.

As for CPU core: a single core should work, but a dual core is recommended. Memory-wise, UnRaid recommends at least 2GB. Note that because I use Proxmox as a hypervisor, I will be using Unraid solely as a NAS.

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/proxmox-4-network-config.png)
*Network interface. Make sure to select the Intel E1000 for compatibility reasons.*

## Step 3: Passthrough the USB device & change boot order
With the VM created, we now have to pass through the USB drive. Plug it into your Proxmox machine and head over to your VM > Hardware > Add > USB Device.

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/proxmox-5-add-usb-device.png)

You'll have two options: you can pass through a specific device, regardless of which port it is attached to (handy if you want to swap it sometimes). Or you can pass through a whole USB port. Both options work fine.

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/proxmox-6-add-usb-device-2.png)
*Passthrough the USB drive.*

I opted not to enable USB3 as [Unraid is not recommending that](https://wiki.unraid.net/Articles/Getting_Started#Preparing_Your_USB_Flash_Device).

(At this point, you can also add the physical hard drives that you want to use in Unraid. I didn't do that because this is a test setup to evaluate Unraid.)

And finally, change the boot order of the VM. Head over to "Options > Boot Order":

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/proxmox-7-boot-order.png)

Make sure that `usb0` is enabled. I also dragged it to the top and disabled all other options, but this is not required.

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/proxmox-8-boot-order-2.png)

Save the settings and start your VM!

## Step 4: Boot & enjoy (or fix boot errors)
You should be able to open your Unraid instance by navigating to http://tower.local

If that's not the case, open the console of your VM. In my case, Unraid couldn't boot because of a kernel panic:

```
VFS: Cannot open root device "(null)" or unknown-block(0,0): error -6
Please append a correct "root=" boot option;
Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)
```

I restarted the VM and paused the boot screen by using the arrow keys. Select the `Unraid OS` option and press tab.

Now add this boot option: `root=sda` and hit enter.

![](/uploads/2021-05-08-howto-virtualize-unraid-on-proxmox-host/unraid-boot-loader.png)

Unraid will now try to boot again, and it should be successful!  If you want to make this change permanent, plug the USB drive back into your main computer and edit the file: `/syslinux/syslinux.cfg`

Add the `root=sda` option to this section:

```
label Unraid OS
   menu default
   kernel /bzimage
   append initrd=/bzroot root=sda
```

Save the file, plug the drive back in, and fire up the VM!

(Found this solution on the [Unraid Forums](https://forums.unraid.net/topic/74419-tried-to-upgrade-from-653-to-66-and-wont-boot-up-after-reboot/?do=findComment&comment=710968))

## Caveats
Some people might frown upon running Unraid as a virtual machine because Unraid itself is a hypervisor. When you go for a setup like this, it would be wise not to run virtual machines or containers inside Unraid (in fact, that won't work unless you enable nested virtualization).

That's fine by me. I chose Proxmox because it's a lightweight hypervisor dedicated to running KVM VM's and LXC containers, nothing else. It's been rock solid. All Unraid has to do is keep my files safe, which is what it does best.

I'm planning to replace my current MergerFS + SnapRAID setup with Unraid. More on that in a (potential) future blog post.
