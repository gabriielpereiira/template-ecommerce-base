'use client'
import { useEffect } from 'react'

export default function RippleProvider({ children }) {
  useEffect(() => {
    function handleClick(e) {
      const btn = e.currentTarget
      const existingRipple = btn.querySelector('.ripple')
      if (existingRipple) existingRipple.remove()

      const rect = btn.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 1.2
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      btn.appendChild(ripple)

      ripple.addEventListener('animationend', () => ripple.remove())
    }

    function addRippleListeners() {
      document.querySelectorAll('.btn').forEach(btn => {
        if (!btn.dataset.hasRipple) {
          btn.dataset.hasRipple = 'true'
          btn.addEventListener('click', handleClick)
        }
      })
    }

    addRippleListeners()
    const observer = new MutationObserver(addRippleListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return children
}