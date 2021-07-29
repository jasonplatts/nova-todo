# TODO Extension for Panic's Nova Code Editor

Displays tags, such as TODO and FIXME, in a sidebar in Panic's macOS code editor, Nova.

### *Now Supports Remote Environments*

**The extension offers many configuration options that can be set both globally for all workspaces and overridden for
individual workspaces. For example, the extension can be configured to find additional tags, such as BUG, NOTE and INFO.
See the "Configuration" section below for more information.**

<img src="https://user-images.githubusercontent.com/48892071/103044013-ecf14d00-454c-11eb-9321-b1b433dc333a.png" width="800"
alt="Screenshot">

## Installing

Enable the extension in the extension library within Nova.

## Using TODO in Different Environments

### Local Workspace Environments

The TODO extension is fully functional in locally stored workspaces. Tags anywhere in the project that are not contained in an ignored file or location, will be added to the sidebar.
Global and workspace configuration will be honored in these environments.

### Local Non-Workspace Environments

These environments refer to those where a file or files have been opened in Nova without a defined workspace. In other words, Nova is being used as a text editor and not to manage a project.
Only the files open will display tags in the extension sidebar. While global configurations will be honored, there are no workspace configurations for these environments.

### Remote Environments

As of version 3.0, the TODO extension *supports remote environments*. Similar to local non-workspace environments, Only the files open will display tags in the extension sidebar. TODO will also honor global configuration settings, but cannot use workspace configuration options.

**Additionally:** At the time of writing, the TODO extension cannot currently open a file in a remote environment by double-clicking on the tag or file in the sidebar. This is due to limitations in the Nova API.
If this feature is important to you, please contact Panic and tell them you would like this functionality to be made available to extensions.

## Configuring

### Global Configuration

*Global configuration preferences apply to all workspaces unless they are overridden by a workspace configuration. To make changes to the global configuration, go to the extension library in Nova, select the TODO extension in the left hand side panel, and click on "Preferences". Configurable options are described below.*

* **Global Tag Case Matching** - Detect only upper case (only TODO) or both upper case and lower case tags (TODO and todo).
* **Global Included Tags** - TODO and FIXME tags are always matched by the extension. However, additional tags can also be detected, including BROKEN, BUG, DEBUG, DEPRECATED, EXAMPLE, ERROR, ERR, FAIL, FATAL, FIX, HACK, IDEA, INFO, NOTE, OPTIMIZE, QUESTION, REFACTOR, REMOVE, REVIEW, TASK, TRACE, UPDATE, WARN, and WARNING. Keep in mind that detecting a larger number of tags might cause slower performance in larger workspaces.
* **Global Ignored File and Directory Names** - Exclude file and directory names from being searched. This setting accepts a list of names that **should not** be surrounded by any form of quotation marks. **File names must include the file extension**. Several names are ignored by default, including node_modules, tmp, .git, vendor, .nova, env, venv, and .gitignore.
* **Global Ignored File Extensions** - Exclude specific file extensions from being searched. This setting accepts a list of extension names that **should not** be surrounded by any form of quotation marks. While the extension can be preceded by a period, it is not necessary.

<img src="https://user-images.githubusercontent.com/48892071/123555751-a841ab00-d755-11eb-83eb-7d8388fc3330.png" width="800"
alt="Global Extension Preferences">

<img src="https://user-images.githubusercontent.com/48892071/123555716-6a448700-d755-11eb-8355-da9a630ce471.png" width="800"
alt="Global Extension Preferences">

### Workspace Configuration

*Workspace configuration preferences only apply to the current workspace and do not work in local non-workspace and remote environments. In most cases these settings can override the global preferences. To make changes to the workspace configuration, go to the "Project" menu in Nova and select "Project Settings...". In the subsequent dialog window, click on "TODO" under the "Extensions" header in the left hand side panel. Configurable options are described below.*

* **Workspace Tag Case Matching** - By default, this is set to the global preference.
* **Workspace Included Tags** - Select any additional tags to be detected in the current workspace and change the "Included Tags" setting to "Use Workspace Preferences". Additional tags **will not** be detected until this change is made.
* **Workspace Ignored File and Directory Paths** - Exclude file and directory paths in the workspace. This accepts a list of paths that **should not** be surrounded by any form of quotation marks. It is usually easiest to press the "Choose..." button and select the path from the input window.
* **Workspace Ignored File and Directory Names** - This setting does not override the global preferences, but adds additional file and directory names to be excluded. *Please see global preference screenshots above for examples.*
* **Workspace Ignored File Extensions** - This setting does not override the global preferences, but adds additional file extensions to be excluded.

<img src="https://user-images.githubusercontent.com/48892071/123555765-c4454c80-d755-11eb-98aa-b48ac58fa9de.png" width="800"
alt="workspace Extension Preferences">

## Planned Future Features

* Add additional custom tags.
* Filtering of tags by name.

*The following features may be added if the functionality is made available through the Nova API.*
* Navigating to tags in documents within remote environments.
* Tag highlighting within the code.
* Tag notification in the sidebar icon.

## Report a Bug or Feature Request

To report a bug or request a feature, please add an issue to the GitHub repository. Thanks!
