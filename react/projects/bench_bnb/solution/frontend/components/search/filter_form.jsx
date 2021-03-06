const React = require('react');

const _handleChange = (filter, updateFilter) => (
  e => updateFilter(filter, e.currentTarget.value)
)

const FilterForm = ({minSeating, maxSeating, updateFilter}) => (
  <div>
    <span className="filter">Filter results:</span>
    <br/>
    <label>Minimum Seats </label>
    <input type="number"
           value={minSeating}
           onChange={_handleChange('minSeating', updateFilter)}/>
     <br/>
    <label>Maximum Seats </label>
    <input type="number"
           value={maxSeating}
           onChange={_handleChange('maxSeating', updateFilter)}
    />
  </div>
);

export default FilterForm;
