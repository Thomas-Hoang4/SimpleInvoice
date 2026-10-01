import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders SimpleInvoice application title', () => {
    render(<App />)
    expect(screen.getByText('SimpleInvoice')).toBeInTheDocument()
  })

  it('renders assessment subtitle and status', () => {
    render(<App />)
    expect(screen.getByText('101 Digital Technical Assessment')).toBeInTheDocument()
    expect(screen.getByText('Frontend Scaffolded Successfully')).toBeInTheDocument()
  })
})
