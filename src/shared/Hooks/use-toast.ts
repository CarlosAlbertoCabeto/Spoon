// src/shared/hooks/useToast.ts 
import { toast } from '@/shared/components/ui/Toast/use-toast'

type ToastProps = {
  title?: string
  description: string
  variant?: 'default' | 'destructive'
  duration?: number
  action?: React.ReactElement
}

export const useToast = () => {
  const showToast = ({
    title,
    description,
    variant = 'default',
    duration = 5000,
    action
  }: ToastProps) => {
    return toast({
      title,
      description,
      variant,
      duration,
      action
    })
  }

  return { toast: showToast }
}