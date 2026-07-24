export default function isMobileDevice() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches
}
