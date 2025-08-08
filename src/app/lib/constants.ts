import { BookOpenCheck, FileCode, FileSpreadsheet, FileType2, Fingerprint, Languages, Network, Settings, Type, Watch } from 'lucide-react'

export const TOOLS = [
  { slug: 'bionic-reading', name: 'Bionic Reading', description: 'Emphasize word stems to read faster', icon: BookOpenCheck },
  { slug: 'handwriting-generator', name: 'Handwriting Generator', description: 'Render text as realistic handwriting', icon: Type },
  { slug: 'cron-generator', name: 'Cron Generator', description: 'Build cron expressions visually', icon: Watch },
  { slug: 'exif-remover', name: 'EXIF Remover', description: 'Strip metadata from images for privacy', icon: Fingerprint },
  { slug: 'timezone-planner', name: 'Timezone Planner', description: 'Find the best meeting time across zones', icon: Settings },
  { slug: 'json-csv-converter', name: 'JSON ⇄ CSV', description: 'Convert between JSON and CSV', icon: FileSpreadsheet },
  { slug: 'subnet-calculator', name: 'Subnet Calculator', description: 'Compute IPv4/IPv6 network details', icon: Network },
  { slug: 'image-base64', name: 'Image → Base64', description: 'Encode images to Base64 for web use', icon: FileType2 },
  { slug: 'braille-translator', name: 'Braille Translator', description: 'Convert text to Unicode Braille', icon: Languages },
  { slug: 'password-generator', name: 'Password Generator', description: 'Generate strong, customizable passwords', icon: FileCode },
]

