export default function stripText(raw: string): string {
  return raw.replace(/<[^>]*>/g, '').trim()
}
