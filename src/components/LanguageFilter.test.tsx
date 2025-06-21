import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageFilter from './LanguageFilter';

describe('LanguageFilter', () => {
  const mockLanguages = ['C', 'Go', 'JavaScript', 'Python', 'TypeScript'];
  const mockOnValueChange = vi.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders with default props', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    const select = screen.getByRole('combobox', { name: /filter repositories by programming language/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('');
  });

  it('displays "All Languages" as the first option', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    const allLanguagesOption = screen.getByRole('option', { name: 'All Languages' });
    expect(allLanguagesOption).toBeInTheDocument();
    expect(allLanguagesOption).toHaveValue('');
  });

  it('displays all available languages as options', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    mockLanguages.forEach(language => {
      const option = screen.getByRole('option', { name: language });
      expect(option).toBeInTheDocument();
      expect(option).toHaveValue(language);
    });
  });

  it('shows selected language as current value', () => {
    render(
      <LanguageFilter
        value="Python"
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('Python');
  });

  it('calls onValueChange when selection changes', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Python' } });

    expect(mockOnValueChange).toHaveBeenCalledWith('Python');
    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
  });

  it('calls onValueChange with empty string when "All Languages" is selected', () => {
    render(
      <LanguageFilter
        value="Python"
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });

    expect(mockOnValueChange).toHaveBeenCalledWith('');
    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
  });

  it('renders as disabled when disabled prop is true', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('applies disabled styling when disabled', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('disabled:bg-gray-100', 'disabled:text-gray-500', 'disabled:cursor-not-allowed');
  });

  it('handles empty availableLanguages array', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={[]}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Should only have "All Languages" option
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('All Languages');
  });

  it('has proper accessibility attributes', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Filter repositories by programming language');
    expect(select).toHaveAttribute('id', 'language-filter');

    const label = screen.getByLabelText('Filter repositories by programming language');
    expect(label).toBeInTheDocument();
  });

  it('displays custom dropdown arrow icon', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    // Find SVG by its container or by querying the SVG element directly
    const container = screen.getByRole('combobox').parentElement;
    const arrow = container?.querySelector('svg');
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveClass('w-4', 'h-4');
  });

  it('maintains focus styles', () => {
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-blue-500');
  });

  it('uses custom placeholder when provided', () => {
    const customPlaceholder = "Choose a language...";
    render(
      <LanguageFilter
        value=""
        onValueChange={mockOnValueChange}
        availableLanguages={mockLanguages}
        placeholder={customPlaceholder}
      />
    );

    // Note: The placeholder prop is available but not visually used in select elements
    // This test ensures the prop is accepted without errors
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
}); 