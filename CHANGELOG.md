## Version 3.1.3

* Fixed an issue preventing the extension from working correctly on case-sensitive systems.

## Version 3.1.2

* Improved appearance of some extension icons. Thanks to Pete Schaffner for this contribution!

## Version 3.1.1

* Fixed internal error preventing extension submission.

## Version 3.1

* Added support for tag detection with whitespace in addition to the : or [] characters. Many thanks to Seth Battis for this contribution!

## Version 3.0.3

* Added upstream tag.

## Version 3.0.2

* Added support in markdown files.

## Version 3.0.1

* Fixed improper detection of tags when preceded by an underscore.
* Added the tag count after the tag name when sorting by tag instead of filename.

## Version 3.0

* Dramatically improved performance with rewritten extension.
* Improved stability.
* Added support for remote server environments.
* Added env and venv as default ignored directories (Issue #21).
* Fixed issue causing configuration changes to not save (Issue #8).

## Version 2.3.1

* Updated extension documentation to clarify updating ignored file and folder name preferences.
* Added a minimum Nova 4.1 runtime requirement.

## Version 2.3

* Fixed issue opening files occurring when double clicking a TODO item in Nova 1.4.

## Version 2.2

* Fixed configuration issue preventing extension submission.

## Version 2.1

* Added additional screenshots.

## Version 2.0

* Overhauled the extension's preferences to provide global and workspace specific configurations.
* Added the "FIX" tag.
* Added a preference to match on upper case (default) or upper and lower case tags.
* Updated the README to better explain the configuration options available.
* Added exclusion for files without file extensions.
* Fixed issue causing the expansion icon to appear next to tag items in the sidebar.

## Version 1.4

* Fixed issue causing the sidebar to be blank, instead of a "monitoring workspace" message when no tag results were found.

## Version 1.3

* Updated extension to set the cursor position when opening a tag item.

## Version 1.2

* Added the ability to sort by file or tag.

## Version 1.1

* Added markdown files to the default exclusions.
* Improved the recognition of tag comments.
* Fixed incorrect recognition of the warn tag in some situations.
* Added tag count to the tree view for each file.

## Version 1.0

* Changed message displayed in the sidebar when no tags are found.
* Added global preference recognition in non-workspace environments.
* Polished extension icons.

## Version 0.5

* Added the ability to search for additional tags, such as ERROR, INFO, and NOTE, in preferences (Issue #4).
* Fixed issue causing extension to fail when in an environment without a workspace (Issue #6).
* Modified tree view to display file names alphabetically.
* Fixed double loading of tree view items occurring in some situations.

## Version 0.4

* Updated the file searching method to eliminate the number of files limitation.

## Version 0.3

* Fixed issue preventing tag elements from loading in the tree view.

## Version 0.2

* Fixed issue causing the tree view to fail to update after file and extension configuration changes.
* Added MIT license file.
* Increased the maximum number of files that can be processed to 300. Too many files currently cause the extension to temporarily stop responding.

## Version 0.1

Initial pre-release.
