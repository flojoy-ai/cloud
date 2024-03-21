import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_public/login')({
  component: () => <div>Hello /_public/login!</div>
})