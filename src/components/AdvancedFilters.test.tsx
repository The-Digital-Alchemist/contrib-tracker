import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdvancedFilters from './AdvancedFilters';
import type { FilterOptions } from '../hooks/useCanonicalRepos';

const defaultFilters: FilterOptions = {
  search: '',
  language: '',
  sortBy: 'updated',
  sortOrder: 'desc',
  activityFilter: 'all',
  contributorFriendly: 'all',
  repositorySize: 'all',
  minStars: 0,
  hasRecentActivity: false,
};

const mockAvailableLanguages = ['TypeScript', 'Python', 'Go', 'JavaScript', 'Rust'];

describe('AdvancedFilters', () => {
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter sections correctly', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    // Check main sections
    expect(screen.getByText('🎯 Advanced Filters')).toBeInTheDocument();
    expect(screen.getByText('🔍 Search Repositories')).toBeInTheDocument();
    expect(screen.getByText('💻 Programming Language')).toBeInTheDocument();
    expect(screen.getByText('📈 Repository Activity')).toBeInTheDocument();
    expect(screen.getByText('🤝 Contributor Friendly')).toBeInTheDocument();
    expect(screen.getByText('📊 Repository Size')).toBeInTheDocument();
    expect(screen.getByText('⭐ Minimum Stars: 0')).toBeInTheDocument();
    expect(screen.getByText('⚡ Quick Filters')).toBeInTheDocument();
    expect(screen.getByText('📋 Sort By')).toBeInTheDocument();
    expect(screen.getByText('🔄 Sort Order')).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search by name, description...');
    fireEvent.change(searchInput, { target: { value: 'snapcraft' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'snapcraft' });
  });

  it('handles language filter changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const languageSelect = screen.getByDisplayValue('All Languages');
    fireEvent.change(languageSelect, { target: { value: 'Python' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ language: 'Python' });
  });

  it('handles activity filter changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const activitySelect = screen.getByDisplayValue('All Activity Levels');
    fireEvent.change(activitySelect, { target: { value: 'recent' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ activityFilter: 'recent' });
  });

  it('handles contributor friendly filter changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const contributorSelect = screen.getByDisplayValue('All Repositories');
    fireEvent.change(contributorSelect, { target: { value: 'good-first-issues' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ contributorFriendly: 'good-first-issues' });
  });

  it('handles repository size filter changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const sizeSelect = screen.getByDisplayValue('All Sizes');
    fireEvent.change(sizeSelect, { target: { value: 'medium' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ repositorySize: 'medium' });
  });

  it('handles minimum stars slider changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const starsSlider = screen.getByRole('slider');
    fireEvent.change(starsSlider, { target: { value: '100' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ minStars: 100 });
  });

  it('handles recent activity checkbox changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const recentActivityCheckbox = screen.getByLabelText('🕒 Updated This Week');
    fireEvent.click(recentActivityCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ hasRecentActivity: true });
  });

  it('handles sort by changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const sortBySelect = screen.getByDisplayValue('📅 Last Updated');
    fireEvent.change(sortBySelect, { target: { value: 'stars' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ sortBy: 'stars' });
  });

  it('handles sort order changes', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const sortOrderSelect = screen.getByDisplayValue('📉 Descending (High to Low)');
    fireEvent.change(sortOrderSelect, { target: { value: 'asc' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ sortOrder: 'asc' });
  });

  it('displays active filters correctly', () => {
    const activeFilters: FilterOptions = {
      ...defaultFilters,
      search: 'ubuntu',
      language: 'Python',
      activityFilter: 'recent',
      contributorFriendly: 'good-first-issues',
      minStars: 50,
    };

    render(
      <AdvancedFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    // Check active filter badges
    expect(screen.getByText('Search: "ubuntu"')).toBeInTheDocument();
    expect(screen.getByText('Language: Python')).toBeInTheDocument();
    expect(screen.getByText('Activity: recent')).toBeInTheDocument();
    expect(screen.getByText('Contributor: good-first-issues')).toBeInTheDocument();
    expect(screen.getByText('Min Stars: 50+')).toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', () => {
    const activeFilters: FilterOptions = {
      ...defaultFilters,
      search: 'test',
      language: 'Python',
      activityFilter: 'recent',
      minStars: 100,
    };

    render(
      <AdvancedFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: '',
      language: '',
      sortBy: 'updated',
      sortOrder: 'desc',
      activityFilter: 'all',
      contributorFriendly: 'all',
      repositorySize: 'all',
      minStars: 0,
      hasRecentActivity: false,
    });
  });

  it('displays minimum stars value correctly', () => {
    const filtersWithStars: FilterOptions = {
      ...defaultFilters,
      minStars: 250,
    };

    render(
      <AdvancedFilters
        filters={filtersWithStars}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    expect(screen.getByText('⭐ Minimum Stars: 250')).toBeInTheDocument();
  });

  it('disables all inputs when disabled prop is true', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
        disabled={true}
      />
    );

    // Check that inputs are disabled
    expect(screen.getByPlaceholderText('Search by name, description...')).toBeDisabled();
    expect(screen.getByRole('slider')).toBeDisabled();
    expect(screen.getByLabelText('🕒 Updated This Week')).toBeDisabled();
    expect(screen.getByText('Clear All').closest('button')).toBeDisabled();
  });

  it('handles activity filter options correctly', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const activitySelect = screen.getByDisplayValue('All Activity Levels');
    const options = Array.from(activitySelect.querySelectorAll('option')).map(option => option.textContent);

    expect(options).toContain('All Activity Levels');
    expect(options).toContain('🔥 Recently Updated (Last Month)');
    expect(options).toContain('✅ Active (Last 6 Months)');
    expect(options).toContain('⚠️ Stale (Over 1 Year Old)');
  });

  it('handles contributor friendly options correctly', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const contributorSelect = screen.getByDisplayValue('All Repositories');
    const options = Array.from(contributorSelect.querySelectorAll('option')).map(option => option.textContent);

    expect(options).toContain('All Repositories');
    expect(options).toContain('🌟 Has Good First Issues');
    expect(options).toContain('🚀 Highly Active');
    expect(options).toContain('🛠️ Well Maintained');
  });

  it('handles repository size options correctly', () => {
    render(
      <AdvancedFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        availableLanguages={mockAvailableLanguages}
      />
    );

    const sizeSelect = screen.getByDisplayValue('All Sizes');
    const options = Array.from(sizeSelect.querySelectorAll('option')).map(option => option.textContent);

    expect(options).toContain('All Sizes');
    expect(options).toContain('🐣 Small (< 100 stars)');
    expect(options).toContain('🏠 Medium (100-1000 stars)');
    expect(options).toContain('🏢 Large (1000+ stars)');
  });
}); 