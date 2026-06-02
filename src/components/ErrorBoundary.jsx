import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // In production, send to error tracking service here
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info.componentStack)
    }
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center"
          style={{ background: 'linear-gradient(160deg, #13052c 0%, #2d0a5e 55%, #071b39 100%)' }}
        >
          <div className="text-6xl">😕</div>
          <div>
            <p className="font-bubble text-white text-2xl mb-2">Something went wrong</p>
            <p className="font-round text-white/60 text-sm max-w-sm">
              Don't worry — your progress is saved. Try refreshing the page.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="font-round font-bold text-sm px-5 py-3 rounded-2xl text-white"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="font-round font-bold text-sm px-5 py-3 rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)' }}
            >
              Refresh page
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre className="text-left text-red-300 text-xs bg-black/30 rounded-xl p-4 max-w-lg overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
