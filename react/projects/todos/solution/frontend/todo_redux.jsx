// React
import React from 'react';
import ReactDOM from 'react-dom';
// Components
import Root from './components/root';
// Actions
import configureStore from './store/store';

document.addEventListener('DOMContentLoaded', () => {
  const store = configureStore();

  const root = document.getElementById('content');
  ReactDOM.render(<Root store={store} />, root);
});
