require 'lib/toura_api'
require 'builder/build_helper'
require 'builder/css_maker'

module Mulberry
  class BuildHelper
    include Builder::BuildHelper

    attr_reader :source_dir

    def initialize(app)
      @app          = app

      @config       = @app.config
      @name         = @app.name
      @assets_dir   = @app.assets_dir
      @source_dir   = @app.source_dir

      @build_dir    =  File.join(
        @source_dir,
        'builds'
      )
    end

    def before_steps() end
    def after_steps() end

    def project_settings
      {
        :id                   => @config['name'],
        :version              => Time.now.to_i,
        :name                 => @name,
        :bundle               => @build_dir,
        :jquery               => @config['jquery'],
        :config_dir           => @source_dir,
        :urban_airship_config => @config['urban_airship'],
        :published_version    => @config['published_version'] || '1.0'
      }
    end

    def config_settings
      add_ota_to_config_settings({
        'id'                => Mulberry.escape_single_quote(@config['name']),
        'sibling_nav'       => false,
        'ads'               => !!@config['ads'],
        'sharing'           => !is_browser_build?,
        'force_streaming'   => is_browser_build?,
        'google_analytics'  => @config['google_analytics'],
        'ad_mob'            => @config['ad_mob']
      })
    end

    def icons(destination, report)
      if build.target["build_type"] == "browser"
        required = ['app_icon_phone.png', 'app_icon_tablet.png']

        found = required.select do |icon|
          File.exists? File.join(@assets_dir, 'icons', icon)
        end

        found.each do |icon|
          FileUtils.cp(
            File.join(@assets_dir, 'icons', icon),
            destination
          )
        end
      else
        false
      end
    end

    def load_screens(destination, report)
      required = []

      [ 'phone', 'tablet' ].each do |type|
        if @config['type'].include? type
          required << "#{type}_portrait.png" << "#{type}_landscape.png"
        end
      end

      found = required.select do |screen|
        File.exists? File.join(@assets_dir, 'load_screens', screen)
      end

      found.each do |screen|
        FileUtils.cp(
          File.join(@assets_dir, 'load_screens', screen),
          destination
        )
      end
    end

    def assets(destination, report)
      device_type = build.target['device_type']
      destination_dir = File.join(destination, device_type)
      FileUtils.rm_rf destination_dir if File.exists? destination_dir
      FileUtils.mkdir_p destination_dir
      report[:dir] = device_type

      [ 'audios', 'images', 'videos', 'data' ].each do |asset_type|
        src = File.join(@assets_dir, asset_type)
        if File.exists? src
          FileUtils.cp_r(src, destination_dir)
        end
      end

      true
    end

    def css_resources(location, report)
      resources_dir = File.join(css_dir, 'resources')

      if File.exists? resources_dir
        FileUtils.cp_r(resources_dir, location)
        report[:files] << 'resources'
      end

      true
    end

    def data
      Mulberry::Data.new(@app).generate(build ? build.ota_enabled? : false)
    end

    def page_defs
      app_page_defs_dir = File.join(@source_dir, 'page_defs')
      base_page_defs_dir = Mulberry::Framework::Directories.page_defs

      page_defs = {}

      if File.exists? app_page_defs_dir
        [ app_page_defs_dir, base_page_defs_dir ].each do |dir|
          Dir.glob(File.join(dir, '*.yml')).each do |page_def|
            d = YAML.load_file(page_def)
            page_defs.merge!(d) if d
          end unless !File.exists?(dir)
        end
      end

      page_defs
    end

    def css(destination, report)
      File.open(destination, 'w') { |f| f.write create_css }
      true
    end

    def css_dir
      File.join(@source_dir, 'app')
    end

    def create_css
      begin
        Builder::CSSMaker.new(
          :css_dir => css_dir
        ).render
      rescue Sass::SyntaxError => err
        puts "SASS ERROR on line #{err.sass_line} of #{err.sass_filename}:\n #{err.to_s}"
      end
    end

    def app_id(device_os, device_type)
      @config['app_id'][device_os][device_type]
    end

    def custom_js_source
      dir = File.join(@source_dir, 'app')
      File.exists?(dir) ? dir : false
    end

    def ota_enabled?
      @config['ota'] and @config['ota']['enabled']
    end

    def html_vars
      { 'google_analytics' => @config['google_analytics'] }
    end

    private
    def padded_id
      project_settings[:id].gsub(/\W/, '');
    end

    def add_ota_to_config_settings(settings)
      if build and build.ota_enabled?
        @build.log "Adding ota settings to config settings."
        if @config['version_url']
          settings.merge!(
            'update_url'  =>  @config['version_url'],
            'version_url' =>  @config['update_url']
          )
        elsif @config['toura_api']
          url = @config['toura_api']['url'] || TouraApi::URL
          key = @config['toura_api']['key']
          settings.merge!(
            'update_url'  =>  File.join(url, "/applications/#{key}/ota_service/data_json"),
            'version_url' =>  File.join(url, "/applications/#{key}/ota_service/version_json")
          )
        else
          raise Builder::ConfigurationError.new "Must configure toura_api credentials or version_url and update_url manually."
        end
        settings['skip_version_check'] = false
      end
      settings
    end

  end
end
