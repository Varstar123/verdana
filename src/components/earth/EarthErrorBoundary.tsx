"use client";

import { Component, type ReactNode } from "react";

/**
 * Keeps a WebGL/shader failure from white-screening the page. If the 3D scene
 * throws (no WebGL, shader compile error, etc.), we render a styled fallback
 * orb instead.
 */
export class EarthErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
