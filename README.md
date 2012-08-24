[![Build Status](https://secure.travis-ci.org/Toura/mulberry.png?branch=master)](http://travis-ci.org/Toura/mulberry)


## Supported Mobile Platforms

Mulberry currently supports the following mobile platforms:

- iOS 4.x and above on iPhone and iPad
- Android 2.2-2.3 Phone only (3.x-4.x tablet support on the way)
- Mobile web on most webkit-based browsers


# Compatibility

The Mulberry command line toolkit is supported on OSX Lion and Snow Lion, but it will probably work on [Ubuntu](https://github.com/Toura/mulberry/wiki/Common-Ubuntu-Installation-Issues) and it's possible to get it to work on Windows [with some effort](https://github.com/Toura/mulberry/wiki/Windows-Installation).



## Installation

Make sure you have the dependencies installed:

- Ruby 1.8.7 and up
- RubyGems / Bundler
- Java
- curl

Download the [latest release](https://github.com/Toura/mulberry/tags), or
 clone the repository into a directory of your choosing:

    git clone git@github.com:Toura/mulberry.git

Install the Ruby dependencies:

    bundle install (--without=test)

Add mulberry to your $PATH:

    export PATH=$PATH:<mulberry directory>/cli/bin

This will let you use the development server and create mobile web apps. In order to compile apps for iOS or Android, you need to install [Cordova 1.9](https://github.com/phonegap/phonegap/zipball/1.9.0)
and either XCode or the Android SDK:

- [iOS Application Development Requirements](https://github.com/Toura/mulberry/wiki/Requirements-for-developing-iOS-apps)
- [Android Application Development Requirements](https://github.com/Toura/mulberry/wiki/Requirements-for-developing-Android-apps)

## Using Mulberry

Read [Getting Started](https://github.com/Toura/mulberry/wiki/Getting-Started).


# Getting Support

- [Documentation](https://github.com/toura/mulberry/wiki)
- [Google Group](https://groups.google.com/forum/#!forum/toura-mulberry)
