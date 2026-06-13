import { createPortal } from 'react-dom';

// Renders children at document.body, escaping any ancestor that uses
// transform/filter/backdrop-filter (which would otherwise trap a
// position:fixed overlay and clip it to that ancestor instead of the viewport).
export default function Portal({ children }) {
  return createPortal(children, document.body);
}
