import {
  AlertTriangle,
  ArrowRight,
  Check,
  MoveRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  Loader2,
  LucideProps,
  Moon,
  MoreVertical,
  Plus,
  Puzzle,
  Search,
  Settings,
  SunMedium,
  Trash,
  User,
  X,
  LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  add: Plus,
  arrowRight: ArrowRight,
  longArrowRight: MoveRight,
  billing: CreditCard,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  check: Check,
  close: X,
  ellipsis: MoreVertical,
  gitHub: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="github"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      ></path>
    </svg>
  ),
  google: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      {...props}
    >
      <path
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
        fill="currentColor"
      />
    </svg>
  ),
  help: HelpCircle,
  laptop: Laptop,
  logo: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 280"
      fill="none"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M249.977 250.359c13.183-13.098 21.716-29.494 24.741-47.515 3.476-20.687 5.282-41.825 5.282-62.827 0-21.003-1.716-41.599-5.147-62.014-6.23-37.353-35.53-66.621-72.867-72.854C181.535 1.761 160.677 0 140 0S97.923 1.761 77.246 5.285c-17.697 2.98-33.86 11.291-46.772 23.983l-.451.407C16.84 42.773 8.307 59.169 5.283 77.19 1.805 97.876 0 119.014 0 140.017c0 21.002 1.716 41.598 5.147 62.014 6.23 37.353 35.53 66.621 72.866 72.854 41.174 6.865 83.703 6.82 124.696-.136 17.697-2.981 33.86-11.291 46.772-24.029l.451-.406.045.045Zm-18.961-19.331-.361.316c-8.939 8.853-20.136 14.634-32.416 16.712-19.187 3.252-38.781 4.878-58.239 4.878s-38.555-1.581-57.517-4.743c-25.914-4.336-46.23-24.661-50.564-50.587-3.16-18.97-4.786-38.346-4.786-57.587 0-19.241 1.626-39.115 4.876-58.31C34.086 69.286 40 57.994 49.029 49.006l.271-.271c8.94-8.898 20.18-14.68 32.46-16.757 38.105-6.459 77.518-6.504 115.757-.136 25.914 4.337 46.23 24.662 50.564 50.587 3.161 18.97 4.786 38.347 4.786 57.588s-1.625 39.069-4.876 58.31c-2.077 12.421-7.991 23.713-17.02 32.701h.045ZM123.572 160.45a26.876 26.876 0 0 0 18.989-7.86l33.387-33.41a29.116 29.116 0 0 0 8.778-18.116 27.998 27.998 0 0 0-30.163-30.186 29.112 29.112 0 0 0-18.138 8.689l-33.409 33.477a26.71 26.71 0 0 0-7.86 18.989v19.459a8.958 8.958 0 0 0 8.957 8.958h19.459Zm-10.502-28.417a8.947 8.947 0 0 1 2.62-6.337l33.969-33.97a10.06 10.06 0 0 1 7.214-3.347 10.059 10.059 0 0 1 9.621 6.332 10.05 10.05 0 0 1-2.638 11.212l-33.969 33.992a8.957 8.957 0 0 1-6.315 2.62H113.07v-10.502Zm59.191 57.596c3.096 3.486 3.922 4.101 5.779 4.101 2.064 0 2.684-.41 5.986-4.101 0-.205.206-.205.206-.205 3.509-3.692 9.289-3.897 13.004-.41 3.715 3.486 3.922 9.228.413 12.92l-.148.164c-3.517 3.908-9.081 10.09-19.461 10.09-10.329 0-15.69-5.925-19.398-10.022l-.21-.232c-3.096-3.487-3.922-4.102-5.779-4.102-1.858 0-2.684.41-5.78 4.102l-.147.164c-3.518 3.908-9.081 10.09-19.461 10.09-10.33 0-15.69-5.925-19.398-10.022l-.21-.232c-3.096-3.487-3.922-4.102-5.78-4.102-1.857 0-2.683.41-5.779 4.102l-.413.41-.206.205c-3.716 3.486-9.495 3.486-13.004 0-3.508-3.487-3.508-9.434 0-12.92 3.51-4.307 8.876-10.254 19.402-10.254 10.33 0 15.691 5.924 19.399 10.022l.21.232c3.096 3.486 3.921 4.101 5.779 4.101s2.683-.41 5.779-4.101l.148-.164c3.517-3.908 9.081-10.09 19.461-10.09 10.329 0 15.69 5.924 19.398 10.022l.21.232Z"
      />
    </svg>
  ),
  media: Image,
  moon: Moon,
  page: File,
  post: FileText,
  search: Search,
  settings: Settings,
  spinner: Loader2,
  sun: SunMedium,
  trash: Trash,
  twitter: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="twitter"
      role="img"
      {...props}
    >
      <path
        d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0"
        fill="currentColor"
      />
    </svg>
  ),
  user: User,
  warning: AlertTriangle,
};
