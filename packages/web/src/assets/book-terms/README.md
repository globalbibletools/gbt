# Overview
Each file stores book names and abbreviations for a specific language code. The structure of the JSON should be something like this:  
```
[
  # An array for each book.
  [
    # The items of the book array correspond to different input terms that should match the book.
    'Genesis', 'Gen', etc...
  ],
  ['Exodus', 'Exo', etc...],
  etc...
]
```
The first item in each book array should be the title of the book.

# Language Specific Notes

## en
* Initial dataset based on https://github.com/TehShrike/books-of-the-bible/blob/master/index.json.
* Used "Song of Songs" as the book name instead of "Song of Solomon"
* Added additional terms to several books.
