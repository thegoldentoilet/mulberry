require 'integration/kitchensink/spec_helper'

include CapybaraSpecHelper

describe "Search Page", :type => :request do
  it "should allow passing a search term in the URL" do
    DEVICES.each do |d|
      visit "/#{d[:os]}/#{d[:type]}/#/search/trendy"

      page.should have_content "Trendy bangs"
      page.should have_content "Trendy beard"
    end
  end

  it "should search for things when terms are entered" do
    DEVICES.each do |d|
      visit "/#{d[:os]}/#{d[:type]}/#/search"

      fill_in 'query', :with => 'dur'
      click_button 'Search'

      page.should have_content "Durham"
    end
  end
end
