const noop = () => {}

// Webkit does not allow event.preventDefault() in dynamically added handlers
// So we add an always listening event handler to get around this :(
// webkit bug: https://bugs.webkit.org/show_bug.cgi?id=184250
const webkitHack = (() => {
  const stub = {
    preventTouchMove: noop,
    releaseTouchMove: noop,
  }

  // Do nothing when server side rendering
  if (typeof window === 'undefined') {
    return stub
  }

  // Device has no touch support - no point adding the touch listener
  if (!('ontouchstart' in window)) {
    return stub
  }

  // Not adding any user agent testing as everything pretends to be webkit

  let isBlocking = false

  // Adding a persistent event handler
  window.addEventListener('touchmove', (event) => {
    // We let the event go through as normal as nothing
    // is blocking the touchmove
    if (!isBlocking) {
      return
    }

    // Our event handler would have worked correctly if the browser
    // was not webkit based, or an older version of webkit.
    if (event.defaultPrevented) {
      return
    }

    // Okay, now we need to step in and fix things
    event.preventDefault()

    // Forcing this to be non-passive so we can get every touchmove
    // Not activating in the capture phase like the dynamic touchmove we add.
    // Technically it would not matter if we did this in the capture phase
  }, { passive: false, capture: false })

  const preventTouchMove = () => {
    isBlocking = true
  }
  const releaseTouchMove = () => {
    isBlocking = false
  }

  return { preventTouchMove, releaseTouchMove }
})()

export default webkitHack
