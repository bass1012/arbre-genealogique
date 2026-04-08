import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

const mockUser = {
  _id: '1',
  email: 'test@example.com',
  nom: 'Test',
  prenom: 'User',
  role: 'admin' as const
};

const mockFamille = {
  _id: '1',
  nom: 'Famille Test',
  description: 'Test'
};

test('renders learn react link', () => {
  render(<App user={mockUser} famille={mockFamille} />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
