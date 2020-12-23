# TODO Extension for Panic's Nova Code Editor

Displays tags, such as TODO and FIXME, within a sidebar tree view in Panic's macOS code editor, Nova.

**The extension offers many configuration options that can be set both globally for all workspaces and overridden for
individual workspaces. For example, the extension can be configured to find additional tags, such as BUG, NOTE and INFO.
See the "Configuration" section below for more information.**

<img src="https://user-images.githubusercontent.com/48892071/103044013-ecf14d00-454c-11eb-9321-b1b433dc333a.png" width="800"
alt="Screenshot">

## Installing

Enable the extension in the extension library within Nova.

## Configuration

### Global Configuration

*Global configuration preferences apply to all workspaces unless they are overridden by the workspace configuration. To make changes to the global configuration, go to the extension library in Nova, select the TODO extension in the left hand side panel, and click on "Preferences". Configurable options are described below.*

* **Global Tag Case Matching** - Detect only upper case (only TODO) or both upper case and lower case tags (TODO and todo).
* **Global Included Tags** - TODO and FIXME tags are always matched by the extension. However, additional tags can also be detected, including BROKEN, BUG, DEBUG, DEPRECATED, EXAMPLE, ERROR, ERR, FAIL, FATAL, FIX, HACK, IDEA, INFO, NOTE, OPTIMIZE, QUESTION, REFACTOR, REMOVE, REVIEW, TASK, TRACE, UPDATE, WARN, and WARNING. Keep in mind that detecting a larger number of tags might cause slower performance in larger workspaces.
* **Global Ignored File and Directory Names** - Exclude file and directory names. This setting accepts a comma separated list of names that **should not** be surrounded by any form of quotation marks. File names must include the file extension. Several names are ignored by default, including node_modules, tmp, .git, vendor, .nova, and .gitignore.
* **Global Ignored File Extensions** - Exclude specific file extensions from being searched. This setting accepts a comma separated list of extension names that **should not** be surrounded by any form of quotation marks. While the extension can be preceded by a period, it is not necessary.

<img src="https://user-images.githubusercontent.com/48892071/102829877-0744f280-43b6-11eb-940a-f1292bf32547.png" width="800"
alt="Global Extension Preferences">

### Workspace Configuration

*Workspace configuration preferences only apply to the current workspace. In most cases these settings can override the global preferences. To make changes to the workspace configuration, go to the "Project" menu in Nova and select "Project Settings...". In the subsequent dialog window, click on "TODO" under the "Extensions" header in the left hand side panel. Configurable options are described below.*

* **Workspace Tag Case Matching** - By default, this is set to the global preference.
* **Workspace Included Tags** - Select any additional tags to be detected in the current workspace and change the "Included Tags" setting to "Use Workspace Preferences". Additional tags **will not** be detected until this change is made.
* **Workspace Ignored File and Directory Paths** - Exclude file and directory paths in the workspace. This accepts a comma separated list of paths that **should not** be surrounded by any form of quotation marks. It is easiest to "Choose..." the path from the input above, then click on "Ignore Above Path". This will append the chosen file or directory to the list of ignored paths.
* **Workspace Ignored File and Directory Names** - This setting does not override the global preferences, but adds additional file and directory names to be excluded.
* **Workspace Ignored File Extensions** - This setting does not override the global preferences, but adds additional file extensions to be excluded.

<img src="https://user-images.githubusercontent.com/48892071/102829607-7b32cb00-43b5-11eb-915f-3125687f1244.png" width="800"
alt="workspace Extension Preferences">

## Known Issues

* Updates to text field preferences are not always saved. **As a temporary workaround, click into another text box in the preferences window to trigger the save event, prior to clicking "Done". This forces the input to lose focus and save.** This issue should be fixed in a future Nova update.

## Planned Future Features

* Tag highlighting within the code.
* Tag notification in the sidebar icon.
* Improvements to tag detection performance when file changes are made in the workspace.

## Report a Bug or Feature Request

To report a bug or request a feature, please add an issue to the GitHub repository. Thanks!
