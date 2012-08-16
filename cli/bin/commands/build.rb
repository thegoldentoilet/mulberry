require 'cli/bin/commands/base'

module Mulberry
  module Command
    class Build < Mulberry::Command::Base
      def initialize(args, additional_options={})
        OptionParser.new do |opts|
          opts.banner = "Usage: mulberry build [options]"

          opts.on("--skip-js-build", "Disable JavaScript build task.  This
                                     option should not be used on real
                                     projects, it's a tool for Mulberry
                                     core developers to bypass this
                                     time-consuming step when working on
                                     other aspects of deployment.") do |v|
            additional_options[:skip_js_build] = v
          end

          opts.on("--publish-ota",   "Publish an OTA with the contents of this
                                     build.") do |v|
            additional_options[:publish_ota] = v
          end

          opts.on("-t", "--test",   "Create a test build (with debugging
                                    enabled).") do |v|
            additional_options[:test] = v
          end

          opts.on("-q", "--quiet",  "Runs Mulberry build in quiet mode (will
                                    not open xcode proj).") do |q|
            additional_options[:quiet] = q
          end

        end.parse!

        super
        report @dir

        app = Mulberry::App.new(@dir)
        app.device_build additional_options
      end
    end
  end
end
