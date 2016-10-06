# Testing Models with Rspec

## Overview

We test models in Rails to make sure that:

*  The models still work after we change their methods
*  Validations work
*  Associations are set up
*  We get appropriate error messages

Model testing in Rails is an example of unit testing - that is, testing
the various components of our application in relative isolation - as
opposed to integration testing which will test features that use many
pieces of the application.

Model specs live in spec/models.

## Creating the spec files

If you've already run `rails generate rspec:install`, then Rails will
automatically make spec files for you when you generate a model.
Otherwise, run `rails generate rspec:model #{model_name}`.

To run the model tests file-by-file, run `rspec spec/models/{model_name}_spec.rb`.

## Writing tests

A model spec is wrapped in RSpec's `describe` block, which lets you
run all the usual RSpec methods.  For example:

```ruby
# spec/models/basketball_team_spec.rb

require 'spec_helper'

describe BasketballTeam do
  it "orders by city" do
    cavs = BasketballTeam.create!({:name => "Cavaliers", :city => "Cleveland"})
    hawks = BasketballTeam.create!({:name => "Hawks", :city => "Atlanta"})

    expect(BasketballTeam.ordered_by_city).to eq([hawks, cavs])
  end
end
```

*NB: Here in this document we are creating Rails objects to test
manually, but in the next reading you'll see how to use __factories__ to
do this in a cleaner, more flexible way.*

## Validation tests

We can test if a model is valid by using its own `#valid?` method:

```ruby
describe BasketballTeam do
  let(:incomplete_team) { BasketballTeam.new(:city => "New York") }

  it "validates presence of name" do
    expect(incomplete_team).not_to be_valid
  end
end
```

However, this process can become tedious if you have many different things that need to be validated. Luckily, there's a solution for that.

## Validation and association tests

The `shoulda-matchers` gem gives us a lot of nice one-liner expressions to test common cases.

Make sure it's in your Gemfile and run `bundle install`.

```ruby
#Gemfile

group :test do
  gem "shoulda-matchers"
end
```

Next, make sure you have the following lines in your `rails_helper.rb`.

```ruby
#rails_helper.rb

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
```

Now testing validations and other model
methods are a breeze.

```ruby
describe BasketballTeam do
  it { should validate_presence_of(:name) }
  it { should validate_uniqueness_of(:name) }
  it { should ensure_inclusion_of(:name).in_array(["Cavaliers", "Suns", "Mavericks"])} #etc..
end
```

We can also test associations!

```ruby
describe BasketballTeam do
  describe "associations" do
    # "it" refers to an instance of the BasketballTeam class here
    # because we have not explicitly specified a subject
    it { should have_many(:basketball_players)}
    it { should have_one(:owner)}
  end
end
```

Check out the docs [here][shoulda-matchers].

[shoulda-matchers]:https://github.com/thoughtbot/shoulda-matchers

## Error message tests

We can also check that an error message is what we expect it to be.  For
example, we may want to test for a specific type of error within the errors
hash. **Make sure to call `#valid?` beforehand in order for any errors to show up!**

```ruby
it "fails validation with no name expecting a specific message" do
  no_name_team = BasketballTeam.new({:city => "Cleveland"})
  no_name_team.valid?
  expect(no_name_team.errors[:name]).to include("can't be blank")
end
```

## Testing scopes

Say I want to write a method `BasketballTeam::playoff_teams` that
should only return basketball teams that make the playoffs.  In pseudocode, the "scope" would be "where playoffs == true".

We don't want to test that the Rails scope methods work--we can
assume that Rails does its job.  Instead, we want to test that we
wrote a method that returns the right data. There are two ways to
do this:

1. Inspect the properties of the method's SQL query, which we do through
   methods such as `where_values_hash` and `order_values`.  Inspecting
   the properties speeds up your tests because they don't actually query
   the database.  In addition, you're testing code that *you* wrote
   instead of testing Activerecord.

2. Actually query the database.

```ruby
describe "::playoff_teams" do
  let!(:cavs) {BasketballTeam.create!({:name => "Cavaliers",
                                     :city => "Cleveland",
                                     :playoffs => true})}
  let!(:suns) {BasketballTeam.create!({:name => "Suns",
                                     :city => "Phoenix",
                                     :playoffs => false})}

  # 1. Inspect query properties.  Does NOT query the database.
  it "has the correct values hash" do
    expect(BasketballTeam.playoff_teams.where_values_hash).to eq({"playoffs" => true})
  end

  # 2. Actually query the database.
  it "returns good teams" do
    expect(BasketballTeam.playoff_teams).to include(cavs)
  end

  it "does not return terrible teams" do
    expect(BasketballTeam.playoff_teams).not_to include(suns)
  end
end


```
