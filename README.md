# TODO Extension for Panic's Nova Code Editor

<img src="https://user-images.githubusercontent.com/48892071/98032424-ffb79300-1de1-11eb-8d3c-b016df4ffde6.png" width="200" alt="TODO Extension Logo">

Displays TODO and FIXME tags within a sidebar tree view in Panic's macOS code editor, Nova.

**There are several known issues with this release mostly related to the setting and observation of preferences. After setting a configuration, please press the "Refresh" button on the sidebar header to see these changes reflected in the tree view. For this reason, it is a pre-1.0 release.**

## Installing

Enable the extension in the extension library within Nova.

## Configuration

### Workspace Configuration
To ignore files or directories for a specific workspace, go to the project settings.

### Global Configuration
For global ignore settings, go to the extension within the extension library and click on "Preferences".

## Known Issues

* The tree view does not refresh after changing the extension preferences.
* The sidebar currently displays TODO and FIXME keywords that occur anywhere within a file. Future releases will search only within comments.

## Future Features

* TODO and FIXME keyword highlighting.

## Report a Bug or Feature Request

To report a bug or request a feature, please add an issue to the GitHub repository. Thanks!
