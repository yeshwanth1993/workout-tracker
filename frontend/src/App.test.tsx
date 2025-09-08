import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders workout tracker header', () => {
  render(<App />);
  const linkElement = screen.getByText(/Workout Tracker/i);
  expect(linkElement).toBeInTheDocument();
});