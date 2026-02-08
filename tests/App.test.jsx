/**
 * Tests d'intégration App.jsx - v2.4.2
 * Vérifie que le composant se monte sans erreur
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock du Worker pour les tests
class WorkerMock {
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  terminate() {}
}
global.Worker = WorkerMock;

// Mock de URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:test');

describe('App Component', () => {
  it('se monte sans erreur', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('affiche le titre initial', () => {
    render(<App />);
    expect(screen.getByText(/GEDCOM/i)).toBeTruthy();
  });

  it('affiche le bouton d\'upload', () => {
    render(<App />);
    expect(screen.getByText(/Cliquez ou déposez/i)).toBeTruthy();
  });
});
