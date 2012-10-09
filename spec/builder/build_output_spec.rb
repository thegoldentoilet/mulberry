require 'spec_helper'
require 'builder'
require 'fakeweb'

describe Builder::Build do
  before :all do
    Mulberry::App.scaffold('testapp', true)
    @config = { :skip_js_build => true }

    @page_defs = Dir.glob(File.join(Mulberry::Framework::Directories.page_defs, '*.yml')).map do |page_def|
      YAML.load_file(page_def).keys.first
    end

    @app = Mulberry::App.new 'testapp'

    ['load_screens', 'icons'].each do |dir|
      FileUtils.cp_r(
        File.join(FIXTURES_DIR, dir),
        @app.assets_dir
      )
    end

    @fake_helper = FakeBuildHelper.new
    @mulberry_helper = Mulberry::BuildHelper.new @app
  end

  it "should create js files if javascript step is specified" do
    b = Builder::Build.new(@config.merge({
      :skip_js_build => false,
      :target_config => {
        'build_type' => 'fake',
        'build' => {
          'javascript' => [ 'dojo', 'mulberry' ]
        }
      }
    }))

    b.build

    js = b.completed_steps[:build][:javascript]

    js.should_not be_nil
    js[:location].should_not be_nil
    js[:build_contents].should_not be_nil

    File.exists?(File.join(js[:location], 'dojo', 'dojo.js')).should_not be_nil
    File.exists?(File.join(js[:location], 'mulberry', 'base.js')).should_not be_nil

    dojo_file = File.join(js[:location], 'dojo', 'dojo.js')
    contents = File.read dojo_file
    contents.should include 'Haml'

    b.cleanup
  end

  describe "icons and load screens" do
    it "should copy load screens to the proper directory" do
      config = @config.merge({
        :device_type => 'tablet',
        :build_helper   =>  @mulberry_helper,
        :target => 'www'
      })

      b = Builder::Build.new(config)
      b.build
      load_screens = b.completed_steps[:gather][:load_screens][:location]

      ['phone_portrait.png', 'tablet_portrait.png',
       'phone_landscape.png', 'tablet_landscape.png'].each do |load_screen|
        Dir.entries(load_screens).index(load_screen).should_not be_nil
      end
    end

    it "should copy icons to the proper directory" do
      config = @config.merge({
        :device_type => 'tablet',
        :build_helper   =>  @mulberry_helper,
        :target => 'www'
      })

      b = Builder::Build.new(config)
      b.build

      icons = b.completed_steps[:gather][:icons][:location]
      ['app_icon_phone.png', 'app_icon_tablet.png'].each do |icon|
        Dir.entries(icons).index(icon).should_not be_nil
      end
    end

    it "should process icons for different resolutions" do
      config = @config.merge({
        :device_type => 'tablet',
        :build_helper   =>  @mulberry_helper,
        :target => 'www'
      })

      b = Builder::Build.new(config)
      b.build

      icons = File.join(@app.source_dir, "builds", "browser", "www", "icons")
      ['icon-72.png','icon.png','icon@2x.png'].each do |icon|
        Dir.entries(icons).index(icon).should_not be_nil
      end
    end
  end

  describe "html" do
    def config(type = 'device')
      @config.merge({
        :build_helper => @fake_helper,
        :target_config => {
          'build_type' => type,
          'build' => { 'html' => true }
        }
      })
    end

    def html_contents(build)
      html = build.completed_steps[:build][:html]
      File.read(File.join(html[:location], 'index.html'))
    end

    it "should build html if html is specified" do
      b = Builder::Build.new(config)
      b.build

      html = b.completed_steps[:build][:html]
      html.should_not be_nil
      html[:location].should_not be_nil
      html[:files].should_not be_nil

      b.cleanup
    end

    it "should include phonegap for device builds" do
      b = Builder::Build.new(config)
      b.build
      html_contents(b).should include 'cordova'
      b.cleanup
    end

    it "should not include the readyFn" do
      b = Builder::Build.new(config)
      b.build
      html_contents(b).should_not include 'readyFn'
      b.cleanup
    end

    it "should include the app title" do
      b = Builder::Build.new(config)
      b.build
      html_contents(b).should include "<title>#{@fake_helper.project_settings[:name]}</title>"
      b.cleanup
    end

    it "should not include phonegap in the html if it is a browser build" do
      b = Builder::Build.new(config 'browser')
      b.build
      html_contents(b).should_not include 'phonegap'
      b.cleanup
    end

    it "should include the manifest for device builds" do
      b = Builder::Build.new(config('device'))
      b.build
      html_contents(b).should include 'manifest.js'
    end

    it "should not include the manifest for browser builds" do
      b = Builder::Build.new(config('browser'))
      b.build
      html_contents(b).should_not include 'manifest.js'
    end
  end

  describe "config" do
    describe "browser builds" do
      before :all do
        b = Builder::Build.new(@config.merge({
          :build_helper   =>  @mulberry_helper,
          :target_config  =>  {
            'build_type'  =>  'browser',
            'build'       =>  { 'config' => true }
          }
        }))

        b.build
        config = b.completed_steps[:build][:config]
        @config_contents = File.read(File.join(config[:location], 'AppConfig.js'))
      end

      it "should set skipVersionCheck to true" do
        @config_contents.should include 'toura.skipVersionCheck = true;'
      end
    end

    describe 'google analytics' do
      it 'should include tracking id in app config' do
        b = Builder::Build.new(@config.merge({
          :build_helper   =>  @mulberry_helper,
          :target_config  =>  {
            'build_type'  =>  'browser',
            'build'       =>  { 'config' => true }
          }
        }))

        b.build
        config = b.completed_steps[:build][:config]
        config_contents = File.read(File.join(config[:location], 'AppConfig.js'))
        config_contents.should match /"trackingId"\:\s*"a_tracking_id/
      end
    end
  end

  describe "device builds" do
    describe "iphone build" do
      before :all do
        @b = Builder::Build.new({
          :build_helper => @mulberry_helper,
          :device_type => 'phone',
          :device_os => 'ios',
          :target => 'device_production'
        })

        @b.build
        @bundle = @b.completed_steps[:close][:bundle]
      end

      it "should include all of the required files" do
        @bundle[:location].should_not be_nil

        [
          [ 'iphone' ],

          [ 'iphone', 'Toura' ],

          [ 'iphone', 'Toura', 'Toura-Info.plist' ],
          [ 'iphone', 'Toura', 'UrbanAirship.plist' ],

          [ 'iphone', 'www' ],
          [ 'iphone', 'www', 'index.html' ],

          [ 'iphone', 'www', 'media' ],
          [ 'iphone', 'www', 'media', 'manifest.js' ],

          [ 'iphone', 'www', 'css' ],
          [ 'iphone', 'www', 'css', 'base.css' ],
          [ 'iphone', 'www', 'css', 'resources' ],

          [ 'iphone', 'www', 'data' ],
          [ 'iphone', 'www', 'data', 'tour.js.jet' ],
          [ 'iphone', 'www', 'data', 'pagedefs.js' ],

          [ 'iphone', 'www', 'javascript' ],
          [ 'iphone', 'www', 'javascript', 'dojo', 'dojo.js' ],
          [ 'iphone', 'www', 'javascript', 'mulberry', 'base.js' ],
          [ 'iphone', 'www', 'javascript', 'client', 'base.js' ],
          [ 'iphone', 'www', 'javascript', 'toura', 'AppConfig.js' ]
        ].each do |path|
          File.exists?(File.join(@bundle[:location], path)).should be_true
        end
      end

      it "should properly generate the tour data" do
        File.read(File.join(@bundle[:location], 'iphone', 'www', 'data', 'tour.js.jet')).should include 'toura.data.local'
      end

      it "should properly generate the pagedef data" do
        page_defs = File.read(File.join(@bundle[:location], 'iphone', 'www', 'data', 'pagedefs.js'))
        page_defs.should include 'mulberry.pageDef('
        @page_defs.each do |page_def|
          page_defs.should include page_def
        end
      end

      it "should properly include the data file" do
        html = File.read(File.join(@bundle[:location], 'iphone', 'www', 'index.html'))
        html.should include 'tour.js.jet'
      end

      after do
        @b.cleanup
      end
    end

    describe "ipad build" do
      before :all do
        @b = Builder::Build.new({
          :build_helper => @mulberry_helper,
          :device_type => 'tablet',
          :device_os => 'ios',
          :target => 'device_production'
        })

        @b.build

        @bundle = @b.completed_steps[:close][:bundle]
      end

      it "should create the required files" do
        @bundle[:location].should_not be_nil

        [
          [ 'ipad' ],

          [ 'ipad', 'Toura' ],

          [ 'ipad', 'Toura', 'Toura-Info.plist' ],
          [ 'ipad', 'Toura', 'UrbanAirship.plist' ],

          [ 'ipad', 'www' ],
          [ 'ipad', 'www', 'index.html' ],

          [ 'ipad', 'www', 'media' ],
          [ 'ipad', 'www', 'media', 'manifest.js' ],

          [ 'ipad', 'www', 'css' ],
          [ 'ipad', 'www', 'css', 'base.css' ],
          [ 'ipad', 'www', 'css', 'resources' ],

          [ 'ipad', 'www', 'data' ],
          [ 'ipad', 'www', 'data', 'tour.js.jet' ],
          [ 'ipad', 'www', 'data', 'pagedefs.js' ],

          [ 'ipad', 'www', 'javascript' ],
          [ 'ipad', 'www', 'javascript', 'dojo', 'dojo.js' ],
          [ 'ipad', 'www', 'javascript', 'mulberry', 'base.js' ],
          [ 'ipad', 'www', 'javascript', 'client', 'base.js' ],
          [ 'ipad', 'www', 'javascript', 'toura', 'AppConfig.js' ]
        ].each do |path|
          File.exists?(File.join(@bundle[:location], path)).should be_true
        end
      end

      it "should properly generate the tour data" do
        File.read(File.join(@bundle[:location], 'ipad', 'www', 'data', 'tour.js.jet')).should include 'toura.data.local'
      end

      it "should properly generate the page def data" do
        page_defs = File.read(File.join(@bundle[:location], 'ipad', 'www', 'data', 'pagedefs.js'))
        page_defs.should include 'mulberry.pageDef('
        @page_defs.each do |page_def|
          page_defs.should include page_def
        end
      end

      it "should properly include the data file" do
        html = File.read(File.join(@bundle[:location], 'ipad', 'www', 'index.html'))
        html.should include 'tour.js.jet'
      end

      after do
        @b.cleanup
      end
    end

    describe "android build" do
      before :all do
        @b = Builder::Build.new({
          :build_helper => @mulberry_helper,
          :device_type => 'phone',
          :device_os => 'android',
          :target => 'device_production'
        })

        @b.build

        @bundle = @b.completed_steps[:close][:bundle]
      end

      it "should not append a query string to the AppConfig.js url" do
        html = File.read(File.join(@bundle[:location], 'android', 'assets', 'www', 'index.html'))
        html.should include 'AppConfig.js'
        html.should_not include 'AppConfig.js?'
      end

      it "should generate all the required files" do
        @bundle[:location].should_not be_nil

        [
          [ 'android' ],

          [ 'android', 'build.xml' ],
          [ 'android', 'AndroidManifest.xml' ],
          [ 'android', 'local.properties' ],

          [ 'android', 'assets', 'www' ],
          [ 'android', 'assets', 'www', 'index.html' ],

          [ 'android', 'assets', 'www', 'media' ],
          [ 'android', 'assets', 'www', 'media', 'manifest.js' ],

          [ 'android', 'assets', 'www', 'css' ],
          [ 'android', 'assets', 'www', 'css', 'base.css' ],
          [ 'android', 'assets', 'www', 'css', 'resources' ],

          [ 'android', 'assets', 'www', 'data' ],
          [ 'android', 'assets', 'www', 'data', 'tour.js.jet' ],
          [ 'android', 'assets', 'www', 'data', 'pagedefs.js' ],

          [ 'android', 'assets', 'www', 'javascript' ],
          [ 'android', 'assets', 'www', 'javascript', 'dojo', 'dojo.js' ],
          [ 'android', 'assets', 'www', 'javascript', 'mulberry', 'base.js' ],
          [ 'android', 'assets', 'www', 'javascript', 'client', 'base.js' ],
          [ 'android', 'assets', 'www', 'javascript', 'toura', 'AppConfig.js' ]
        ].each do |path|
          full_path = File.join(@bundle[:location], path)
          File.exists?(full_path).should be_true, "expected #{full_path.inspect}"
        end
      end

      it "should properly generate the tour data" do
        File.read(File.join(@bundle[:location], 'android', 'assets', 'www', 'data', 'tour.js.jet')).should include 'toura.data.local'
      end

      it "should properly generate the page def data" do
        page_defs = File.read(File.join(@bundle[:location], 'android', 'assets', 'www', 'data', 'pagedefs.js'))
        page_defs.should include 'mulberry.pageDef('
        @page_defs.each do |page_def|
          page_defs.should include page_def
        end
      end

      it "should properly populate the manifest" do
        manifest = File.read(File.join(@bundle[:location], 'android', 'AndroidManifest.xml'))
        manifest.should include 'android:versionName="1.0"'
        manifest.should include 'com.toura.app2_fake'
      end

      it "should properly include the data file" do
        html = File.read(File.join(@bundle[:location], 'android', 'assets', 'www', 'index.html'))
        html.should include 'tour.js.jet'
      end

      after do
        @b.cleanup
      end

    end

  end

  after(:all) do
    FileUtils.rm_rf 'testapp'
  end
end
