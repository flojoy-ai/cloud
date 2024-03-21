import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_public/signup')({
  component: () => <div>Hello /_public/signup!</div>
})