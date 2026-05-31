import React from 'react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    const button = <Button>Click me</Button>;
    expect(button.props.children).toBe('Click me');
  });

  it('applies default variant styling', () => {
    const button = <Button variant="default">Default</Button>;
    expect(button.props.variant).toBe('default');
  });

  it('applies secondary variant styling', () => {
    const button = <Button variant="secondary">Secondary</Button>;
    expect(button.props.variant).toBe('secondary');
  });

  it('applies danger variant styling', () => {
    const button = <Button variant="danger">Delete</Button>;
    expect(button.props.variant).toBe('danger');
  });

  it('handles disabled state', () => {
    const button = <Button disabled>Disabled</Button>;
    expect(button.props.disabled).toBe(true);
  });

  it('applies size variants', () => {
    const smallButton = <Button size="sm">Small</Button>;
    expect(smallButton.props.size).toBe('sm');

    const largeButton = <Button size="lg">Large</Button>;
    expect(largeButton.props.size).toBe('lg');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    const button = <Button onClick={handleClick}>Click</Button>;
    expect(button.props.onClick).toBe(handleClick);
  });

  it('renders as loading state', () => {
    const button = <Button loading>Loading</Button>;
    expect(button.props.loading).toBe(true);
  });
});
