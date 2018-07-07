Introduction
============

In ES2015, you can make variables available outside a file using the 
export keyword. To use the variables somewhere else, you must import 
them using the path to the source. Files that export some variables 
are called “modules”, because they represent a unit of reusable code. 
Explicitly importing the modules and packages you use helps you write 
your code in a modular way, avoiding the introduction of global symbols 
and “action at a distance”. Read more about ES2015 modules on
[meteor docs](https://guide.meteor.com/v1.6/structure.html#es2015-modules).

The code in this directory uses this new system, so modules need
to be explicitly imported.

Components
==========

api
---

This is where the public API is hosted. It includes models for
our collections.

checks
------

This is where we store tests that don't go along with modules.
These are mostly integration tests (full app).

startup
-------

Code that is loaded by main.js in server or client and runs immediately.

ui
--

All user interface components for the webapp.

others
------

- **package-main.js**: we provide wekan both as an application
and as a package that others can use in their applications. This file
is the main file imported by `package.js` at the root of the
repository.

