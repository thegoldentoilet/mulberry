[![Build Status](https://secure.travis-ci.org/Toura/mulberry.png?branch=master)](http://travis-ci.org/Toura/mulberry)


## Supported Mobile Platforms

Mulberry currently supports the following mobile platforms:

- iOS 4.x and above on iPhone and iPad
- Android 2.2-2.3 Phone only (3.x-4.x tablet support on the way)
- Mobile web on most webkit-based browsers


# Getting Started

The Mulberry command line toolkit is supported on OSX Lion and Snow Lion

It will probably work on:

* Windows 7 64-bit via Cygwin
* Ubuntu 11 64-bit


## Installation

1. Make sure you have the dependencies
  - Ruby 1.8.7
  - RubyGems / Bundler
  - Java http://www.java.com/en/download/index.jsp

2. Download the [latest release](https://github.com/Toura/mulberry/tags), or
  clone the repository into a directory of your choosing:

    git clone git@github.com:Toura/mulberry.git
    bundle install (--without=test)

3. add mulberry to your $PATH

    export PATH=$PATH:<mulberry directory>/cli/bin

This will let you use the development server and create mobile web apps. In order to build apps for iOS or android, you need to install the dependencies:

### iOS

- [iOS Application Development Requirements](https://github.com/Toura/mulberry/wiki/Requirements-for-developing-iOS-apps)

1. Download XCode
2. Install Cordova 1.9

### Android

- [Android Application Development Requirements](https://github.com/Toura/mulberry/wiki/Requirements-for-developing-Android-apps)

1. Download Android SDK
2. Install Cordova 1.9

TODOC: How to build with Phonegap build


# Getting Support

- [Documentation](https://github.com/toura/mulberry/wiki)
- [Google Group](https://groups.google.com/forum/#!forum/toura-mulberry)
